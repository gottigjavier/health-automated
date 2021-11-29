// import fetchLoad in HealthApp.js and use it in useEffect throug a function, works

// currently unused for initial load, just for first load trigger and "load ok" message. 
// First load is through AppManager (websocket)

export const fetchLoad = async () =>{
    const loadEndPoint = 'http://localhost:8000/nursing/initial_load'
    const response = await fetch(loadEndPoint,
        {
            headers: {
            'Access-Control-Allow-Origin': '*',
            'crossorigin': 'anonymous',
            'Cache-Control': 'no-cache'
            }
        }
    )
    return await response.json()
}