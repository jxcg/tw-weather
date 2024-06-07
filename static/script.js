let currentUnit = {'unit':'celsius', 'unitSymbol':'°C', 'windUnit':'mph'};
let data = null;
searchAndUnits();

function getForecastTime(epochTime, timezoneDifference, location) {
    // 1717272494, 3600 -> 1717272494+3600
    // get location specific forecast time
    timeAccountedForTimezoneMilli = epochTime + timezoneDifference * 1000;
    currentTimeNew = new Date(timeAccountedForTimezoneMilli);
    console.log(timezoneDifference)
    //return timezoneDifference/3600 >= 0 ? 'Current Local Time: ' + currentTimeNew.toUTCString() + '+' + timezoneDifference/3600 
    //: 'Current Local Time: ' + currentTimeNew.toUTCString() + timezoneDifference/3600;
    return timezoneDifference/3600 >= 0 ? `Current Time in ${location} is ${currentTimeNew.toUTCString()}+${timezoneDifference/3600}` :
    `Current Time in ${location} is ${currentTimeNew.toUTCString()}${timezoneDifference/3600}`

}


function padTime(time) {
    // is time less than 10? true; add zero to time, else return time
    return time < 10 ? '0' + time : time;
}


function convertEpochIntoPureTime(epochTime, timezoneDifference) {
    epochTime *=1000;
    timeAccountedForTimezoneMilli = epochTime + timezoneDifference * 1000;
    let date = new Date(timeAccountedForTimezoneMilli);
    return padTime(date.getUTCHours()) + ':' + padTime(date.getUTCMinutes());

}


function toggleTempUnit() {
    // toggle from celsius -> fahrenheit

    switch (currentUnit['unit']) {
        case 'celsius': {
            currentUnit['unit'] = 'fahrenheit';
            currentUnit['unitSymbol'] = '°F';
            break;
        }
        default: {
            currentUnit['unit'] = 'celsius';
            currentUnit['unitSymbol'] = '°C';
            break;
        }
    }

    if (data) {
        displayWeatherData(data);
    }
    document.getElementById('changeUnit').innerText = 'Current Unit: ' + currentUnit['unitSymbol'];

}

// toggle speeds
function toggleWindSpeedUnit() {

    switch (currentUnit['windUnit']) {
        case 'mph': {
            currentUnit['windUnit'] = 'kph';
            break;
        }
        default: {
            currentUnit['windUnit'] = 'mph';
            break;
        }
    }
    if (data) {
        displayWeatherData(data);
    }
    document.getElementById('changeSpeedUnit').innerText = 'Speed: ' + currentUnit['windUnit'];
}

async function fetchData(city) {
    searchForm = city
    cityWithoutProperty = '';
    try {
        city = city.toLowerCase();
        city = capitalizeFirstLetter(city);
        // flask API
        const response = await fetch(`/api/weather/${city}`);
        console.log(response.error)
        if (city.includes(',')) {
            city = removeCharacter(city);
        }
        console.log(response)
        // response shows up when the user does not enter a city, throwing a 404 response
        if (!response.ok) {
            document.getElementById('cityName').textContent = `Please enter a city`
            document.getElementById('mainTemp').innerText = '';
            throw new Error('Could not fetch resource :(');
        }
        const data = await response.json();

        // response shows up when the user enters a city, but it does not exist
        if ('Code' in data && 'Message' in data) {
            document.getElementById('cityName').textContent = `Weather for: '${searchForm}' could not be found`
            console.log( { error: true, message: `API Error: ${data.Code} - ${data.Message}` });
            data = null;

        }
        else {
            console.log(data);
            document.getElementById('cityName').textContent = `Weather for: ${city}, ${data.country}`
            return data;
        }

    }

    catch(error) {
        console.log(error)
    }
}

