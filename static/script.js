let currentUnit = "celsius";
let data = null;
function toggleTempUnit() {
    const changeUnitMessage = "Unit";
    console.log(changeUnitMessage);
    // toggle from celsius -> fahrenheit
    if (currentUnit == 'celsius') {
        console.log("Previous Unit: ",currentUnit)
        currentUnit = "fahrenheit"
        console.log("New Unit: ",currentUnit)
        document.getElementById('changeUnit').innerText = changeUnitMessage + " °F"
    }
    else {
        // toggle from fahrenheit -> celsius
        console.log("Previous Unit: ",currentUnit)
        currentUnit = 'celsius'
        console.log("New Unit: ",currentUnit)
        document.getElementById('changeUnit').innerText = changeUnitMessage + " °C"

    }
    if (data) {
        displayWeatherData(data);
    }
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
    
    if (currentUnit == "celsius") {
        document.getElementById('mainTemp').innerText = "Current Temperature: " + data.celsius + '°C';
    }
    if (currentUnit == "fahrenheit") {
        document.getElementById('mainTemp').innerText = "Current Temperature: " + data.fahrenheit + '°F';
    }
}




