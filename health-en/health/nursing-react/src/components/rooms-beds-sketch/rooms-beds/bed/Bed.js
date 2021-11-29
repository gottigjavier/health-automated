import React, { useContext, useEffect, useState } from 'react';
import './bed.css';
import AppContext from '../../../../context/appContext'
import BedModal from './bed-modal/BedModal'
import bedAvatar from '../../../../media/bed-solid.svg'


function Bed (props){
    
    const [appState, setAppState] = useContext(AppContext);
        
    const room = props.room;
    const bed = props.bed;
    const [show, setShow]= useState(false)
    const [currentBed, setCurrentBed] = useState({})

    const freeBed = {
        id : '',
        bed_id : room + ',' + bed,
        diagnosis : 'No Diagnosis',
        bed_state : 'free',
        bed_active : false,
        action_done_by : 'Anonymous',
        image : '',
        patient : 'No Patient'
    }


    const toBedState = () => {
        const id_bed = room + ',' + bed;
        appState.beds.map( e => {
            if (id_bed === e.bed_id) {
                setCurrentBed(e)
            }
        })
    }

    useEffect(() => {
        setCurrentBed(freeBed)
    }, [])

    useEffect(() => {
        toBedState()
    }, [appState.beds])

    // Show Modal ---------------------------
    const showBedModal = () => {
        setShow(show => show = true);
    };
    
    const hideBedModal = () => {
        setShow(show => show = false);
    };
    
    return (       
        <>     
            <div className={`card shdw rounded bed ${currentBed.bed_state}`} id= {'b-' + room + ',' + bed} 
                onClick={showBedModal} title={currentBed.patient}>
                <div className="bed-title text-center px-2">
                    {bed + ' '}
                </div>
                <h5 className="text-center px-2"> 
                    <img src={bedAvatar} alt="Bed" className='bed-avatar'></img>
                </h5> 
            </div>
            { show &&
                <BedModal
                show = {show}
                hideBedModal = {hideBedModal}
                currentBed = {currentBed}
                />
            }
        </>
    )
}

export default Bed;