import { useState } from 'react';
import './bed-modal.css';
import BedInfo from './bed-manager/BedInfo'
import EditBed from './bed-manager/EditBed'
import OccupyBed from './bed-manager/OccupyBed'
import VacateBed from './bed-manager/VacateBed'
import NewTaskModal from '../../../../tasks-list/task-modal/NewTaskModal'

export default function BedModal({show, hideBedModal, currentBed}){
    const showHideClassName = show ? "modal display-block" : "display-none"
    const [showInfo, setShowInfo] = useState(true)
    const [showNewTask, setShowNewTask] = useState(false)
    const [showEdit, setShowEdit] = useState(false)
    const [showOccupy, setShowOccupy] = useState(false)
    const [showVacate, setShowVacate] = useState(false)
    const liDisabled = currentBed.bed_active ? '' : 'disabled'
    const liNoDisabled = currentBed.bed_active ? 'disabled' : ''

    
    const handleShowNewTask = () => {
        setShowInfo(showInfo => showInfo = false)
        setShowEdit(showEdit => showEdit = false)
        setShowOccupy(showOccupy => showOccupy = false)
        setShowVacate(showVacate => showVacate = false)
        setShowNewTask(showNewTask => showNewTask = true)
    }
    const handleShowInfo = () => {
        setShowNewTask(showNewTask => showNewTask = false)
        setShowEdit(showEdit => showEdit = false)
        setShowOccupy(showOccupy => showOccupy = false)
        setShowVacate(showVacate => showVacate = false)
        setShowInfo(showInfo => showInfo = true)
    }
    const handleShowEdit = () => {
        setShowNewTask(showNewTask => showNewTask = false)
        setShowInfo(showInfo => showInfo = false)
        setShowOccupy(showOccupy => showOccupy = false)
        setShowVacate(showVacate => showVacate = false)
        setShowEdit(showEdit => showEdit = true)
    }
    const handleShowOccupy = () => {
        setShowNewTask(showNewTask => showNewTask = false)
        setShowInfo(showInfo => showInfo = false)
        setShowEdit(showEdit => showEdit = false)
        setShowVacate(showVacate => showVacate = false)
        setShowOccupy(showOccupy => showOccupy = true)
    }
    const handleShowVacate = () => {
        setShowNewTask(showNewTask => showNewTask = false)
        setShowInfo(showInfo => showInfo = false)
        setShowEdit(showEdit => showEdit = false)
        setShowOccupy(showOccupy => showOccupy = false)
        setShowVacate(showVacate => showVacate = true)
    }

    return(
        <>
        <div className={showHideClassName}>
            <section className="modal-bed">
                <div className="container">                    
                    <ul class="nav nav-tabs">
                        <li class="nav-item">
                            <p class={`nav-link ${liDisabled}`} onClick={handleShowNewTask}>
                                <p className={`bed-modal-subtitle my-0 active-${showNewTask}`}>New Task</p>
                            </p>
                        </li>
                        <li class="nav-item">
                            <p class="nav-link" onClick={handleShowInfo}>
                                <p className={`bed-modal-subtitle my-0 active-${showInfo}`}>Bed Info</p>
                            </p>
                        </li>
                        <li class="nav-item">
                            <p class={`nav-link ${liNoDisabled}`} onClick={handleShowOccupy}>
                                <p className={`bed-modal-subtitle my-0 active-${showOccupy}`}>Occupy Bed</p>
                            </p>
                        </li>
                        <li class="nav-item">
                            <p class={`nav-link ${liDisabled}`} onClick={handleShowEdit}>
                                <p className={`bed-modal-subtitle my-0 active-${showEdit}`}>Edit Bed</p>
                            </p>
                        </li>
                        <li class="nav-item">
                            <p class={`nav-link ${liDisabled}`} onClick={handleShowVacate}>
                                <p className={`bed-modal-subtitle my-0 active-${showVacate}`}>Vacate Bed</p>
                            </p>
                        </li>
                    </ul>
                    <div className='row'>
                        { showNewTask &&
                            <NewTaskModal
                                currentBed = {currentBed}
                                handleShowNewTask = {handleShowNewTask}
                                hideBedModal = {hideBedModal}
                            />
                        }
                    </div>
                    <div className='row m-0'>
                        { showInfo &&
                            <BedInfo
                                currentBed = {currentBed}
                            />
                        }
                    </div>
                    <div className='row m-0'>
                        { showEdit &&
                            <EditBed
                                currentBed = {currentBed}
                                handleShowInfo = {handleShowInfo}
                            />
                        }
                    </div>
                    <div className='row m-0'>
                        { showOccupy &&
                            <OccupyBed
                                currentBed = {currentBed}
                                handleShowInfo = {handleShowInfo}
                            />
                        }
                    </div>
                    <div className='row m-0'>
                        { showVacate &&
                            <VacateBed
                                currentBed = {currentBed}
                                hideBedModal = {hideBedModal}
                            />
                        }
                    </div>
                    <hr/>
                    <div className='justify-content-center'>
                        <button id="bed-close" className="shdw btn m-discard btn-light my-2 p-2" title="Close" onClick={hideBedModal}>Close Window</button>
                    </div>
                </div>
            </section>
        </div>
        </>
    )
}