import React, { useEffect, useState } from "react";
import { API_URL, getToken } from "./api";

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
}

export default function MyTests() {
  const [myTests, setMyTests] = useState([]);
  const [results, setResults] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/tests`)
      .then(res => res.json())
      .then(tests => {
        const t = getToken();
        const payload = t ? parseJwt(t) : null;
        const userId = payload ? payload.user_id : null;
        setMyTests(tests.filter(test => test.owner_id === userId));
      });
  }, [loading]);

  useEffect(() => {
    fetch(`${API_URL}/my-results`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then(setResults);
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then(setUsers);
  }, []);

  const getSolvers = (testId) => {
    return results.filter(r => r.test_id === testId);
  };

  const getUsername = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.username : userId;
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Testlerim</h2>
      {myTests.length === 0 ? (
        <div>Hiç testiniz yok.</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Başlık</th>
              <th>Açıklama</th>
              <th>Çözenler ve Cevapları</th>
            </tr>
          </thead>
          <tbody>
            {myTests.map(test => (
              <tr key={test.id} style={{ borderBottom: "1px solid #eee" }}>
                <td>{test.id}</td>
                <td>{test.title}</td>
                <td>{test.description}</td>
                <td>
                  {getSolvers(test.id).length === 0 ? (
                    <span>Çözen yok</span>
                  ) : (
                    <ul>
                      {getSolvers(test.id).map(r => (
                        <li key={r.id}>
                          Kullanıcı: {getUsername(r.user_id)}<br />
                          Cevaplar:
                          <ul>
                            {Array.isArray(r.answers) && Array.isArray(test.questions) ? r.answers.map((cevap, i) => (
                              <li key={i}><b>{test.questions[i]?.soru || `Soru ${i+1}`}:</b> {cevap}</li>
                            )) : (typeof r.answers === "object" && Array.isArray(test.questions) ? Object.values(r.answers).map((cevap, i) => (
                              <li key={i}><b>{test.questions[i]?.soru || `Soru ${i+1}`}:</b> {cevap}</li>
                            )) : <li>{r.answers}</li>)}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 