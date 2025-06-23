import React, { useEffect, useState } from "react";
import { API_URL } from "./api";

export default function TestList({ onSolve }) {
  const [tests, setTests] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/tests`)
      .then(res => res.json())
      .then(setTests);
  }, []);

  return (
    <div>
      <h2>Testler</h2>
      <ul>
        {tests.map(test => (
          <li key={test.id}>
            {test.title} <button onClick={() => onSolve(test.id)}>Çöz</button>
          </li>
        ))}
      </ul>
    </div>
  );
} 