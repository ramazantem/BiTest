import React, { useEffect, useState } from "react";
import { API_URL, getToken } from "./api";

export default function SolvedTests() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/my-results`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then(setResults);
  }, []);

  return (
    <div>
      <h2>Çözdüğüm Testler</h2>
      <ul>
        {results.map(r => (
          <li key={r.id}>
            Test ID: {r.test_id} - Skor: {r.score}
          </li>
        ))}
      </ul>
    </div>
  );
} 