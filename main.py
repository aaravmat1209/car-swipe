from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, func
from sqlalchemy.orm import sessionmaker, declarative_base
import random
from fastapi.middleware.cors import CORSMiddleware
from contextlib import contextmanager


app = FastAPI()

# Database setup
DATABASE_URL = "sqlite:///./cars.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False}, pool_size=10, max_overflow=20)  # Adjust pool size and overflow
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# CORS middleware setup
origins = [
    "http://localhost:3000",  # React frontend URL
    "http://127.0.0.1:3000"  # You can also add this if needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow specific origins (localhost:3000)
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],  # Allow methods you want
    allow_headers=["*"],  # Allow all headers
)

# Car model
class Car(Base):
    __tablename__ = "cars"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    image_url = Column(String)
    score = Column(Integer, default=0)

Base.metadata.create_all(bind=engine)

# Optimized session management with context manager
@contextmanager
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class SwipeInput(BaseModel):
    car_id: int
    direction: str  

@app.get("/random_car/")
def get_random_car():
    with get_db() as db:
        # Optimized query to fetch random car using LIMIT
        car = db.query(Car).order_by(func.random()).first()  # Randomly fetch one car
        if car is None:
            raise HTTPException(status_code=404, detail="No cars found")
        return {"id": car.id, "name": car.name, "image_url": car.image_url}

@app.post("/swipe/")
def swipe_car(swipe: SwipeInput):
    with get_db() as db:
        car = db.query(Car).filter(Car.id == swipe.car_id).first()
        if not car:
            raise HTTPException(status_code=404, detail="Car not found")
        
        if swipe.direction == "right":
            car.score += 1
        db.commit()
        return {"message": f"Car {car.name} swiped {swipe.direction}"}

@app.get("/rankings/")
def get_rankings():
    with get_db() as db:
        rankings = db.query(Car).order_by(Car.score.desc()).all()
        return [{"name": car.name, "score": car.score} for car in rankings]
