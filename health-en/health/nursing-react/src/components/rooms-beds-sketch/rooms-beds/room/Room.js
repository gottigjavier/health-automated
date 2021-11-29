import { useContext, useState, useEffect } from "react";
import Bed from "../bed/Bed";
import './room.css'
import AppContext from '../../../../context/appContext'

const Room = (props) => {
    const [appState, setAppState] = useContext(AppContext);
    
    const room = props.room;
    const places = props.places;
    const [roomState, setRoomState] = useState('room-free')
    
    const bedsListing = () => {
        const BEDS = places.numBeds;
        let list = [];
        for (let bed = 1; bed <= BEDS; bed++) {
            list.push(bed);
        }
        return list;
    }
    
    const roomIsOccupied = () => {
        let occup = false;
        appState.beds.map(bed => {
            const roomOfBed = parseInt(bed.bed_id.split(',')[0])
            if (roomOfBed === room){
                setRoomState('room-occupied')
                occup = true
            }
        })
        if (!occup) {setRoomState('room-free')}
    }

    useEffect(() => {
        roomIsOccupied()
    }, [appState.beds])

    return (
        <>
            <div id= {'r-' + room} className="col-2 rounded m-1 shdw">
                <div className={`row justify-content-center shdw rounded ${roomState}`}>
                    <p className='text-center room-title'> Room <b>{room}</b> </p>
                </div>
                <div className="row justify-content-center">
                {bedsListing().map( bed => {
                    return (                    
                            <Bed
                                key = {`b-${room},${bed}`}
                                appState = {appState}
                                room = {room}
                                bed= {bed}
                                />                        
                        )
                    }
                )}
                </div>
            </div>
        </>
    )
}

export default Room;