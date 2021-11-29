import {useContext, useEffect, useState} from 'react';
import './calls-list.css';
import Call from './call/Call';
import {callsManager} from '../../services/calls-socket';
import AppContext from '../../context/appContext';
import sounds from '../../media/call-tone.mp3';
import {Howl} from 'howler';




export default function CallsList(props){
    const [appState, setAppState] = useContext(AppContext); // looks like hook?
    const [listCallsLen, setListCallsLen] = useState(appState.calls.length);
    const places = props.places;
    let AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx = new AudioContext();


    // Setup the new Howl.
    const sounder = new Howl({
        src: [sounds]
    });
        
    useEffect(() => {
        callsManager({handleCall})
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return(() => {
            audioCtx.suspend()
        })
    }, [])

    useEffect(() => {
        setListCallsLen(appState.calls.length)
    }, [appState.calls.length])

    const handleCall = msg => {
        if (msg.state){
            if(msg.call){
                setAppState(msg.call)
                setListCallsLen(msg.call.calls.length)
                sounder.play() // First alert. Next handled by component "Call"
            } else {
                console.log('Repeated Call or Unoccupied Bed')
            }
        } else {
            setAppState(msg.call)
            setListCallsLen(msg.call.calls.length)
            answeredCall(msg);
        }
    }

// ------------------- Answered Call ----------------------------------
    const answeredCall = call =>{
        const callsList = call.call.calls
        const BEDS = places.numBeds;
        let saveCallsList = [];
        if (callsList.length > 0){
            for (let bed=1; bed<=BEDS; bed++){
                let answCall = `${call.bed},${bed}`
                callsList.map(elem => {
                    if(elem.bed === answCall && elem.state === 'active'){
                        elem.state = 'answered'
                        elem.response_time = new Date()
                        saveCallsList.push(elem)
                    }
                })
            }
            saveAnsweredCall(saveCallsList)
            }
        else {
            console.log('No calls to answered')
        }
    }

    const saveAnsweredCall = async (saveCallsList) => {
        if (saveCallsList.length > 0) {            
            await fetch('http://localhost:8000/nursing/answered_call', {
                method: 'POST',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'crossorigin': 'anonymous',
                    'Cache-Control': 'no-cache'
                },
                body: JSON.stringify({
                    saveCallsList
                })
            })
            .then(response =>  response.json())  
            .then(result => {
                setAppState(result) //updates the context
            })
            .catch(error => {
                console.log(`An ERROR occurred while save the Answered Call: ${error}`);        
            })
        }
    }
    // ---------------------- end answered call --------------------------

    return (
        <>
            <div className="call-title row justify-content-center shdw rounded my-2">
                <p className="call-title-text">Calls</p>
            </div>
            <div className="calls-col">
            { 
            listCallsLen > 0 &&
                appState.calls.map( (call, index) =>  {
                    return (
                    <Call 
                        key = {`${call.bed},${index}`}
                        call = {call}
                        callBedAndIndex = {`${call.bed},${index}`} 
                    />
                    )
                })
            }
            </div>
        </>
    )
}