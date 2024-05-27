import requests
import math
from flask import Flask, render_template, request, jsonify
import datetime as dt
BASE_URL = 'http://api.openweathermap.org/data/2.5/weather?'
API_KEY = open('api_key', 'r').read()
CITY = 'London'
url = BASE_URL + "appid=" + API_KEY + "&q=" + CITY
app = Flask(__name__)

def k_to_c_f(k: float):
    c = k-273.15
    f = c * (9/5) + 32
    return c, f

def convert_weather_request():
    try:
        response = requests.get(url).json()
        print(response)
        temp_kelvin = response["main"]["temp"]
        max_kelvin = response["main"]["temp_max"]
        min_kelvin = response["main"]["temp_min"]
        feels_like_kelvin = response["main"]["feels_like"]
        desc = response["weather"][0]["description"]
        sunrise_time = dt.datetime.fromtimestamp(response["sys"]["sunrise"] + response['timezone'])
        sunset_time = dt.datetime.fromtimestamp(response["sys"]["sunset"] + response['timezone'])

        temp_celsius, temp_fahrenheit = k_to_c_f(temp_kelvin)
        temp_celsius_feels_like, temp_fahrenheit_feels_like = k_to_c_f(feels_like_kelvin)
        temp_max_celsius, temp_max_fahrenheit = k_to_c_f(max_kelvin)
        temp_min_celsius, temp_min_fahrenheit = k_to_c_f(min_kelvin)
        return ({"Celsius":temp_celsius, "Fahrenheit":temp_fahrenheit})
    except Exception as e:
        return e



@app.route('/', methods=['GET'])
def index():
    try:
        response = convert_weather_request()
        return jsonify(response)
    except Exception as e:
        print(e)
        return jsonify({"error": "error occurred{e}"})






if __name__ == "__main__":
    app.run(port=5300, debug=True)