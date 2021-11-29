import Room from "./rooms-beds/room/Room";
import './sketch.css'
import AppContext from '../../context/appContext'
import { useContext } from "react";

export default function Sketch(props){    
    const [appState, setAppState] = useContext(AppContext);
    
    const places = props.places;
    
    const roomsListing = () => {
        const ROOMS = places.numRooms;
        let list = [];
        for (let room = 1; room <= ROOMS; room++) {
            list.push(room);
        }
        return list;
    }

    return (
        <>
            <div className="sketch row justify-content-center shdw rounded m-1">
                <p className="text-center sketch-title">Rooms Sketch</p>
            </div>                
            <div className="row justify-content-center">
                {roomsListing().map( el => {
                    return (                            
                            <Room 
                                key = {`r-${el}`} 
                                room= {el}
                                appState={appState} 
                                places={places}
                            />                            
                        )
                    }
                )}            
            </div>
        </>
    )
}