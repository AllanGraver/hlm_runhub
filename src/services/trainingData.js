export const TEAM_PROGRAM_MAP={
  "Hold 1":"hold1",
  "Hold 2":"hold2",
  "Hold 3":"hold3",
  "Skagen M":"skagen",
  "Berlin HM":"berlin",
  "CPH Marathon":"cph",
};
export const REST_TITLES=new Set(["","hvile"]);
export function programKeyForTeam(team){return TEAM_PROGRAM_MAP[team]||"hold2"}
export function programForDay(day,team){return day?.programs?.[programKeyForTeam(team)]||null}
export function isTraining(program){return Boolean(program&&!REST_TITLES.has(String(program.title||"").trim().toLowerCase()))}
export function sortedDays(days=[]){return [...days].filter(day=>day?.date).sort((a,b)=>a.date.localeCompare(b.date))}
export function upcomingTraining(days,team,now=new Date()){
  const today=new Date(now.getFullYear(),now.getMonth(),now.getDate()).toISOString().slice(0,10);
  return sortedDays(days).find(day=>day.date>=today&&isTraining(programForDay(day,team)))||null;
}
export function daysForMonth(days,year,month){return sortedDays(days).filter(day=>{const date=new Date(`${day.date}T12:00:00`);return date.getFullYear()===year&&date.getMonth()===month})}
export function formatDate(value,options={weekday:"long",day:"numeric",month:"long"}){if(!value)return"Dato mangler";return new Intl.DateTimeFormat("da-DK",options).format(new Date(`${value}T12:00:00`))}
export function zoneLabel(program){if(!program)return"";const zone=String(program.zone||"").trim();if(zone)return zone;const match=String(program.title||"").match(/\(([^)]+)\)/);return match?.[1]||""}
