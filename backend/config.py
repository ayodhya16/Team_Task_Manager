import os 
from dotenv import load_dotenv

load_dotenv()

class config:
    DB_HOST = os.getenv("MYSQLHOST")
    DB_USER = os.getenv("MYSQLUSER")
    DB_PASSWORD = os.getenv("MYSQLPASSWORD")
    DB_NAME = os.getenv("MYSQLDATABASE")
    DB_PORT = int(os.getenv("MYSQLPORT", 3306))

    SECRET_KEY = os.getenv("SECRET_KEY")
