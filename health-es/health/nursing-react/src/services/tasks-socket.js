    //----------- Tasks Section websocket - channel through consumer.py -----------
    export const tasksManager = ({handleTasks}) => {
        const call = new WebSocket('ws://127.0.0.1:8000/ws/taskData/');
            call.onopen = () => {
                console.log('Tasks contected');
            };

            call.onmessage = e => {
                const msg = JSON.parse(e.data);
                handleTasks(msg);            
            };

            call.onerror = e => {
                console.log(e);
            };

            call.onclose = e => {
                console.log('Tasks closed');
                console.log(e);
            };
    }
    // -------- End Tasks section websocket - channel -------------------
