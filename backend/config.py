import os 
from dotenv import load_dotenv

load_dotenv()

class config:
    DB_HOST = os.getenv("MYSQL_HOST")
    DB_USER = os.getenv("MYSQL_USER")
    DB_PASSWORD = os.getenv("MYSQL_PASSWORD")
    DB_NAME = os.getenv("MYSQL_DATABASE")
    DB_PORT = int(os.getenv("MYSQL_PORT", 3306))

    SECRET_KEY = os.getenv("SECRET_KEY")
