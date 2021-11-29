export function addMinutes(dateTimeData= new Date(), mints=30){
    const addMinutes = dateTimeData.getMinutes() + mints;
    dateTimeData.setMinutes(addMinutes)
    const newDateTime = dateTimeData
    return newDateTime    
}

export function addDays(dateTimeData= new Date(), days=7){
    const addDays = dateTimeData.getDate() + days;
    dateTimeData.setDate(addDays)
    const newDateTime = dateTimeData
    return newDateTime    
}