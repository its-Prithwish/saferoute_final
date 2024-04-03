import pyrebase
from requests.exceptions import HTTPError
config={
  'apiKey': "AIzaSyA_U44isF1PNZmZNN1CbrxGuV9oRW3fgfI",
  'authDomain': "saferoute-56474.firebaseapp.com",
  'databaseURL': "https://saferoute-56474.firebaseio.com",
  'projectId': "saferoute-56474",
  'storageBucket': "saferoute-56474.appspot.com",
  'messagingSenderId': "348107657433",
  'appId': "1:348107657433:web:d3b66196e2a0b3ff5c6ec8"
}

firebase = pyrebase.initialize_app(config)
auth=firebase.auth()

def auth_signup(email,password):
    try:
        auth.create_user_with_email_and_password(email,password)
        return True
    except:
        return False


def auth_login(email,password):
    try:
        auth.sign_in_with_email_and_password(email,password)
        #print('logged in')
        return True
    except:
        return False
        #print('invalid credentials')

#if __name__ == '__main__':
#    auth_login('samannway1@gmail.com','saferoute1')