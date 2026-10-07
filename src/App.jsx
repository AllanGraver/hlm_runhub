import{useState}from"react";
import AppShell from"./components/AppShell";
import WorkoutDetail from"./components/WorkoutDetail";
import TrainingPage from"./pages/TrainingPage";
import CalendarPage from"./pages/CalendarPage";
import RaceCenterPage from"./pages/RaceCenterPage";
import PerformancePage from"./pages/PerformancePage";
import GuidesPage from"./pages/GuidesPage";
import ToolsPage from"./pages/ToolsPage";
import{RaceProvider}from"./context/RaceContext";
import{TrainingDataProvider}from"./context/TrainingDataContext";
export default function App(){const[page,setPage]=useState("training"),[team,setTeam]=useState("Hold 2"),[menu,setMenu]=useState(false),[selectedDay,setSelectedDay]=useState(null),[vdot,setVdot]=useState(42);const content=page==="training"?<TrainingPage team={team} openWorkout={setSelectedDay}/>:page==="calendar"?<CalendarPage team={team} openWorkout={setSelectedDay}/>:page==="race"?<RaceCenterPage/>:page==="performance"?<PerformancePage vdot={vdot} setVdot={setVdot}/>:page==="guides"?<GuidesPage/>:<ToolsPage/>;return <RaceProvider><TrainingDataProvider><AppShell page={page} setPage={setPage} team={team} setTeam={setTeam} menu={menu} setMenu={setMenu}>{content}</AppShell>{selectedDay&&<WorkoutDetail day={selectedDay} team={team} close={()=>setSelectedDay(null)}/>}</TrainingDataProvider></RaceProvider>}
