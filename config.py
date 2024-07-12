import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'a_secret_key'
    SQLALCHEMY_DATABASE_URI = 'mysql+mysqlconnector://root:@localhost/Vinos_lombardi'
    #SQLALCHEMY_DATABASE_URI = 'mysql+mysqlconnector://root:codoacodo2024*@localhost/Vinos_lombardi'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
