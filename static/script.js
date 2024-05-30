let currentUnit = {"unit":"celsius", "unitSymbol":"°C", "windUnit":"mph"};

let data = null;

function toggleTempUnit() {
    const changeUnitMessage = "Current Unit:";
    console.log(changeUnitMessage);
    // toggle from celsius -> fahrenheit
    if (currentUnit['unit'] == 'celsius') {
        currentUnit['unit'] = "fahrenheit";
        currentUnit['unitSymbol'] = '°F';
    }
    else {
        // toggle from fahrenheit -> celsius
        currentUnit['unit'] = 'celsius';
        currentUnit['unitSymbol'] = '°C';

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
    if (currentUnit['unit'] === 'celsius') {
        document.getElementById('mainTemp').innerText = "Current Temperature: " + data.celsius + currentUnit['unitSymbol'] + " (" + data.description + ")";
        document.getElementById('weatherDesc').innerText = "Feels Like " + data.feels_like_celsius + currentUnit['unitSymbol'];;

    }
    if (currentUnit['unit'] === 'fahrenheit') {
        document.getElementById('mainTemp').innerText = "Current Temperature: " + data.fahrenheit + currentUnit['unitSymbol'] + " (" + data.description + ")";
        document.getElementById('weatherDesc').innerText = "Feels Like " + data.feels_like_fahrenheit + currentUnit['unitSymbol'];
    }

    if (currentUnit['windUnit'] === 'mph') {
        document.getElementById('weatherWindSpeed').innerText = "Wind Speed: " + data.wind_speed_mph + " " + currentUnit['windUnit']; 
    }
    if (currentUnit['windUnit'] === 'kph') {
        document.getElementById('weatherWindSpeed').innerText = "Wind Speed: " + data.wind_speed_kph + " " + currentUnit['windUnit']; 
    }




}

