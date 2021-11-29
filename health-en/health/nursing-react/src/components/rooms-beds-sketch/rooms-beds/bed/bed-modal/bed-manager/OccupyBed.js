import {useContext, useState} from 'react';
import AppContext from '../../../../../../context/appContext'
import './bed-manager.css'
import {formattingDate, formattingTime} from '../../../../../../services/formattingDateTime'
import {addDays} from '../../../../../../services/handlingDateTime'
import AlertModal from '../../../../../tasks-list/task-modal/AlertModal'


export default function OccupyBed({currentBed, handleShowInfo}){
    const [appState, setAppState] = useContext(AppContext);
    const [patientName, setPatientName] = useState('')
    //const [patientCard, setPatientCard] = useState() (only in some countries)
    const [patientSocial, setPatientSocial] = useState('')
    const [occupiedDate, setOccupiedDate] = useState(formattingDate('y-m-d', new Date()))
    const [occupiedTime, setOccupiedTime] = useState(formattingTime('h:m', new Date()))
    const vacateDatePLus = addDays(new Date() , 7)
    const [vacateDate, setVacateDate] = useState(formattingDate('y-m-d', vacateDatePLus))
    const [vacateTime, setVacateTime] = useState(formattingTime('h:m', vacateDatePLus))
    const [diagnosis, setDiagnosis] = useState('')
    const [doneBy, setDoneBy] = useState('')
    const [alertShow, setAlertShow] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    const openAlertShow = () => {
        setAlertShow(true)
    }
    const hiddeAlertShow = () => {
        setAlertShow(false)
    }
    
    const saveOccupyBed = event => {
        const occupiedDateTime = occupiedDate + ' ' + occupiedTime; 
        const planedVacate = vacateDate + ' ' + vacateTime;
        const timeNow = new Date();
        
        if(Date.parse(planedVacate) < Date.parse(occupiedDateTime)){
            setAlertMessage('A bed cannot be declared vacant before it is occupied.')
            event.preventDefault()
            return openAlertShow()
        }
        if(Date.parse(planedVacate) < Date.parse(timeNow)){
            setAlertMessage('You cannot plan to vacate a bed in the past tense while trying to occupy it.')
            event.preventDefault()
            return openAlertShow()
        }
        const roomBedId = currentBed.bed_id;
        
        fetch('http://localhost:8000/nursing/occupy_bed', {
            method: 'POST',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'crossorigin': 'anonymous',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({
                roomBedId,
                patientName,
                patientSocial,
                diagnosis,
                occupiedDateTime,
                planedVacate,
                doneBy
            })
        })
        .then(response =>  response.json())  
        .then(result => {
            setAppState(result) //updates the context
        })
        .catch(error => {
            console.log(`An ERROR occurred while save Occupy Bed, ${error}`);        
        })
        handleShowInfo()
    }

    return (
        <>
        <div className="container">
            <div className="row justify-content-center info-modal-title shdw">
                <h3 id="info-modal-title" className="text-center text-title">
                    <b>Occupy Bed</b>
                </h3>
            </div>
            <div className='row shdw'>
                <div className='col'>
                <p className="col text-center mt-3">Room: <span className="modal-subtitle">{currentBed.bed_id.split(',')[0]}</span></p>
                    
                </div>
                <div className='col'>
                <p className="col text-center mt-3">Bed: <span className="modal-subtitle">{currentBed.bed_id.split(',')[1]}</span></p>
                </div>
            </div>
        </div>
        <div className='container shdw'>
        <form id='occupy-form' onSubmit={saveOccupyBed}>
        <div className='container'>
                <div className='row'>
                    <div className='col-2'></div>
                    <div className='col-8 modal-subtitle-center my-2'>Patient</div>
                    <div className='col-2'></div>
                </div>
                <div className='row justify-content-center'>
                    <div className='col justify-content-center'>
                        <input className='input-box-center text-center' type='text' id='patient-name' name='patient-name' 
                        placeholder='Patient Name' value={patientName} onChange={event => setPatientName(event.target.value)}/>
                    </div>
                    {
                    /* (only in some countries) 
                <div className='row'>
                    <div className='col justify-content-center'>
                        <input className='input-box-center text-center' type='text' id='patient-card' name='patient-card' 
                        placeholder='Patient Card Number' value={patientCard} onChange={event => setPatientCard(event.target.value)}/>
                    </div>
                </div> */
                }
                    <div className='col justify-content-center'>
                        <input className='input-box-center text-center' type='text' id='patient-social' name='patient-social' 
                        placeholder='Social Security Number' value={patientSocial} onChange={event => setPatientSocial(event.target.value)}/>
                    </div>
                </div>
            <div className='row'>
                <div className='col-2'></div>
                <div className="col-8 modal-subtitle-center mb-2 mt-4">Diagnosis</div>
                <div className='col-2'></div>
            </div>
            <div className='row justify-content-center'>
                <textarea id='diagnosis-info' name='diagnosis-info' className='text-box mb-3' 
                placeholder='Enter Short Diagnosis' value={diagnosis} onChange={event => setDiagnosis(event.target.value)}/>
            </div>
        </div>
        <div className='container'>
            <div className='row'>
                <div className='col-2'></div>
                <div className='col-8 modal-subtitle-center my-2'>Bed</div>
                <div className='col-2'></div>
            </div>
        <div className="row">                            
                <div id="occupied" className="col time-box shdw">
                    <p className="text-center modal-subtitle">Occupied On</p>
                    <input type="date" id="occupied-date" name="occupied-date" className= 'mb-1'
                        onChange={event => setOccupiedDate(event.target.value)} value={occupiedDate}
                    />
                    <input type="time" id="occupied-time" name="occupied-time" className= 'mb-1'
                        onChange={event => setOccupiedTime(event.target.value)} value={occupiedTime}
                    />
                </div>
                <div id="vacate" className="col time-box shdw">
                    <p className="text-center modal-subtitle">Planed Vacate</p>
                    <input type="date" id="vacate-date" name="vacate-date" className= 'mb-1'
                        onChange={event => setVacateDate(event.target.value)} value={vacateDate}
                    />
                    <input type="time" id="vacate-time" name="vacate-time" className= 'mb-1'
                        onChange={event => setVacateTime(event.target.value)} value={vacateTime}
                    />
                </div>
            </div>
            <div className="row justify-content-end">
                <p className='justify-content-end info-label mt-3'>Done By</p> <br/>
                <input type='text' id='done-by' name='done-by' className= 'justify-content-end my-3 mx-2'
                onChange= {event => setDoneBy(event.target.value)} value={doneBy} placeholder='Anonymous'/>
            </div>
        </div>
        <div className="justify-content-end">
            <input type='submit' value="Save" id="edit-bed-send" className="btn shdw m-2 px-2 py-1 float-right" title="Send"/>
        </div>
        </form>
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