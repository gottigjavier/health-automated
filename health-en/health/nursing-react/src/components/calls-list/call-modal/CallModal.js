
import { useEffect, useState } from 'react';
import './call-modal.css';
import {formattingDateTime} from '../../../services/formattingDateTime';
import avatar from '../../../media/patient.svg'

function CallModal({ hideCallModal, show, callEventId, call, closeCall }) {
  const showHideClassName = show ? "modal display-block" : "display-none";
  const callEventIdSplit = callEventId.split('-')[1];
  const roomSplit = callEventIdSplit.split(','); 
  const room = roomSplit[0];
  const bed = roomSplit[1];
  const callIndex = roomSplit[2];
  const [currentCall, setCurrentCall] = useState()
  const [textResponse, setTextResponse] = useState('')
  const [answeredBy, setAnsweredBy] = useState()
  const [callTime, setCallTime] = useState(new Date())
  const [callResponseTime, setCallResponseTime] = useState(new Date())

  useEffect(() => {
    setCurrentCall(call);
    // datetime.toLocaleString() format from new Date js -> dd-mm-yyyy HH:MM:SS
    // datetime.toLocaleString() format from backend -> yyyy-mm-ddTHH:MM:SS.fff 
    setCallTime(formattingDateTime('d-m-y', call.call_time))
    setCallResponseTime(formattingDateTime('d-m-y', call.response_time))
  }, [call])

  const saveCall = (event) => {
    closeCall(currentCall.id, currentCall.response_time, textResponse, answeredBy)
    setTextResponse('')
    setAnsweredBy('')
    event.preventDefault()
  }

  const noSaveCall = event => {
    setTextResponse('')
    setAnsweredBy('')
    hideCallModal()
    event.preventDefault()
  }
  
  return (
    <>
    { currentCall &&
      <div className={showHideClassName}>
        <section className="modal-call">
          <div className="container">
            { currentCall.state === 'answered' ?
            <>
              <div className="row justify-content-center call-modal-title">
                <h3 id="call-modal-title" className="text-center text-title">
                  <b>Call Answer</b>
                </h3>
              </div>   
              <div id="place" className="row shdw">
                    <p className="modal-subtitle col text-center">List Position: <b>{parseInt(callIndex) + 1}</b></p>
                    <p className="modal-subtitle col text-center">Room: <b>{room}</b></p>
                    <p className="modal-subtitle col text-center">Bed: <b>{bed}</b></p>
              </div>
                <form onSubmit={saveCall} id="call-form" className="form-container">
                  <div className="row">                            
                      <div id="call-time" className="col time-box shdw">
                        <p className="text-center modal-subtitle">Call</p>
                        <p className="text-center"><b>{callTime}</b></p>
                        <p className="text-center"><b>{call.patient}</b></p>
                      </div>
                      <div id="call-answer" className="col time-box shdw">
                        <p className="text-center modal-subtitle">Answer</p>
                        <p className="text-center"><b>{callResponseTime}</b></p>
                        <p className="justify-content-center row">
                          <input type='text' id='answered-by' name='answered-by' className= 'shdw mb-1'
                            onChange= {event => setAnsweredBy(event.target.value)} value={answeredBy} placeholder='Answered by'/>
                        </p>
                      </div>
                  </div>
              <div className="justify-content-center row">
                <label className="modal-subtitle col text-center mt-1"><b>Response</b>     
                  <textarea onChange={event => setTextResponse(event.target.value)} value={textResponse} id="answer-text" className="text-box shdw" placeholder="Uneventfully response (deafult)" name="answer-call" maxlength="1000" />
                </label>
              </div>
              <div id="new-form-buttons" className="row">
                <div id="new-edit-buttons" className="col">
                <input type="submit" value="Save and Colse" id="answer-call-send" className="shdw save btn m-2 float-right" title="Send"/>
                </div>
              </div>
            </form>
                  <button type="button" id="answer-close" className="shdw discard btn m-2 float-right" title="Discard" onClick={noSaveCall}>
                    Discard Changes
                  </button>
            </>
            :
            <>
            <div className="row justify-content-center call-modal-title">
                <h3 id="call-modal-title" className="text-center text-title">
                  <b>Call</b>
                </h3>
              </div>   
              <div id="place" className="row shdw">
                    <p className="modal-subtitle col text-center">List Position: <b>{parseInt(callIndex) + 1}</b></p>
                    <p className="modal-subtitle col text-center">Room: <b>{room}</b></p>
                    <p className="modal-subtitle col text-center">Bed: <b>{bed}</b></p>
              </div>
              <div className="row">                            
                      <div id="call-time" className="col time-box shdw">
                        <p className="text-center modal-subtitle">Call</p>
                        <p className="text-center"><b>{callTime}</b></p>
                      </div>
                      <div id="call-answer" className="col shdw">
                        <img src={avatar} alt={"Avatar"} height={'50'} className={'avatar'}></img>
                        <div>
                          <a href="https://www.flaticon.es/"> </a>
                        </div>
                      <p className="text-center"><b>{call.patient}</b></p>
                      </div>
                  </div>
                  <button type="button" id="answer-close" className="shdw discard btn m-2 float-right" title="Close" onClick={noSaveCall}>
                    Close
                  </button>
            </>
            }
          </div>
        </section>
      </div>
    }
    </>
  );
}

export default CallModal;

