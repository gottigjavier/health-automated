import Task from './task/Task'
import {useContext, useEffect, useState} from 'react';
import './tasks-list.css'
import {tasksManager} from '../../services/tasks-socket'
import AppContext from '../../context/appContext'
import sound from '../../media/call-bell.mp3'
import {Howl} from 'howler';


function TasksList({places}){
    const [appState, setAppState] = useContext(AppContext);
    const tasksList = appState.tasks || []
    const [tList, setTList] = useState(appState.tasks)
    const [bList, setBList] = useState(appState.beds)
    const [showButton, setShowButton] = useState(true)
    
    // Setup the new Howl.
    const sounder = new Howl({
        src: [sound]
    });
    
    useEffect(()=> {
    tasksManager({handleTasks}) // task websocked connect          
    },[])
    
    useEffect(()=> {
        setAppState({
            ...appState,
            tasks :  tList,
            beds :  bList
        })          
        alertTask()
    } ,[bList, tList])
        

    const handleTasks = msg => {
        setTList(msg.tasks_list)
        setBList(msg.beds_list)
    }

    const alertTask = () => {
        setShowButton(false)
        let passed = false;
        tasksList.map(task => {
            if(task.state === 'passed') {
                passed = true
            }
            return passed
        })
        if(passed) {
            sounder.play();
        } 
    }

    return (
        <>
            <div id='tasks-head' className="row task-title justify-content-center shdw rounded my-2">
                <p id='tasks-title' className='task-title-text'>Tasks</p>
            </div>
            {showButton &&
                <button onClick={alertTask}>Active sound</button>
            }
            <div className="tasks-col">
            { tasksList.length > 0 &&
                tasksList.map( (task, index) => {
                    const taskBedAndIndex = `${task.bed},${index}`;
                    return (
                        <Task 
                        task = {task}
                        key = {taskBedAndIndex}
                        taskBedAndIndex = {taskBedAndIndex}
                        places = {places}
                        />
                    )
                })
            }
            </div>
        </>
    )
}
export default TasksList;