function capitalizeFirstLetter(string) {
    // capitalises the first letter, and constructs the rest of the word together
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function removeCharacter(originalCityWithPlace) {
    return originalCityWithPlace.split(',')[0]
}

function searchAndUnits() {
    document.getElementById('changeUnit').addEventListener('click', toggleTempUnit);
    document.getElementById('changeSpeedUnit').addEventListener('click', toggleWindSpeedUnit);
    document.getElementById('searchButton').addEventListener('click', handleSearch);
    document.getElementById('citySearch').addEventListener('keypress', function(e) {
        if (e.key==='Enter') {
            e.preventDefault();
            handleSearch();
        }
    });
}


function loadMiscData() {
    try {
        const currentWeatherCondition = data.icon;
        const weatherIconURL = `https://openweathermap.org/img/wn/${currentWeatherCondition}.png`
        document.getElementById('weatherIcon').src = weatherIconURL;


    }
    catch (error) {
        console.log(error);
    }
    document.getElementById('weatherIcon').style.display = 'block';
    try {
        document.getElementById('weathermisc').style.display = 'block';
        document.getElementById('sunrise').innerText = 'Sunrise: ' + convertEpochIntoPureTime(data.sunrise, data.timezone);
        document.getElementById('sunset').innerText = 'Sunset: ' + convertEpochIntoPureTime(data.sunset, data.timezone);
        document.getElementById('pressure').innerText = 'Current Pressure: ' + data.pressure + ' hPa';
    }
    catch (error) {
        console.log(error);
    }
}


async function handleSearch() {
        const city = document.getElementById('citySearch').value;
        data = await fetchData(city);
        console.log(data);
        try {
            if (data.error == true) {
                console.log('Not displaying')
            }
            else {
                displayWeatherData(data);
            }
        }
        catch (error) {
            console.log("This place probably does not exist on the API db")
            console.log(error)
        }
        
};


function displayWeatherData(data) {
    const localForecastTimeString = getForecastTime(Date.now(), data.timezone, data.country);
    document.getElementById('timestamp').innerText = localForecastTimeString;
    switch(currentUnit['unit']) {
        case 'fahrenheit': {
            document.getElementById('mainTemp').innerText = 'Current Temperature: ' + data.fahrenheit + currentUnit['unitSymbol'] + 
            ' (' + data.description + ')';
            document.getElementById('weatherDesc').innerText = 'Feels Like ' + data.feels_like_fahrenheit + currentUnit['unitSymbol']; 
            document.getElementById('minTemp').innerText = 'Low: ' + data.minimum_temp_f + currentUnit['unitSymbol'];
            document.getElementById('maxTemp').innerText = 'High: ' + data.maximum_temp_f + currentUnit['unitSymbol'];
            break;  
        }
        default: {
            document.getElementById('mainTemp').innerText = 'Current Temperature: ' + data.celsius + currentUnit['unitSymbol'] + 
            ' (' + data.description + ')';
            document.getElementById('weatherDesc').innerText = 'Feels Like ' + data.feels_like_celsius + currentUnit['unitSymbol'];
            document.getElementById('minTemp').innerText = 'Low: ' + data.minimum_temp_c + currentUnit['unitSymbol'];
            document.getElementById('maxTemp').innerText = 'High: ' + data.maximum_temp_c + currentUnit['unitSymbol'];
            break;
        }
    }

    switch (currentUnit['windUnit']) {
        case 'kph': {
            document.getElementById('weatherWindSpeed').innerText = 'Wind Speed: ' + data.wind_speed_kph + ' ' + currentUnit['windUnit'];
            break; 
        }
        default: {
            document.getElementById('weatherWindSpeed').innerText = 'Wind Speed: ' + data.wind_speed_mph + ' ' + currentUnit['windUnit'];
            break; 
        }
    }
    try {
        loadMiscData();
    }
    catch (error) {
        console.log('Unable to fetch weather Icon URL, or unable to fetch/convert sunrise/sunset data')
    }
}


