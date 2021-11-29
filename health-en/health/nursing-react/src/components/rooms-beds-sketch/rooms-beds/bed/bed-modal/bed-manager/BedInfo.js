import './bed-manager.css'
import {formattingDateTime} from '../../../../../../services/formattingDateTime'

export default function BedInfo({currentBed}){
    const bedState = currentBed.bed_state === 'free' ? 'Free' : 'Occupied';
    const occupiedTime = formattingDateTime('d-m-y', currentBed.bed_occupied_time)
    const planedVacate = currentBed.bed_planed_vacate ? formattingDateTime('d-m-y', currentBed.bed_planed_vacate) : 'Undetermined'
    
    return (
        <>
            <div className="container">
                    <div className="row justify-content-center info-modal-title shdw">
                        <p id="info-modal-title" className="text-center">
                            <b>Bed Information</b>
                        </p>
                    </div>
                    <div className='row shdw'>
                        <div className='col'>
                        <p className="col text-center mt-3 modal-subtitle">Room: <span className="p-styled1">{currentBed.bed_id.split(',')[0]}</span></p>
                            
                        </div>
                        <div className='col'>
                        <p className="col text-center mt-3 modal-subtitle">Bed: <span className="p-styled1">{currentBed.bed_id.split(',')[1]}</span></p>
                        </div>
                    </div>
                    <div className='row shdw'>
                        <div className='col-md-8 col-sm-8'>
                            <p className="modal-subtitle">Patient</p>
                            <p className='p-styled1'>
                                {currentBed.patient}
                            </p>
                        </div>
                        <div className='col-md-2 col-sm-4'>
                            <p className="modal-subtitle">State</p>
                            <p className='p-styled1'>
                                {bedState}
                            </p>
                        </div>
                    </div>
                    <div className='row justify-content-center shdw pb-3'>
                        <p className="modal-subtitle">Diagnosis</p>
                        <p className='border border-info text-box'>
                            {currentBed.diagnosis}
                        </p>
                    </div>
                    <div className='row shdw pb-3'>
                    { currentBed.bed_active &&
                        <div className='col justify-content-center'>
                            <p className="modal-subtitle">Occupied on</p>
                            <p className='p-styled1 text-center'>
                                {occupiedTime}
                            </p>
                        </div>
                    }
                    { currentBed.bed_active &&
                        <div className='col justify-content-center'>
                            <p className="modal-subtitle">Planned to Vacated on</p>
                            <p className='p-styled1 text-center'>
                                {planedVacate}
                            </p>
                        </div>
                    }
                    </div>
                </div>
            </>
    )
}