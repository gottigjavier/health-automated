document.addEventListener('DOMContentLoaded', function() {
    room_calls();
    document.addEventListener('click', event => {
        const elem = event.target;
        //console.log(elem.id);
        call(elem.id);
    });
});

const callSocket = new WebSocket(
    'ws://'
    + window.location.host
    + '/ws/callData/'
);

function call(call_id){
    let state;
    if(call_id.includes(',')){
        state = true;
    }
    else{
        state = false;
    }
    callSocket.send(JSON.stringify({
        'key': 'this&is$a$key&to?prevent?hacking',
        'state': state,
        'bed': call_id
    }))
}

function room_calls(){
    const TOTAL_ROOMS = 30,
        TOTAL_BEDS = 4;
        const $containerRooms = document.createElement('div');
        $containerRooms.setAttribute('class', 'row justify-content-center');
        const $fragmentRooms = document.createDocumentFragment();
    
    for (roomsCounter=1; roomsCounter<=TOTAL_ROOMS; roomsCounter++){
        const $room = document.createElement('div');
        $room.setAttribute('class', 'col-2 shadow-lg bg-light rounded m-1 justify-content-center');
        const $room_head = document.createElement('button');
        $room_head.setAttribute('class', 'btn btn-danger m-2');
        $room_head.setAttribute('id', `${roomsCounter}`);
        $room_head.innerHTML = `Room ${roomsCounter}`;
        const $room_beds = document.createElement('div');
        $room_beds.setAttribute('class', 'row text-center shadow-lg bg-light rounded justify-content-center');
        for (bedsCounter=1; bedsCounter<=TOTAL_BEDS; bedsCounter++){
            const $bed = document.createElement('button');
            $bed.setAttribute('class', 'btn btn-success m-2');
            $bed.setAttribute('id', `${roomsCounter},${bedsCounter}`);
            $bed.innerHTML = `Bed: ${bedsCounter}`;
            $room_beds.appendChild($bed);
            }
        $room.appendChild($room_head);
        $room.appendChild($room_beds);
        $containerRooms.appendChild($room);
    }
    $fragmentRooms.appendChild($containerRooms);
    document.getElementById('rooms').appendChild($fragmentRooms);
}