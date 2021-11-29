
import { useEffect, useState, useContext } from 'react';
import './task-modal.css';
import {addMinutes} from '../../../services/handlingDateTime'
import {formattingDate, formattingTime} from '../../../services/formattingDateTime'
import AppContext from '../../../context/appContext'
import AlertModal from './AlertModal'

export default function NewTaskModal({currentBed, handleShowNewTask, hideBedModal}) {
    const room = currentBed.bed_id.split(',')[0];
    const bed = currentBed.bed_id.split(',')[1];
    const defaultProgramedTime = addMinutes(new Date(), 30);
    const defaultDoneTime = addMinutes(new Date(), 150);
    const [programedDate, setProgramedDate] = useState()
    const [programedTime, setProgramedTime] = useState()
    const [doneDate, setDoneDate] = useState()
    const [doneTime, setDoneTime] = useState()
    const [textResponse, setTextResponse] = useState('')
    const [programedBy, setProgramedBy] = useState()
    const [doneBy, setDoneBy] = useState('Anonymous')
    const context = useContext(AppContext);
    const [appState, setAppState] = context;
    const [repeatIsChecked, setRepeatIsChecked] = useState(false)
    const [repeatUntilDate, setRepeatUntilDate] = useState()
    const [repeatUntilTime, setRepeatUntilTime] = useState()
    const [repeatLapse, setRepeatLapse] = useState(2)
    const [repeatLapseUnit, setRepeatLapseUnit] = useState('hours')
    const [alertShow, setAlertShow] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    
    useEffect(() => {
        // fill input date and input time (firefox don't work with input datetime-local)
        
        setProgramedDate(formattingDate('y-m-d', defaultProgramedTime))
        setProgramedTime(formattingTime('h:m', defaultProgramedTime))
        setDoneDate(formattingDate('y-m-d', defaultDoneTime))
        setDoneTime(formattingTime('h:m', defaultDoneTime))
        setRepeatUntilDate(formattingDate('y-m-d', currentBed.bed_planed_vacate))
        setRepeatUntilTime(formattingTime('h:m', currentBed.bed_planed_vacate))
    }, [])
    
    const openAlertShow = () => {
        setAlertShow(true)
    }
    const hiddeAlertShow = () => {
        setAlertShow(false)
    }

    const saveTask = (event) => {
        const bedId = currentBed.id;
        const programedDT = `${programedDate} ${programedTime}`;
        const doneDT = `${doneDate} ${doneTime}`;
        const repeatUntil = `${repeatUntilDate} ${repeatUntilTime}`
        const programer = programedBy || 'Anonymous';
        const textAction = textResponse || 'Routine Task';
        let state = 'soon';
        const timeNow = new Date();
        if(Date.parse(programedDT) < Date.parse(timeNow)){
            setAlertMessage('You are trying to schedule a time that has already passed')
            event.preventDefault()
            return openAlertShow()
        }
        else if(Date.parse(repeatUntil) < Date.parse(timeNow)){
            setAlertMessage('You are trying to schedule until an hour that has already passed')
            event.preventDefault()
            return openAlertShow()
        }
        else {
            if(Date.parse(programedDT) - Date.parse(timeNow) > 600000){
                state = 'later'
            }
            fetch('http://localhost:8000/nursing/new_task', {
                method: 'POST',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'crossorigin': 'anonymous',
                    'Cache-Control': 'no-cache'
                },
                body: JSON.stringify({
                    bedId,
                    programedDT,
                    doneDT,
                    programer,
                    textAction,
                    state,
                    repeatIsChecked,
                    repeatLapseUnit,
                    repeatUntil,
                    repeatLapse
                })
            })
            .then(response =>  response.json())  
            .then(result => {
                setAppState(result) //updates the context
            })
            .catch(error => {
                console.log(`An ERROR occurred while save New Task, ${error}`);        
            })
            setTextResponse('')
            hideBedModal()
            event.preventDefault()
        }
    }

    const noSaveTask = event => {
        setTextResponse('')
        setProgramedBy('')
        setDoneBy('')
        hideBedModal()
        event.preventDefault()
    }


    return (
        <>
        <div className="container">
            <div className="row justify-content-center task-modal-title shdw">
                <h3 id="task-modal-title" className="text-center text-title">
                    <b>New Task</b>
                </h3>
            </div>   
            <div id="task-place" className="row shdw">
                <p className="modal-subtitle col text-center">Room: <b>{room}</b></p>
                <p className="modal-subtitle col text-center">Bed: <b>{bed}</b></p>
            </div>
            <div>
            <p className="modal-subtitle col text-center">Patient</p>
            <p className='text-center'><b>{currentBed.patient}</b></p>
            </div>
        </div>
        <div className='container shdw'>
            <form onSubmit={saveTask} id="task-form">
                <div className="row">                            
                    <div id="task-programed-time" className="col time-box shdw">
                        <p className="text-center modal-subtitle">Schedule</p>
                        <p className='task-label'>Programed By </p>
                        <input type='text' id='programed-by' name='programed-by' className= 'tx-box ml-3 mb-1'
                        onChange= {event => setProgramedBy(event.target.value)} value={programedBy} placeholder={'Anonymous'}/>
                        <hr/>
                        <input type="date" id="programed-to" name="programed-to" className= 't-box mb-1'
                            onChange={event => setProgramedDate(event.target.value)} value={programedDate}
                        />
                        <input type="time" id="programed" name="programed" className= 't-box mb-1'
                            onChange={event => setProgramedTime(event.target.value)} value={programedTime}
                        />
                    </div>
                    <div id="repeat-task" className="col time-box shdw">
                        <div className="text-center modal-subtitle mb-2">
                        <span>Repeat</span>
                            <input type='checkbox' id='check-repeat' name='check-repeat' className= 'ml-3 mb-1'
                            onChange= {event => setRepeatIsChecked(event.target.checked)} checked={repeatIsChecked}/>
                        </div>
                        <p className='task-label'>Every: </p>
                        <input type='number' id='repeat-count' name='repeat-count' className='number-box ml-3 mb-1'
                        onChange= {event => setRepeatLapse(event.target.value)} value={repeatLapse} placeholder={2}/>
                        <select onChange= {event => setRepeatLapseUnit(event.target.value)} value= {repeatLapseUnit} className='select-box ml-1 mb-1'>
                            <option value='minutes'>minutes</option>
                            <option value='hours'>hours</option>
                            <option value='days'>days</option>
                        </select>
                        <hr/>
                        <p className='task-label'>Until </p>
                        <input disabled={false} type="date" id="done" name="done" className='t-box'
                            onChange={event => setRepeatUntilDate(event.target.value)} value={repeatUntilDate}
                        />
                        <input disabled={false} type="time" id="done" name="done" className= 't-box '
                            onChange={event => setRepeatUntilTime(event.target.value)} value={repeatUntilTime}
                        />
                    </div>
                </div>
                <div className="justify-content-center row"> 
                    <label className="modal-subtitle col text-center"><b>Action</b>     
                        <textarea onChange={event => setTextResponse(event.target.value)} value={textResponse} id="action-text" className="text-box shdw" placeholder={'Enter new task'} name="answer-task" maxlength="1000" />
                    </label>
                </div>
                <div id="task-form-buttons" className="row">
                    <div id="new-edit-buttons" className="col">
                        <input type="submit" value="Save" id="task-send" className="shdw save btn m-2 float-right" title="Send"/>
                    </div>
                </div>
            </form>
            <button type="button" id="task-close" className="shdw discard btn m-2 float-right" title="Discard" onClick={noSaveTask}>
                Discard Changes
            </button>
        </div>
        { alertShow &&
            <AlertModal
                alertShow = {alertShow}
                hiddeAlertShow = {hiddeAlertShow}
                alertMessage = {alertMessage}
            />
        }
        </>
    )
}
