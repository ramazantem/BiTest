import React, { useEffect, useState } from "react";
import { API_URL, getToken } from "./api";

export default function TestPage({ isAdmin }) {
  const [tests, setTests] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/tests`)
      .then(res => res.json())
      .then(setTests);
  }, [loading]);

  useEffect(() => {
    fetch(`${API_URL}/my-results`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then(setResults);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Test silinsin mi?")) return;
    await fetch(`${API_URL}/tests/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    setLoading(l => !l);
  };

  const getSolvers = (testId) => {
    return results.filter(r => r.test_id === testId).map(r => r.user_id).join(", ");
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Tüm Testler</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Başlık</th>
            <th>Açıklama</th>
            <th>Yayınlayan</th>
            <th>Çözenler (user_id)</th>
            {isAdmin && <th>İşlem</th>}
          </tr>
        </thead>
        <tbody>
          {tests.map(test => (
            <tr key={test.id} style={{ borderBottom: "1px solid #eee" }}>
              <td>{test.id}</td>
              <td>{test.title}</td>
              <td>{test.description}</td>
              <td>{test.owner_id}</td>
              <td>{getSolvers(test.id)}</td>
              {isAdmin && (
                <td>
                  <button onClick={() => handleDelete(test.id)}>Sil</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 