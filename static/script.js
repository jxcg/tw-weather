async function fetchData(city) {
    try {
        const response = await fetch(`/api/weather/${city}`);
        console.log(response)
        if (!response.ok) {
            document.getElementById('cityName').textContent = `Cannot fetch Weather data for: ${city}`
            throw new Error("Could not fetch resource :(");
        }
        const data = await response.json();

        if ('Code' in data && 'Message' in data) {
            document.getElementById('cityName').textContent = `Weather for: "${city}" could not be found`
            return { error: true, message: `API Error: ${data.Code} - ${data.Message}` };
        }
        else {
            console.log(data);
            document.getElementById('cityName').textContent = `Weather for: "${city}"`
        }

    }

    catch(error) {
        console.log(error)
    }
}


document.getElementById('searchButton').addEventListener('click', async function() {
    const city = document.getElementById('citySearch').value;
    const weatherData = await fetchData(city);



    
    
})