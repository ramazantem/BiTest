import React, { useEffect, useState } from "react";
import { API_URL, getToken } from "./api";

export default function SolveTest({ testId, onSolved }) {
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/tests`)
      .then(res => res.json())
      .then(tests => {
        const t = tests.find(t => t.id === testId);
        setTest(t);
        setAnswers(t.questions.map(() => ""));
      });
  }, [testId]);

  const handleChange = (i, value) => {
    const newAnswers = [...answers];
    newAnswers[i] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/tests/${testId}/solve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify({ answers, score: 0 }),
    });
    onSolved();
  };

  if (!test) return <div>Yükleniyor...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <h3>{test.title}</h3>
      <div style={{ fontSize: 13, color: "#555" }}>{test.description}</div>
      <div style={{ fontSize: 12, color: "#888" }}>Yayınlayan: {test.owner_id}</div>
      {test.questions.map((q, i) => (
        <div key={i}>
          <div>{q.soru}</div>
          <input value={answers[i]} onChange={e => handleChange(i, e.target.value)} />
        </div>
      ))}
      <button type="submit">Gönder</button>
    </form>
  );
} 