from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()  # reads variables from .env file

DATABASE_URL = os.getenv("DATABASE_URL")

# Engine is the actual connection to PostgreSQL
engine = create_engine(DATABASE_URL)

# SessionLocal is a factory — every time we need to talk to DB we create a session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base is the parent class all our database models will inherit from
Base = declarative_base()

# This is a dependency — FastAPI will call this to get a DB session for each request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()  # always close session after request is done