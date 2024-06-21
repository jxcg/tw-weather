/**
 * Filename: script.js
 * Description: This script fetches data from a formatted endpoint, and inserts this data into a HTML template.
 * @author: Joshua Cameron Ng
 * Last updated: 14/06/2024
**/


let currentUnit = {'unit':'celsius', 'unitSymbol':'°C', 'windUnit':'mph', 'timeFormat':'24'};
let data = null;
searchAndUnits();

function setWarmerColour() {
    document.body.style.background = 'linear-gradient(-45deg, #c387ff, #7B0EE6, #ff5892, #ff6135, #ffab8a)';
    document.body.style.animation = 'gradient 25s ease infinite';
    document.body.style.backgroundSize = '400% 400%';

}

function setWarmestColour() {
    document.body.style.background = 'linear-gradient(-45deg, #ff8f96, #ffa617, #ff763b, #fa61ff)';
    document.body.style.animation = 'gradient 25s ease infinite';
    document.body.style.backgroundSize = '400% 400%';

}

function setCoolerColour() {
    document.body.style.background = 'linear-gradient(-45deg, #318db5, #af19ff, #34b899, #3c91ff)';
    document.body.style.animation = 'gradient 25s ease infinite';
    document.body.style.backgroundSize = '400% 400%';

}

function setCoolestColour() {
    document.body.style.background = 'linear-gradient(-45deg, #2effc7, #3c91ff, #2a32d9, #8234ff)';
    document.body.style.animation = 'gradient 25s ease infinite';
    document.body.style.backgroundSize = '400% 400%';
}


function getForecastTime(epochTime, timezoneDifference, cityLocation) {
    // 1717272494, 3600 -> 1717272494+3600
    // get location specific forecast time
    timeAccountedForTimezoneMilli = epochTime + timezoneDifference * 1000;
    currentTimeNew = new Date(timeAccountedForTimezoneMilli);
    cityLocation = capitalizeFirstLetter(cityLocation);
    [cityLocation] = cityLocation.split(',');
    return timezoneDifference/3600 >=0 ? `${formatTime(currentTimeNew)} GMT+${timezoneDifference/3600}` : `${formatTime(currentTimeNew)} GMT${timezoneDifference/3600}`
}


function formatTime(date) {
    switch (currentUnit['timeFormat']) {
        case '12': {
            let hours = date.getUTCHours();
            let minutes = date.getUTCMinutes();
            let ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0'+ minutes : minutes;
            let strTime = hours + ':' + minutes + ' ' + ampm;
        
            return strTime;
        }
        default: {
            let hours = date.getUTCHours();
            let minutes = date.getUTCMinutes();
            hours = hours < 10 ? '0' + hours : hours;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            return (hours + ':' + minutes);
        }
        }
    }

function padTime(time) { // adds zero to beginning of time
    // is time less than 10? true; add zero to time, else return time
    return time < 10 ? '0' + time : time;
}


function convertEpochIntoPureTime(epochTime, timezoneDifference) {
    epochTime *=1000;
    timeAccountedForTimezoneMilli = epochTime + timezoneDifference * 1000;
    let date = new Date(timeAccountedForTimezoneMilli);
    let currentHour = date.getUTCHours();
    switch (currentUnit['timeFormat']) {
        case '12': {
            if (currentHour > 11) { // PM
                currentHour = currentHour % 12
                currentHour = currentHour ? currentHour : 12;
                return currentHour + ':' + padTime(date.getUTCMinutes()) + " PM";
            }
            // AM
            return currentHour + ':' + padTime(date.getUTCMinutes()) + " AM";
        }
        default: {
            return padTime(date.getUTCHours()) + ':' + padTime(date.getUTCMinutes());
        }
    }
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
        const city = data.name;
        displayWeatherData(data, city);
    }
    document.getElementById('changeUnit').innerText = 'Current Unit: ' + currentUnit['unitSymbol'];
}

function toggleTimeUnit() {
    switch (currentUnit['timeFormat']) {
        case '24': {
            currentUnit['timeFormat'] = '12';
            break;
        }
        default: {
            currentUnit['timeFormat'] = '24';
            break;
        }
    }
    if (data) {
        const city = data.name;
        displayWeatherData(data,city);
    }
    document.getElementById('changeTimeFormat').innerText = `Format: ${currentUnit['timeFormat']} Hour`;
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
        const city = data.name;
        displayWeatherData(data, city);
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
            document.getElementById('cityWeatherDetails').style.fontSize = '40px';
            document.getElementById('cityWeatherDetails').textContent = `Please enter a city`
            document.getElementById('mainTemp').innerText = '';
            document.getElementById('weatherIcon').style.display = "none";
            document.getElementById('mainTemp').innerText = "";
            throw new Error('Could not fetch resource :(');
        }
        const data = await response.json();
        console.log(data)

        // response shows up when the user enters a city, but it does not exist
        if ('Code' in data && 'Message' in data) {
            document.getElementById('cityWeatherDetails').style.fontSize = '40px';
            document.getElementById('cityWeatherDetails').textContent = `Weather for: '${searchForm}' could not be found :(`
            document.getElementById('weatherIcon').style.display = "none";
            document.getElementById('weatherMiscBox').style.display = "none";
            document.getElementById('currentTime').style.display = "none";
            document.getElementById('mainTemp').innerText = "";
            console.log( { error: true, message: `API Error: ${data.Code} - ${data.Message}` });
            data = null;

        }
        else {
            console.log(data);
            const deviceWidth = document.documentElement.clientWidth;

            if (deviceWidth < 768) {
                document.getElementById('cityWeatherDetails').style.fontSize = '18px';
            }
            else {
                document.getElementById('cityWeatherDetails').style.fontSize = '24px';

            }

            document.getElementById('cityWeatherDetails').textContent = `${capitalizeFirstLetter(data.description)}`
            return data;
        }

    }

    catch(error) {
        console.log(error)
    }
}

