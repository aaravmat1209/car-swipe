import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewRankings, setViewRankings] = useState(false);
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    // Only fetch a new car if we're in swipe mode
    if (!viewRankings) {
      fetchRandomCar();
    }
  }, [viewRankings]);

  // Fetch a random car from the backend
  const fetchRandomCar = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://127.0.0.1:8000/random_car/");
      setCar(res.data);
    } catch (error) {
      console.error("Error fetching random car:", error);
    }
    setLoading(false);
  };

  // Swipe a car left or right
  const handleSwipe = async (direction) => {
    if (!car) return;
    try {
      await axios.post("http://127.0.0.1:8000/swipe/", {
        car_id: car.id,
        direction,
      });
      // Fetch the next car
      fetchRandomCar();
    } catch (error) {
      console.error("Error processing swipe:", error);
    }
  };

  // Fetch rankings
  const fetchRankings = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/rankings/");
      setRankings(res.data);
    } catch (error) {
      console.error("Error fetching rankings:", error);
    }
  };

  return (
    <div className="container">
      <h1>Car Swipe</h1>

      {!viewRankings ? (
        <>
          {/* Card Stack */}
          <div className="card-stack">
            <div className="card card-behind">Behind</div>
            <div className="card card-front">
              {loading ? (
                <div style={{ fontSize: "1rem" }}>Loading...</div>
              ) : car ? (
                <img
                  src={car.image_url}
                  alt={car.name}
                  style={{
                    width: "300%",
                    height: "300%",
                    borderRadius: "17px",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div>Click me</div>
              )}
            </div>
          </div>

          {/* Swipe Buttons (X & Heart) */}
          <div className="bottom-buttons">
            <button className="circle-btn btn-x" onClick={() => handleSwipe("left")}>
              X
            </button>
            <button className="circle-btn btn-heart" onClick={() => handleSwipe("right")}>
              ♥
            </button>
          </div>

          {/* Styled "View Rankings" Button */}
          <button className="btn" onClick={() => setViewRankings(true)}>
            <span className="text">View Rankings</span>
          </button>
        </>
      ) : (
        <>
          <div className="ranking-buttons">
            <button className="btn" onClick={() => setViewRankings(false)}>
              <span className="text">Back to Swiping</span>
            </button>
            <button className="btn" onClick={fetchRankings}>
              <span className="text">Refresh Rankings</span>
            </button>
          </div>

          <ul style={{ marginTop: "1rem" }}>
            {rankings.map((r, index) => (
              <li key={index}>
                {r.name}: {r.score}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;
