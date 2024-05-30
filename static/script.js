async function fetchData(city) {
    searchForm = city
    cityWithoutProperty = "";
    try {
        city = city.toLowerCase();
        city = capitalizeFirstLetter(city);
        const response = await fetch(`/api/weather/${city}`);
        console.log(response.error)
        if (city.includes(',')) {
            city = removeCharacter(city);
        }
        console.log(response)
        // response shows up when the user does not enter a city, throwing a 404 response
        if (!response.ok) {
            document.getElementById('cityName').textContent = `Please enter a city`
            document.getElementById('weatherCelsius').innerText = "";
            throw new Error("Could not fetch resource :(");
        }
        const data = await response.json();

        // response shows up when the user enters a city, but it does not exist
        if ('Code' in data && 'Message' in data) {
            document.getElementById('cityName').textContent = `Weather for: "${searchForm}" could not be found`
            return { error: true, message: `API Error: ${data.Code} - ${data.Message}` };
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

function toggleButtonVisibility() {
    // get button
    let button = document.getElementById('changeUnit');
    let currentDisplaySetting = button.style.display;
    console.log(currentDisplaySetting);

}


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function removeCharacter(originalCityWithPlace) {
    return originalCityWithPlace.split(',')[0]
}


const input = document.getElementById('citySearch');

document.getElementById('searchButton').addEventListener('click', handleSearch);
document.getElementById('citySearch').addEventListener('keypress', function(e) {
    if (e.key==='Enter') {
        e.preventDefault();
        handleSearch();
        toggleButtonVisibility();
    }
});

async function handleSearch() {
        const city = document.getElementById('citySearch').value;
        const data = await fetchData(city);
        console.log(data);
        if (data.error == true) {
            console.log("Not displaying")
        }
        else {
            displayWeatherData(data);
        }
        
};

function displayWeatherData(data) {
    document.getElementById('weatherCelsius').innerText = "Current Temperature: " + data.celsius + '°C';
}



