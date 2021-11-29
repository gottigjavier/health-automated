    //----------- App Section websocket - channel through consumer.py -----------
    export const appManager = ({handleApp}) => {
        const call = new WebSocket('ws://127.0.0.1:8000/ws/appData/');
            call.onopen = () => {
                console.log('App contected');
            };

            call.onmessage = e => {
                const msg = JSON.parse(e.data);
                handleApp(msg);   
            };

            call.onerror = e => {
                console.log(e);
            };

            call.onclose = e => {
                console.log('App closed');
                console.log(e);
            };
    }
    // -------- End App section websocket - channel -------------------
