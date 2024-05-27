import requests
import math as m
from flask import Flask, render_template, request, jsonify
import datetime as dt
BASE_URL = 'http://api.openweathermap.org/data/2.5/weather?'
API_KEY = open('api_key', 'r').read()
app = Flask(__name__)

def k_to_c_f(k: float):
    c = k-273.15
    f = c * (9/5) + 32
    return c, f

def weather_t_resource_request():
    print(dt.date.today())
    url = BASE_URL + "appid=" + API_KEY + "&q=" + "London"
    response = requests.get(url).json()
    print(jsonify(response))

def convert_ms_units(ms: float):
    mph = ms * 2.237
    kph = mph * 1.6
    return mph, kph

def convert_weather_request(CITY: str):
    try:
        url = BASE_URL + "appid=" + API_KEY + "&q=" + CITY
        response = requests.get(url).json()
        print(response)
        temp_kelvin = response["main"]["temp"]
        max_kelvin = response["main"]["temp_max"]
        min_kelvin = response["main"]["temp_min"]
        feels_like_kelvin = response["main"]["feels_like"]
        desc = response["weather"][0]["description"]
        sunrise_time = dt.datetime.fromtimestamp(response["sys"]["sunrise"] + response['timezone'])
        sunset_time = dt.datetime.fromtimestamp(response["sys"]["sunset"] + response['timezone'])
        humidity = response["main"]["humidity"]
        pressure = response["main"]["pressure"]
        wind_speed_metres_per_second = response["wind"]["speed"]
        wind_mph, wind_kph = convert_ms_units(wind_speed_metres_per_second)


        temp_celsius, temp_fahrenheit = k_to_c_f(temp_kelvin)
        temp_celsius_feels_like, temp_fahrenheit_feels_like = k_to_c_f(feels_like_kelvin)
        temp_max_celsius, temp_max_fahrenheit = k_to_c_f(max_kelvin)
        temp_min_celsius, temp_min_fahrenheit = k_to_c_f(min_kelvin)

        return ({"maximum_temp_f":m.floor(temp_max_fahrenheit), 
                "minimum_temp_c": m.floor(temp_min_celsius), 
                "minimum_temp_f": m.floor(temp_min_fahrenheit),
                "maximum_temp_c":m.floor(temp_max_celsius),
                "celsius":str(round(temp_celsius, 1)),
                "fahrenheit":str(round(temp_fahrenheit, 1)), 
                "sunrise":sunrise_time, "sunset":sunset_time,
                "humidity":humidity, "pressure":pressure,
                "wind_speed_mph":str(round(wind_mph,1)), "wind_speed_kph":str(round(wind_kph,1)),
                "last_refreshed":dt.datetime.now(), "feels_like_celsius":m.floor(temp_celsius_feels_like), 
                "feels_like_fahrenheit":m.floor(temp_fahrenheit_feels_like), "description":desc})
    
    except Exception as e:
        return response



@app.route('/api/weather/<city>', methods=['GET'])
def get_weather_api_data(city: str):
    try:
        weather_t_resource_request()
        response = convert_weather_request(city)
        return jsonify(response)
    except Exception as e:
        print(e)
        return jsonify({"error": "error occurred{e}"})
    
@app.route('/')
def index():
    return render_template('index.html')






if __name__ == "__main__":
    app.run(port=5300, debug=True)