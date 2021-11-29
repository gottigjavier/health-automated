
import { useEffect, useState, useContext } from 'react';
import './task-modal.css';
import {formattingDate, formattingTime} from '../../../services/formattingDateTime';
import AppContext from '../../../context/appContext'

function EditTaskModal({ hideTaskModal, show, task, taskBedAndIndex}) {
    const showHideClassName = show ? "modal display-block" : "display-none";
    const bedIdSplit = taskBedAndIndex.split(','); 
    const room = bedIdSplit[0];
    const bed = bedIdSplit[1];
    const taskIndex = bedIdSplit[2];
    const [textResponse, setTextResponse] = useState(task.task)
    const [programedDate, setProgramedDate] = useState()
    const [programedTime, setProgramedTime] = useState()
    const [doneDate, setDoneDate] = useState()
    const [doneTime, setDoneTime] = useState()
    const [programedBy, setProgramedBy] = useState(task.programed_by)
    const [doneBy, setDoneBy] = useState(task.action_done_by)
    const [taskState, setTaskState] = useState(task.active)
    const context = useContext(AppContext);
    const [appState, setAppState] = context;
    const [repeatIsChecked, setRepeatIsChecked] = useState(false)
    
    useEffect(() => {
        // fill input date and input time (firefox don't work with input datetime-local)
        
        setProgramedDate(formattingDate('y-m-d', task.programed_time))
        setProgramedTime(formattingTime('h:m', task.programed_time))
        setDoneDate(formattingDate('y-m-d', task.done_time))
        setDoneTime(formattingTime('h:m', task.done_time))
        setTextResponse(textResponse => textResponse = task.task)
    }, [])

    
    const saveTask = (event) => {
        const programedDT = `${programedDate} ${programedTime}`
        const doneDT = `${doneDate} ${doneTime}`
        const taskId = task.id;
        const programer = programedBy;
        const maker = doneBy;
        let textAction = textResponse;
        const timeNow = new Date();
        const currentBed = room + ',' + bed;
        let active = taskState;
        let state = 'soon';
        if(Date.parse(doneDT) < Date.parse(timeNow)){
            textAction = `${textResponse}(Done)`
            active = false
        }
        if(Date.parse(programedDT) - Date.parse(timeNow) > 600000){
            state = 'later'
        } 
        else if(Date.parse(programedDT) - Date.parse(timeNow) > 0 && Date.parse(programedDT) - Date.parse(timeNow) < 1800000){
            state = 'soon'
        } else if (Date.parse(programedDT) - Date.parse(timeNow) < 0) {
            state = 'passed'
        }
        fetch('http://localhost:8000/nursing/edit_task', {
            method: 'PUT',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'crossorigin': 'anonymous',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({
                taskId,
                currentBed,
                programedDT,
                doneDT,
                programer,
                maker,
                textAction,
                state,
                active
            })
        })
        .then(response =>  response.json())  
        .then(result => {
            setAppState(result) //updates the context
        })
        .catch(error => {
            console.log(`An ERROR occurred while save the Edtited Task, ${error}`);        
        })
        setTextResponse('')
        hideTaskModal()
        event.preventDefault()
    }

    const doneTask = () => {
        setDoneDate(formattingDate('y-m-d', new Date()))
        setDoneTime(formattingTime('h:m:s', new Date()))
        setTaskState(false)
        setTextResponse(textResponse => textResponse = `${textResponse}(Done)`)
    } 
    
    const deleteTask = event => {
        const taskPk = task.id;
        const currentBed = room + ',' + bed;
        const reapeatTasksId = task.repeat_id
        fetch('http://localhost:8000/nursing/delete_task', {
            method: 'POST',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'crossorigin': 'anonymous',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({
                taskPk,
                currentBed,
                reapeatTasksId,
                repeatIsChecked
            })
        })
        .then(response =>  response.json())  
        .then(result => {
            setAppState(result) //updates the context
        })
        .catch(error => {
            console.log(`An ERROR occurred while delete Task, ${error}`);        
        })
        hideTaskModal()
        event.preventDefault()
    }

    const noSaveTask = event => {
        setTextResponse('')
        setProgramedBy('')
        setDoneBy('')
        hideTaskModal()
        event.preventDefault()
    }


    return (
        <>
        <div className={showHideClassName}>
            <section className="modal-task">
                <div className="container">
                    <div className="row justify-content-center task-modal-title">
                        <h3 id="task-modal-title" className="text-center text-title">
                            <b>Edit Task</b>
                        </h3>
                    </div>   
                    <form onSubmit={saveTask} id="task-form" className="form-container">
                        <div id="task-place" className="row shdw">
                            <p className="modal-subtitle col text-center">List Position: <b>{parseInt(taskIndex) + 1}</b></p>
                            <p className="modal-subtitle col text-center">Room: <b>{room}</b></p>
                            <p className="modal-subtitle col text-center">Bed: <b>{bed}</b></p>
                        </div>
                        <div>
                            <p className="modal-subtitle col text-center">Patient</p>
                            <p className='text-center'><b>{task.patient}</b></p>
                        </div>
                        <div className="row">                            
                            <div id="task-programed-time" className="col time-box shdw">
                                <p className="text-center modal-subtitle">Schedule</p>
                                <p className='task-label'>Programed By </p>
                                <input type='text' id='programed-by' name='programed-by' className= 'tx-box ml-3 mb-1'
                                onChange= {event => setProgramedBy(event.target.value)} value={programedBy} placeholder={task.programed_by}/>
                                <hr/>
                                <input type="date" id="programed-to" name="programed-to" className= 't-box mb-1'
                                    onChange={event => setProgramedDate(event.target.value)} value={programedDate}
                                />
                                <input type="time" id="programed" name="programed" className= 't-box mb-1'
                                    onChange={event => setProgramedTime(event.target.value)} value={programedTime}
                                />
                            </div>
                            <div id="task-done-time" className="col time-box shdw">
                                <p className="text-center modal-subtitle">(Will) Done at</p>
                                <p className='task-label'>Done By</p>
                                <input disabled={false} type='text' id='done-by' name='done-by' className= 'tx-box ml-3 mb-1'
                                onChange= {event => setDoneBy(event.target.value)} value={doneBy} placeholder={task.action_done_by}/>
                                <hr/>
                                <input disabled={false} type="date" id="done" name="done" className= 't-box mb-1'
                                    onChange={event => setDoneDate(event.target.value)} value={doneDate}
                                />
                                <input disabled={false} type="time" id="done" name="done" className= 't-box mb-1'
                                    onChange={event => setDoneTime(event.target.value)} value={doneTime}
                                />
                            </div>
                        </div>
                        <div className="justify-content-center row"> 
                            <label className="modal-subtitle col text-center"><b>Action</b>     
                                <textarea onChange={event => setTextResponse(event.target.value)} value={textResponse} id="action-text" className="text-box shdw" placeholder={task.task} name="answer-task" maxlength="1000" />
                            </label>
                        </div>
                        <div id="task-form-buttons" className="row">
                            <div id="new-edit-button" className="col ml-3">
                                <button onClick={doneTask} id="task-done" className="shdw done btn m-1" title="Just Done">Just Done</button>
                                <input type="submit" value="Save Edited" id="task-send" className="shdw save btn m-1" title="Send"/>
                            </div>
                            <div className='col border border-secondary mt-1 mb-4 mx-4'>
                                <button onClick={deleteTask} id="task-delete" className="shdw delete btn m-1 float-left" title="Delete Task">Delete Task</button>
                                    <label className='align-middle mycheck-box'>
                                    <input type='checkbox' id='check-repeat' name='check-repeat' className= ''
                                    onChange= {event => setRepeatIsChecked(event.target.checked)} checked={repeatIsChecked}/>
                                    <span className='task-label ml-1'> All occurrences</span>
                                </label>
                            </div>
                        </div>
                    </form>
                    <button type="button" id="task-close" className="shdw discard btn mx-3 mb-2 float-right" title="Discard" onClick={noSaveTask}>
                        Discard Changes
                    </button>
                </div>
            </section>
        </div>
        </>
    )
}

export default EditTaskModal;

