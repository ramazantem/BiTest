import React, { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import TestList from "./TestList";
import SolveTest from "./SolveTest";
import SolvedTests from "./SolvedTests";
import { getToken } from "./api";

function App() {
  const [token, setToken] = useState(getToken());
  const [showRegister, setShowRegister] = useState(false);
  const [solvingTestId, setSolvingTestId] = useState(null);

  if (!token) {
    return (
      <div>
        {showRegister ? (
          <>
            <Register onSuccess={() => setShowRegister(false)} />
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <button onClick={() => setShowRegister(false)} style={{ background: "none", border: "none", color: "#1976d2", cursor: "pointer" }}>
                Giriş Yap
              </button>
            </div>
          </>
        ) : (
          <>
            <Login onLogin={t => setToken(t)} />
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <button onClick={() => setShowRegister(true)} style={{ background: "none", border: "none", color: "#1976d2", cursor: "pointer" }}>
                Kayıt Ol
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  if (solvingTestId) {
    return <SolveTest testId={solvingTestId} onSolved={() => setSolvingTestId(null)} />;
  }

  return (
    <div>
      <button onClick={() => { setToken(null); localStorage.removeItem("token"); }}>Çıkış</button>
      <TestList onSolve={setSolvingTestId} />
      <SolvedTests />
    </div>
  );
}

export default App;
