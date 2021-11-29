import {useEffect, useContext} from 'react';
import './App.css';
import './bootstrap.css'
import {fetchLoad} from './services/http-queries'
import Sketch from './components/rooms-beds-sketch/Sketch'
import CallsList from './components/calls-list/CallsList'
import TasksList from './components/tasks-list/TasksList'
import AppContext from './context/appContext'
import {appManager} from './services/app-socket';

function HealthApp (){  
  const [appState, setAppState] = useContext(AppContext);
  const places = {
        numBeds: 4,
        numRooms: 30
      }

  // good practice to async fetch !!
  const initialLoad = () =>{
    fetchLoad()
      .then(initialData => {
        //setAppState(initialData)
        console.log({initialData})
      })
  }
  
  useEffect(()=>{
    initialLoad()
    appManager({handleApp})
  }, [])

  const handleApp = msg => {
    msg && setAppState(msg)
  }
  
  return (
  <>
    {!appState ? 
      <>
      <p className='bg-info text-white loading-text'>Loading ... </p>
      <p className='bg-info text-white loading-text'>Please wait a moment.</p>
      <p className='bg-secondary text-white loading-text'>If this takes too long then you can press F5</p> 
      </>
      
      :
      
        <div className="container justify-content-center w-100">
          <div className="row">
            <div className="col-2">
              <TasksList
                  key = {'tasksComponent'}
                  places = {places}
              />
            </div>
            <div className="col-8">
              <Sketch
                  key = {'sketchComponent'}
                  places= {places}
              />
            </div>
            <div className="col-2">
              <CallsList
                  key = {'callsComponent'}
                  places= {places}
              />
            </div>
          </div>
        </div>
    
  }
  </>
  )
}
export default HealthApp;

