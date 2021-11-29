import {useState} from 'react';
import './App.css';
import AppContext from './context/appContext'
import HealthApp from './HealthApp'

function App (){  
  const [appState, setAppState] = useState();
  
  return (
  <AppContext.Provider value= {
        [appState, setAppState]
      }>
    <HealthApp />
  </AppContext.Provider>
  )
}
export default App;