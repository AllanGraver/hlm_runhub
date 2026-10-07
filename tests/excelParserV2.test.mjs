import assert from"node:assert/strict";import*as XLSX from"xlsx";import{parseHlmWorkbook}from"../scripts/excelParserV2.mjs";
const rows=[
 ["Træningsplan for sæson:",2025,2026],[],
 ["Ugedag","Dato","Noter","HOLD 1 (0 => 3km / 5km)","Detaljer","Min Gang","Min løb","Total min","HOLD 2 (5 => 10km)","Km","HOLD 3 (10 => 21km)","Km","TRÆNINGSFORSLAG SKAGEN M (10K => HM)","Km","Forskel","TRÆNINGSFORSLAG BERLIN HM (10K => HM)","Km","Forskel","TRÆNINGSFORSLAG CPH MARATHON (10K-M)","Km","Forskel"],
 [40,45929,45935,"M","Distance pr. uge =",120,null,null,"M","Distance pr. uge =","H","Distance pr. uge ="],
 ["Mandag",45929,"Selvtræning","Gang","Min. 30 min",30,null,30,"Løb / Gå",4,"Intervalløb (M-AE1)",8,"Træningsløb",10,2,"Restitutionsløb",12,4,"Hvile",null,null],
 ["Tirsdag",45930,"","Hvile",null,null,null,null,"Hvile",null,"Hvile",null,"Hvile",null,null,"Hvile",null,null,"Hvile",null,null],
 ["Onsdag",45931,"Fælles træning","Løb / Gå","6 x 2½min",30,15,45,"Intervalløb (I-AN1)",5,"Intervalløb (I-AN2)",8,"Racepace løb",5,-3,"Racepace løb",10,2,"Racepace løb",14,6]
];
const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(rows),"Træningsprogram 2526");XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([["Info"]]),"Info");
const result=parseHlmWorkbook(wb);assert.equal(result.seasons.length,1);assert.equal(result.days.length,3);assert.equal(result.days[0].week,40);assert.equal(result.days[0].date,"2025-09-29");assert.equal(result.days[0].programs.hold2.title,"Løb / Gå");assert.equal(result.days[0].programs.hold2.amount,4);assert.equal(result.days[2].programs.hold3.zone,"I-AN2");assert.equal(result.days[2].programs.skagen.difference,-3);assert.equal(result.days[2].notes,"Fælles træning");console.log("ExcelParserV2 OK",result.days.length,"dagsrækker");
