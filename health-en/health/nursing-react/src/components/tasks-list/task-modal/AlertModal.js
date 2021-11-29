import './alert-modal.css'

export default function AlertModal({alertShow, hiddeAlertShow, alertMessage}) {
    const showHideClassName = alertShow ? "modal display-block" : "display-none"
    
    return (
        <>
        <div className={showHideClassName}>
            <section className="modal-alert">
                <div className="container">
                    <p className='alert-modal-title text-center shdw'><b>Warning!</b></p>
                <hr />
                    <p className='alert-modal-subtitle text-center'>
                    {alertMessage}
                    </p>
                    <div className="d-flex justify-content-end">
                        <button onClick={hiddeAlertShow} type="button" id="task-alert" className="shdw btn m-1" title="Close">
                            Close
                        </button>
                    </div>
                </div>
            </section>
        </div>
        </>
    );
}
