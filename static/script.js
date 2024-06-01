let currentUnit = {"unit":"celsius", "unitSymbol":"°C", "windUnit":"mph"};
let data = null;


function getForecastTime(epochTime, timezoneDifference) {
    // 1717272494, 3600 -> 1717272494+3600
    // get location specific forecast time
    timeAccountedForTimezoneMilli = epochTime + timezoneDifference * 1000;
    currentTimeNew = new Date(timeAccountedForTimezoneMilli);
    if (timezoneDifference/3600 > 0) {
        return "Current Local Time: " + currentTimeNew.toUTCString() + "+" + timezoneDifference/3600;
    }
    return "Current Local Time: " + currentTimeNew.toUTCString() + timezoneDifference/3600;
}


function toggleTempUnit() {
    const changeUnitMessage = "Current Unit:";
    console.log(changeUnitMessage);
    // toggle from celsius -> fahrenheit

    switch (currentUnit['unit']) {
        case 'celsius': {
            currentUnit['unit'] = "fahrenheit";
            currentUnit['unitSymbol'] = '°F';
            break;
        }
        default: {
            currentUnit['unit'] = 'celsius';
            currentUnit['unitSymbol'] = '°C';

        }
    }

    if (data) {
        displayWeatherData(data);
    }
    document.getElementById('changeUnit').innerText = changeUnitMessage + " " + currentUnit['unitSymbol'];

}


function toggleWindSpeedUnit() {
    const changeUnitMessage = "Speed: ";
    if (currentUnit['windUnit'] === "mph") {
        currentUnit['windUnit'] = "kph"
    }
    else {
        currentUnit['windUnit'] = "mph";
    }
    if (data) {
        displayWeatherData(data);
    }
    document.getElementById('changeSpeedUnit').innerText = changeUnitMessage + " " + currentUnit['windUnit'];
}

async function fetchData(city) {
    searchForm = city
    cityWithoutProperty = "";
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
            document.getElementById('mainTemp').innerText = "";
            throw new Error("Could not fetch resource :(");
        }
        const data = await response.json();

        // response shows up when the user enters a city, but it does not exist
        if ('Code' in data && 'Message' in data) {
            document.getElementById('cityName').textContent = `Weather for: "${searchForm}" could not be found`
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


const input = document.getElementById('citySearch');

document.getElementById('changeUnit').addEventListener('click', toggleTempUnit);
document.getElementById('changeSpeedUnit').addEventListener('click', toggleWindSpeedUnit);
document.getElementById('searchButton').addEventListener('click', handleSearch);
document.getElementById('citySearch').addEventListener('keypress', function(e) {
    if (e.key==='Enter') {
        e.preventDefault();
        handleSearch();
    }
});

async function handleSearch() {
        const city = document.getElementById('citySearch').value;
        data = await fetchData(city);
        console.log(data);
        if (data.error == true) {
            console.log("Not displaying")
        }
        else {
            displayWeatherData(data);
        }
        
};

function displayWeatherData(data) {
    const currentWeatherCondition = data.icon;
    const weatherIconURL = `https://openweathermap.org/img/wn/${currentWeatherCondition}.png`
    const localForecastTimeString = getForecastTime(Date.now(), data.timezone);
    document.getElementById('timestamp').innerText = localForecastTimeString;
    switch(currentUnit['unit']) {
        case 'fahrenheit': {
            document.getElementById('mainTemp').innerText = "Current Temperature: " + data.fahrenheit + currentUnit['unitSymbol'] + 
            " (" + data.description + ")";
            document.getElementById('weatherDesc').innerText = "Feels Like " + data.feels_like_fahrenheit + currentUnit['unitSymbol']; 
            break;  
        }
        default: {
            document.getElementById('mainTemp').innerText = "Current Temperature: " + data.celsius + currentUnit['unitSymbol'] + 
            " (" + data.description + ")";
            document.getElementById('weatherDesc').innerText = "Feels Like " + data.feels_like_celsius + currentUnit['unitSymbol'];
            break;
        }
    }

    switch (currentUnit['windUnit']) {
        case 'kph': {
            document.getElementById('weatherWindSpeed').innerText = "Wind Speed: " + data.wind_speed_kph + " " + currentUnit['windUnit'];
            break; 
        }
        default: {
            document.getElementById('weatherWindSpeed').innerText = "Wind Speed: " + data.wind_speed_mph + " " + currentUnit['windUnit'];
            break; 
        }
    }
    document.getElementById('weatherIcon').style.display = 'block';
    document.getElementById('weatherIcon').src = weatherIconURL;
}

