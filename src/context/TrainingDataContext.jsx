import{createContext,useContext,useEffect,useMemo,useState}from"react";
const Context=createContext(null);
export function TrainingDataProvider({children}){
  const[state,setState]=useState({status:"loading",data:null,error:null});
  const load=()=>{setState(current=>({...current,status:"loading",error:null}));return fetch(`${import.meta.env.BASE_URL}data/training-data.json`,{cache:"no-store"}).then(response=>{if(!response.ok)throw new Error(`HTTP ${response.status}`);return response.json()}).then(data=>setState({status:"ready",data,error:null})).catch(error=>setState({status:"error",data:null,error:error.message}))};
  useEffect(()=>{load()},[]);
  const value=useMemo(()=>({status:state.status,error:state.error,data:state.data,days:state.data?.days??[],seasons:state.data?.seasons??[],generatedAt:state.data?.generatedAt??null,reload:load}),[state]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useTrainingData(){const value=useContext(Context);if(!value)throw new Error("useTrainingData must be used inside TrainingDataProvider");return value}
