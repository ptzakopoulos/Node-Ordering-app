import React from "react";
import "./App.css";

function App() {
  const fetchJandler = (e) => {
    e.preventDefault();
    fetch("/test")
      .then((res) => res.json())
      .then((data) => {
        console.log(data.test);
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="App">
      <h1 onClick={fetchJandler}>Hello everybodides</h1>
      <a href="/test" onClick={fetchJandler}>
        Fetch
      </a>
    </div>
  );
}

export default App;
