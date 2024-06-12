"""
Filename: main.py
Description: This script fetches data from an API endpoint defined within a config yaml to its own endpoint,
and normalises certain values provided by the endpoint (e.g., changing Kelvin to Celsius/Fahrenheit, etc.)

Author: Joshua Cameron Ng
Last updated: 12/06/2024
"""
import requests
import math as m
import yaml
from flask import Flask, render_template, jsonify
import datetime as dt
app = Flask(__name__)

def load_config(env='development'):
    with open('config.yaml', 'r') as f:
        config = yaml.safe_load(f)
    return config.get(env, config['default'])

config = load_config('development')
# define these within your config.yaml
BASE_URL = config['BASE_URL']
API_KEY = config['API_KEY']


def k_to_c_f(k: float):
    c = k-273.15
    f = c * (9/5) + 32
    return c, f

def weather_t_resource_request():
    print(dt.date.today())
    url = BASE_URL + "appid=" + API_KEY + "&q=" + "London"
    response = requests.get(url).json()
    print(jsonify(response))

def convert_ms_units(ms: float) -> float:
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
        icon = response["weather"][0]["icon"]
        desc = response["weather"][0]["description"]
        sunrise_time = response["sys"]["sunrise"]
        sunset_time = response["sys"]["sunset"]
        humidity = response["main"]["humidity"]
        pressure = response["main"]["pressure"]
        wind_speed_metres_per_second = response["wind"]["speed"]
        wind_mph, wind_kph = convert_ms_units(wind_speed_metres_per_second)
        temp_celsius, temp_fahrenheit = k_to_c_f(temp_kelvin)
        temp_celsius_feels_like, temp_fahrenheit_feels_like = k_to_c_f(feels_like_kelvin)
        temp_max_celsius, temp_max_fahrenheit = k_to_c_f(max_kelvin)
        temp_min_celsius, temp_min_fahrenheit = k_to_c_f(min_kelvin)
        forecast_time = response['dt']
        try:
            country = response["sys"]["country"]
            print(country)
        except:
            print("Error fetching country")
            country = CITY

        return ({"maximum_temp_f":m.floor(temp_max_fahrenheit), 
                "country":country,
                "icon":icon,
                "forecast_time_in_epoch_seconds":forecast_time,
                "timezone":response["timezone"],
                "minimum_temp_c": m.floor(temp_min_celsius), 
                "minimum_temp_f": m.floor(temp_min_fahrenheit),
                "maximum_temp_c":m.floor(temp_max_celsius),
                "celsius":str(round(temp_celsius, 1)),
                "fahrenheit":str(round(temp_fahrenheit, 1)), 
                "sunrise":sunrise_time, "sunset":sunset_time,
                "humidity":humidity, "pressure":pressure,
                "wind_speed_mph":str(round(wind_mph,1)), "wind_speed_kph":str(round(wind_kph,1)),
                "last_refreshed":dt.datetime.now(), "feels_like_celsius":m.floor(temp_celsius_feels_like), 
                "name":response["name"],
                "feels_like_fahrenheit":m.floor(temp_fahrenheit_feels_like), "description":desc})
    
    except Exception:
        return ({"Code":response['cod'], "Message":response['message']})


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
    app.run(port=config['PORT'], debug=config['DEBUG'])
