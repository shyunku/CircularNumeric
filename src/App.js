import { useEffect, useState } from "react";
import CircularNumeric from "./CircularNumeric";

function App() {
  const [key, setKey] = useState(1008);

  const [day, setDay] = useState(0);
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);
  const [second, setSecond] = useState(0);
  const [millisecond, setMillisecond] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // time until last moment of 2023
      const diff = new Date(2023, 11, 31, 23, 59, 59, 999) - new Date();

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      const milliseconds = Math.floor(diff % 1000);

      setDay(days);
      setHour(hours);
      setMinute(minutes);
      setSecond(seconds);
      setMillisecond(milliseconds);
    }, 15);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <div className="time">
        <CircularNumeric value={`${day}`.padStart(2, "0")} />
        <div className="circular-symbol">days</div>
        <CircularNumeric value={`${hour}`.padStart(2, "0")} />
        <div className="circular-symbol">hours</div>
        <CircularNumeric value={`${minute}`.padStart(2, "0")} />
        <div className="circular-symbol">minutes</div>
        <CircularNumeric value={`${second}`.padStart(2, "0")} />
        <div className="circular-symbol">seconds</div>
        <CircularNumeric value={`${millisecond}`.padStart(3, "0")} />
        <div className="circular-symbol">milliseconds</div>
      </div>
    </div>
  );
}

export default App;