function capitalizeFirstLetter(string) {
    // capitalises the first letter, and constructs the rest of the word together
    try {
        return string.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    catch (error) {
        console.log(error);
    }
}

function removeCharacter(originalCityWithPlace) {
    return originalCityWithPlace.split(',')[0]
}

function searchAndUnits() {
    document.getElementById('citySearch').addEventListener('mousedown', function() {
        citySearch.style.width = '60%'
        citySearch.style.border = '2px dotted #ffdcdc52';
    })
    document.getElementById('citySearch').addEventListener('mouseup', function() {
        citySearch.style.width = '100%';
        citySearch.style.border = '2px solid #ffdcdc52';

    })
    

    document.getElementById('changeUnit').addEventListener('click', toggleTempUnit);
    document.getElementById('changeSpeedUnit').addEventListener('click', toggleWindSpeedUnit);
    document.getElementById('changeTimeFormat').addEventListener('click', toggleTimeUnit)
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
        const weatherIconURL = `https://openweathermap.org/img/wn/${currentWeatherCondition}@4x.png`
        document.getElementById('weatherIcon').src = weatherIconURL;


    }
    catch (error) {
        console.log(error);
    }
    document.getElementById('weatherIcon').style.display = 'block';
    try {
        document.getElementById('weatherMiscBox').style.display = 'block';
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
            displayWeatherData(data, city);
        }
    }
    catch (error) {
        console.log("This place probably does not exist on the API db")
        console.log(error)
    }
        
};


function displayWeatherData(data, cityLocation) {
    const localForecastTimeString = getForecastTime(Date.now(), data.timezone, cityLocation);
    [cityLocation] = cityLocation.split(',');
    document.getElementById('citySearch').value = capitalizeFirstLetter(cityLocation) + ", " + data.country;
    document.getElementById('weatherMiscBox').style.display = "block";
    switch(currentUnit['unit']) {
        case 'fahrenheit': {
            document.getElementById('currentTime').innerText = `${localForecastTimeString}`
            document.getElementById('mainTemp').innerText = `${data.fahrenheit} ${currentUnit['unitSymbol']}`;
            document.getElementById('cityWeatherDetails').innerText = `Feels Like ${data.feels_like_fahrenheit} ${currentUnit['unitSymbol']} - ${capitalizeFirstLetter(data.description)}`
            document.getElementById('minTemp').innerText = 'Low: ' + data.minimum_temp_f + currentUnit['unitSymbol'];
            document.getElementById('maxTemp').innerText = 'High: ' + data.maximum_temp_f + currentUnit['unitSymbol'];
            break;  
        }
        default: {
            document.getElementById('currentTime').innerText = `${localForecastTimeString}`
            document.getElementById('cityWeatherDetails').innerText = `Feels Like ${data.feels_like_celsius} ${currentUnit['unitSymbol']} - ${capitalizeFirstLetter(data.description)}`
            document.getElementById('mainTemp').innerText = `${data.celsius} ${currentUnit['unitSymbol']}`;
            document.getElementById('minTemp').innerText = 'Low: ' + data.minimum_temp_c + currentUnit['unitSymbol'];
            document.getElementById('maxTemp').innerText = 'High: ' + data.maximum_temp_c + currentUnit['unitSymbol'];
            break;
        }
    }
    const celsiusIntegerConversion = Number(data.celsius);
    console.log(celsiusIntegerConversion)

    if (celsiusIntegerConversion >=20 && celsiusIntegerConversion <30) {
        console.log("warmer than 20, less than 30")
        setWarmerColour();
    }
    else if (celsiusIntegerConversion >20) {
        console.log("warmer than 20")
        setWarmestColour();
    }

    else if (celsiusIntegerConversion < 20 && celsiusIntegerConversion >5) {
        console.log("less than 20, warmer than 5")
        setCoolerColour();
    }
    else {
        console.log("default, colder than 5")
        setCoolestColour();
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


