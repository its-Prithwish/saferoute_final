from flask import Flask
app = Flask(__name__)
app.secret_key='bullshitsomething'
def create_app():
    # Configuration options can be set here
    #app.config['SECRET_KEY'] = 'your_secret_key'
    
    # Import and register your blueprints or views
    from app import views
    
    # You can initialize and configure any extensions here, e.g., SQLAlchemy, Flask-Login, Flask-Mail, etc.
    
    return app
