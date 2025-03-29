import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewRankings, setViewRankings] = useState(false);
  const [rankings, setRankings] = useState([]);

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
      // Fetch the next car automatically after a swipe
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
            <div
              className="card card-front"
              onClick={() => {
                // Automatically fetch a car if one isn't already loaded
                if (!car && !loading) {
                  fetchRandomCar();
                } else if (car && !loading) {
                  // Fetch next car if there's already a car loaded
                  fetchRandomCar();
                }
              }}
            >
              {loading ? (
                <div style={{ fontSize: "1rem" }}>Loading...</div>
              ) : car ? (
                <img
                  src={car.image_url}
                  alt={car.name}
                  style={{
                    width: "100%", // Fit image width within the card
                    height: "100%", // Fit image height within the card
                    borderRadius: "17px",
                    objectFit: "contain", // Ensure the image is contained
                  }}
                />
              ) : (
                // If there's no car, show a prompt
                <div>Click me</div>
              )}
            </div>
          </div>

          {/* Swipe Buttons (X & Heart) */}
          <div className="bottom-buttons">
            <button
              className="circle-btn btn-x"
              onClick={() => handleSwipe("left")}
            >
              X
            </button>
            <button
              className="circle-btn btn-heart"
              onClick={() => handleSwipe("right")}
            >
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

          {/* Rankings Table */}
          <div className="card_for_rankings">
            <div className="card__title">Rankings</div>
           <table className="ranking-table">
              <thead>
                <tr>
                  <th>Car</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((r, index) => (
                  <tr key={index}>
                    <td>{r.name}</td>
                    <td>{r.score}</td>
                  </tr>
                ))}
              </tbody>
           </table>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
