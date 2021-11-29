import './call.css'
import CallModal from '../call-modal/CallModal'
import {useState, useContext, useEffect} from 'react'
import AppContext from '../../../context/appContext'
import bedAvatar from '../../../media/bed-solid-white.svg'
import sounds from '../../../media/call-tone.mp3';
import {Howl} from 'howler';


export default function Call({ call, callBedAndIndex}){
    const roomSplit = call.bed.split(',');
    const room = roomSplit[0];
    const bed = roomSplit[1];
    const [appState, setAppState] = useContext(AppContext); // looks like hook?
    const [show, setShow]= useState(false)
    const [callEventId, setCallEventId] = useState('');

    // Setup the new Howl.
    const sounder = new Howl({
        src: [sounds]
    });


    useEffect(() => {
        const launcher = setInterval( () => {
            alertCall(launcher)
        }, 15000);
        return(() => {
            clearInterval(launcher)
        })
    }, [call.state])

    const alertCall = (launcher) => {
        if(call.state === 'active'){
            sounder.play()
        } else {
            sounder.stop()
            clearInterval(launcher)
        }
    }

    // To display in title
    const patient = () => {
        let callPatient = '';
        const roomBed = call.bed
        const bedsList = appState.beds
        bedsList.map(element => {
            if(element.bed_id === roomBed){
                callPatient =  element.patient
            }
            return callPatient
        })
        return callPatient
    }
    
    // Show Modal ---------------------------
    const showCallModal = (event) => {
        setCallEventId(callEventId => callEventId = event.target.id ? event.target.id : event.target.offsetParent.id);
        setShow(show => show = true );
    };
    
    const hideCallModal = () => {
        setShow(show => show = false );
    };
    
    // ---------------------- Closed call --------------------------------    
    const closeCall = (currentCallId, currentCallTime, textResponse, answeredBy) => {
        hideCallModal();
        saveCloseCall(currentCallId, currentCallTime, textResponse, answeredBy)
        }

    const saveCloseCall = async (currentCallId, currentCallTime, textResponse, answeredBy='Anonymous') => {
        const callId = currentCallId
        const callTime = currentCallTime;
        const text = textResponse === '' ? 'Uneventfully response' : textResponse;
        await fetch('http://localhost:8000/nursing/close_call', {
            method: "POST",
            headers: {
                'Access-Control-Allow-Origin': '*',
                'crossorigin': 'anonymous',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({
                callId,
                callTime,
                text,
                answeredBy
            })
        })
        .then(response =>  response.json())  
        .then(result => {
            setAppState(result) //updates the context
        })
        .catch(error => {
            console.log(`An ERROR occurred while save the Closed Call: ${error}`);        
        })
    }    
// ---------------------- End Closed call --------------------------------

    return (
        <>                        
            <div id={'c-' + callBedAndIndex} onClick={showCallModal} title={patient()}
            className= {`animate__animated animate__fadeInUp card text-center call shdw rounded my-1 ${call.state}`}>
                <div className="card-hearder call-row py-1" onClick={showCallModal}>
                    <p className='call-bed'> Room <b>{room}</b> </p>
                </div>
                <div className="card-title call-row py-1" onClick={showCallModal}>
                    
                    <p className='call-bed'> <b>{bed + ' '}</b>
                        <img id={`call-bed-avatar-${bed}`} src={bedAvatar} alt='Bed Avatar' className='call-bed-avatar' onClick={showCallModal}>
                        </img>
                    </p>
                </div>             
            </div>
            <div>
                { show &&
                    <CallModal 
                        key = {'CM-3'}
                        show={show} 
                        hideCallModal={hideCallModal}
                        callEventId={callEventId}
                        call= {call}
                        closeCall= {closeCall} 
                    />
                }
            </div>
        </>
    )    
}