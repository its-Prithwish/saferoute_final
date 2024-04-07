from flask import render_template, redirect, url_for, request, flash, jsonify
from app import app
from app.auth import auth_signup, auth_login
from .mapApi import map_api_bp
import requests

app.register_blueprint(map_api_bp)

@app.route('/', endpoint='index')
def home():
    return render_template("index.html")

@app.route('/login', methods=['POST'])
def login():
    email = request.form['email']
    pswd = request.form['password']
    if auth_login(email, pswd):
        flash("Logged in successfully", "success")
        return render_template('index.html')
    else:
        flash("Invalid credentials", "danger")
        return render_template('index.html')

@app.route('/signup', methods=['POST'])
def signup():
    email = request.form['email']
    pswd = request.form['password']

    if auth_signup(email, pswd):
        flash("Account created successfully", "success")
        return render_template('index.html')
    else:
        flash("An account already exists with this email", "danger")
        return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/map')
def map():
    return render_template('map.html')

@app.route('/fetch-photos')
def fetch_photos():
    place_id = request.args.get('placeId')
    commons_url = f'https://commons.wikimedia.org/w/api.php?action=query&prop=images&format=json&titles={place_id}'
    
    try:
        response = requests.get(commons_url)
        data = response.json()
        return jsonify(data)
    except Exception as e:
        print('Error fetching photos:', e)
        return jsonify(error='Internal Server Error'), 500
