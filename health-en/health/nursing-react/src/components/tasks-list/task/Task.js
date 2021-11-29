import './task.css'
import {useState} from 'react'
import EditTaskModal from '../task-modal/EditTaskModal'
import {formattingDate, formattingTime} from '../../../services/formattingDateTime'
import bedAvatar from '../../../media/bed-solid-white.svg'


export default function Task({task, taskBedAndIndex}){
    const roomSplit = task.bed.split(',');
    const room = roomSplit[0];
    const bed = roomSplit[1];
    const [show, setShow]= useState(false)
    const programedDate = formattingDate('d-m-y:short', task.programed_time)
    const programedTime = formattingTime('h:m', task.programed_time)
    const repeat = task.repeat ? 'repeat' : 'unrepeat'




    const showTaskModal = event => {
        setShow(show => show = true );
    }

    const hideTaskModal = () => {
        setShow(show => show = false );
    };

    return (
    <>
        <div id={'t-' + taskBedAndIndex} className= {`animate__animated animate__fadeInUp card text-center task shdw rounded my-1 ${task.state}`}
        title={task.task} onClick={showTaskModal}>
            <div className="card-hearder task-row py-1" onClick={showTaskModal}>
                <p className='task-card-title'> Room <b>{room}</b> </p>
            </div>
            <div className="card-title task-row py-1" onClick={showTaskModal}>
                
                <p className='task-bed'> <b>{bed + ' '}</b>
                <img id={`task-bed-avatar-${bed}`} src={bedAvatar} alt='Bed Avatar' className={`task-bed-avatar ${repeat}`} onClick={showTaskModal}>
                </img>
                </p>
            </div>
            <div className="card-title task-row my-0" onClick={showTaskModal}>
                <p> 
                    <span className='date'>{programedDate}</span> <b className={`task-hours-${task.state} ml-1`}>{programedTime}</b>
                </p>
            </div>
        </div>
        <div>
        { show &&
            <EditTaskModal 
            key = {1}
            show={show}
            task = {task} 
            hideTaskModal={hideTaskModal}
            taskBedAndIndex={taskBedAndIndex}
            />
        }
        </div>
    </>
    )
}