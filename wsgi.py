"""
Filename: wsgi.py
Description: This script is designed to serve as a way to run an API endpoint within a production form.

Author: Joshua Cameron Ng
Last updated: 12/06/2024
"""

from main import app

if __name__ == "__main__":
    app.run()