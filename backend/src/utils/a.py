
from datetime import datetime
import csv 
from configparser import ConfigParser
from random import randint

config = ConfigParser()  
config.read('config.ini')  
username = config['X']['username']  
email = config['X']['email']  
password = config['X']['password'] 
    
client = Client(language='en-US')  
    # client.load_cookies('cookies.json') 
client.login(auth_info_1=username, auth_info_2=email, password=password)  
client.save_cookies('cookies.json')
    
    