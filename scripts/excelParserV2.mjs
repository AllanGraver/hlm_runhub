import * as XLSX from "xlsx";

const DAYS=["mandag","tirsdag","onsdag","torsdag","fredag","lørdag","søndag"];
const norm=v=>String(v??"").replace(/\s+/g," ").trim();
const key=v=>norm(v).toLowerCase().replaceAll("æ","ae").replaceAll("ø","oe").replaceAll("å","aa");
const nonEmpty=v=>v!==null&&v!==undefined&&norm(v)!=="";
const isDay=v=>DAYS.includes(key(v));
const dayIndex=v=>DAYS.indexOf(key(v));
const isWeek=v=>Number.isInteger(Number(v))&&Number(v)>=1&&Number(v)<=53;
const isSerial=v=>Number.isFinite(Number(v))&&Number(v)>30000&&Number(v)<70000;
const isLoad=v=>["l","m","h"].includes(key(v));

function excelDate(value){
  if(value instanceof Date&&!Number.isNaN(value.valueOf()))return value.toISOString().slice(0,10);
  if(isSerial(value)){const d=new Date(Date.UTC(1899,11,30)+Number(value)*86400000);return d.toISOString().slice(0,10)}
  const text=norm(value),m=text.match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{2,4})$/);
  if(m){const y=m[3].length===2?`20${m[3]}`:m[3];return`${y}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`}
  return null;
}
function addDays(iso,amount){if(!iso)return null;const d=new Date(`${iso}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+amount);return d.toISOString().slice(0,10)}
function findHeaderRow(matrix){
  for(let r=0;r<Math.min(matrix.length,80);r++){
    const values=matrix[r].map(key);
    if(values.includes("ugedag")&&values.includes("dato")&&values.includes("noter"))return r;
  }
  return-1;
}
function classifyHeader(text,index){
  const k=key(text);
  if(k.startsWith("hold 1"))return{id:"hold1",label:"Hold 1",kind:"team",index};
  if(k.startsWith("hold 2"))return{id:"hold2",label:"Hold 2",kind:"team",index};
  if(k.startsWith("hold 3"))return{id:"hold3",label:"Hold 3",kind:"team",index};
  if(k.includes("skagen"))return{id:"skagen",label:"Skagen M",kind:"race",index};
  if(k.includes("berlin"))return{id:"berlin",label:"Berlin HM",kind:"race",index};
  if(k.includes("cph")||k.includes("copenhagen"))return{id:"cph",label:"CPH Marathon",kind:"race",index};
  return null;
}
function discoverColumns(matrix,headerRow){
  const row=matrix[headerRow]||[],columns={weekday:row.findIndex(v=>key(v)==="ugedag"),date:row.findIndex(v=>key(v)==="dato"),notes:row.findIndex(v=>key(v)==="noter")};
  const programs=[];
  for(let c=0;c<row.length;c++){const found=classifyHeader(row[c],c);if(found)programs.push(found)}
  programs.sort((a,b)=>a.index-b.index);
  programs.forEach((program,i)=>program.end=(programs[i+1]?.index??row.length)-1);
  return{columns,programs};
}
function compactCells(row,start,end){return row.slice(start,end+1).map((value,offset)=>({column:start+offset,value})).filter(cell=>nonEmpty(cell.value))}
function parseProgram(row,program){
  const cells=compactCells(row,program.index,program.end);
  const texts=cells.filter(c=>typeof c.value==="string"&&norm(c.value)).map(c=>norm(c.value));
  const numbers=cells.filter(c=>Number.isFinite(Number(c.value))&&norm(c.value)!=="").map(c=>Number(c.value));
  const title=texts[0]||"";
  const details=texts.slice(1).join(" · ");
  let amount=null,amountType=null,difference=null;
  if(numbers.length){
    amount=numbers[0];
    amountType=program.id==="hold1"?/gang|løb|hvile/i.test(title)?"minutes":"value":"distanceKm";
    if(program.kind==="race"&&numbers.length>1)difference=numbers[numbers.length-1];
  }
  const zone=(title.match(/\(([^)]+)\)/)?.[1]||"").trim();
  return{title,details,zone,amount,amountType,difference,cells};
}
function findWeekContext(matrix,rowIndex,weekdayCol,dateCol){
  for(let r=rowIndex-1;r>=Math.max(0,rowIndex-8);r--){
    const row=matrix[r]||[];
    if(isWeek(row[weekdayCol])){
      const serials=row.filter(isSerial).map(Number);
      const loads=row.filter(isLoad).map(v=>norm(v).toUpperCase());
      return{week:Number(row[weekdayCol]),weekStart:excelDate(serials[0]),weekEnd:excelDate(serials[1]),loads};
    }
  }
  return{week:null,weekStart:null,weekEnd:null,loads:[]};
}
function resolveDates(days){
  for(let i=0;i<days.length;i++)if(!days[i].date){
    const sameWeek=days.filter(d=>d.week===days[i].week&&d.date);
    const anchor=sameWeek[0];
    if(anchor)days[i].date=addDays(anchor.date,dayIndex(days[i].weekday)-dayIndex(anchor.weekday));
    else if(days[i].weekStart)days[i].date=addDays(days[i].weekStart,dayIndex(days[i].weekday));
  }
}
function seasonFromSheet(name){const m=name.match(/(\d{2})\D?(\d{2})/);return m?{startYear:2000+Number(m[1]),endYear:2000+Number(m[2])}:null}

export function parseHlmWorkbook(input,{sheetPattern=/træningsprogram|traeningsprogram/i}={}){
  const workbook=input?.SheetNames?input:XLSX.read(input,{type:"array",cellDates:true});
  const seasons=[];
  for(const sheetName of workbook.SheetNames.filter(name=>sheetPattern.test(name))){
    const sheet=workbook.Sheets[sheetName];
    const matrix=XLSX.utils.sheet_to_json(sheet,{header:1,defval:null,raw:true,blankrows:false});
    const headerRow=findHeaderRow(matrix);
    if(headerRow<0){seasons.push({sheet:sheetName,error:"Header med Ugedag, Dato og Noter blev ikke fundet",days:[]});continue}
    const{columns,programs}=discoverColumns(matrix,headerRow);
    const days=[];
    for(let r=headerRow+1;r<matrix.length;r++){
      const row=matrix[r]||[];
      if(!isDay(row[columns.weekday]))continue;
      const context=findWeekContext(matrix,r,columns.weekday,columns.date);
      const programsData=Object.fromEntries(programs.map(program=>[program.id,parseProgram(row,program)]));
      days.push({id:`${sheetName}-${r+1}`,sheet:sheetName,sourceRow:r+1,season:seasonFromSheet(sheetName),week:context.week,weekStart:context.weekStart,weekEnd:context.weekEnd,loads:{hold1:context.loads[0]||null,hold2:context.loads[1]||null,hold3:context.loads[2]||null},weekday:norm(row[columns.weekday]),date:excelDate(row[columns.date]),notes:norm(row[columns.notes]),programs:programsData});
    }
    resolveDates(days);
    seasons.push({sheet:sheetName,season:seasonFromSheet(sheetName),headerRow:headerRow+1,columns,programColumns:programs.map(({id,label,kind,index,end})=>({id,label,kind,startColumn:index+1,endColumn:end+1})),days});
  }
  const allDays=seasons.flatMap(s=>s.days||[]);
  return{parserVersion:2,generatedAt:new Date().toISOString(),seasons,days:allDays,teams:["hold1","hold2","hold3"],racePlans:["skagen","berlin","cph"],warnings:seasons.filter(s=>s.error).map(s=>`${s.sheet}: ${s.error}`)};
}
