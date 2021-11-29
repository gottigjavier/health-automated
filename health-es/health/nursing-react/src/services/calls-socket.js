    //----------- Calls Section websocket - channel through consumer.py ------------
    export const callsManager = ({handleCall}) => {
        const call = new WebSocket('ws://127.0.0.1:8000/ws/callData/');
            call.onopen = () => {
                console.log('Calls contected');
            };

            call.onmessage = e => {
                const msg = JSON.parse(e.data);
                handleCall(msg)            
            };

            call.onerror = e => {
                console.log(e);
            };

            call.onclose = e => {
                console.log('Calls closed');
                console.log(e);
            };
    }
    //---------------- End Calls Section websocket ------------------------------

