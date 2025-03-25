from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base
import random
from fastapi.staticfiles import StaticFiles

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
def read_root():
    return {"message": "Welcome to the Car Swipe API!"}

# Database setup
DATABASE_URL = "sqlite:///./cars.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Car model
class Car(Base):
    __tablename__ = "cars"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    image_url = Column(String)
    score = Column(Integer, default=0)

Base.metadata.create_all(bind=engine)

# Simulated dataset
# CARS = [
#     {"name": "Ferrari 488", "image_url": "images/ferrari-488-pista_5.jpg"},
#     {"name": "Lamborghini Huracan", "image_url": "images/2015_Lamborghini_Huracan_5.2.jpg"},
#     {"name": "Porsche 911", "image_url": "images/porsche-911.png"}
# ]

db = SessionLocal()
# for car in CARS:
#     db.add(Car(name=car["name"], image_url=car["image_url"], score=0))
# db.commit()

class SwipeInput(BaseModel):
    car_id: int
    direction: str  

@app.get("/random_car/")
def get_random_car():
    db = SessionLocal()
    car = random.choice(db.query(Car).all())  # Fetch a random car from the DB
    
    # Directly use the image URL from the database, no need to modify it
    return {"id": car.id, "name": car.name, "image_url": car.image_url}


@app.post("/swipe/")
def swipe_car(swipe: SwipeInput):
    db = SessionLocal()
    car = db.query(Car).filter(Car.id == swipe.car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    
    if swipe.direction == "right":
        car.score += 1
    db.commit()
    return {"message": f"Car {car.name} swiped {swipe.direction}"}

@app.get("/rankings/")
def get_rankings():
    db = SessionLocal()
    rankings = db.query(Car).order_by(Car.score.desc()).all()
    return [{"name": car.name, "score": car.score} for car in rankings]

