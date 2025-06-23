import React, { useEffect, useState } from "react";
import { API_URL, getToken } from "./api";

export default function TestList({ onSolve }) {
  const [tests, setTests] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newTest, setNewTest] = useState({ title: "", description: "", questions: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/tests`)
      .then(res => res.json())
      .then(setTests);
  }, [loading]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const questionsArr = newTest.questions.split("\n").map(q => ({ soru: q }));
    await fetch(`${API_URL}/tests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        title: newTest.title,
        description: newTest.description,
        questions: questionsArr
      })
    });
    setNewTest({ title: "", description: "", questions: "" });
    setShowCreate(false);
    setLoading(false);
  };

  return (
    <div>
      <h2>Testler</h2>
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => setShowCreate(v => !v)}>
          {showCreate ? "İptal" : "Test Oluştur"}
        </button>
        {showCreate && (
          <form onSubmit={handleCreate} style={{ marginTop: 8, border: "1px solid #ccc", padding: 12 }}>
            <div>
              <input
                placeholder="Başlık"
                value={newTest.title}
                onChange={e => setNewTest({ ...newTest, title: e.target.value })}
                required
                style={{ width: "100%", marginBottom: 8 }}
              />
            </div>
            <div>
              <textarea
                placeholder="Açıklama"
                value={newTest.description}
                onChange={e => setNewTest({ ...newTest, description: e.target.value })}
                required
                style={{ width: "100%", marginBottom: 8 }}
              />
            </div>
            <div>
              <textarea
                placeholder="Sorular (her satıra bir soru)"
                value={newTest.questions}
                onChange={e => setNewTest({ ...newTest, questions: e.target.value })}
                required
                style={{ width: "100%", marginBottom: 8 }}
              />
            </div>
            <button type="submit">Kaydet</button>
          </form>
        )}
      </div>
      <ul>
        {tests.map(test => (
          <li key={test.id} style={{ marginBottom: 12, border: "1px solid #eee", padding: 8 }}>
            <div><b>{test.title}</b></div>
            <div style={{ fontSize: 13, color: "#555" }}>{test.description}</div>
            <div style={{ fontSize: 12, color: "#888" }}>Yayınlayan: {test.owner_id} | Tarih: {new Date(test.created_at).toLocaleString()}</div>
            <button onClick={() => onSolve(test.id)}>Çöz</button>
          </li>
        ))}
      </ul>
    </div>
  );
} 