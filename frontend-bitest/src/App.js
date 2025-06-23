import React, { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import TestList from "./TestList";
import SolveTest from "./SolveTest";
import SolvedTests from "./SolvedTests";
import { getToken, API_URL } from "./api";
import AdminPanel from "./AdminPanel";
import TestPage from "./TestPage";
import MyTests from "./MyTests";

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
}

function getIsAdminFromToken() {
  const t = getToken();
  const payload = t ? parseJwt(t) : null;
  return payload && payload.role === "admin";
}

function App() {
  const [token, setToken] = useState(getToken());
  const [showRegister, setShowRegister] = useState(false);
  const [solvingTestId, setSolvingTestId] = useState(null);
  const [adminKeyInput, setAdminKeyInput] = useState("");
  const [page, setPage] = useState("home");
  const [isAdmin, setIsAdmin] = useState(getIsAdminFromToken());

  const ADMIN_KEY = "bitestadmin2025";

  const handleAdminKey = async (e) => {
    e.preventDefault();
    if (adminKeyInput === ADMIN_KEY) {
      const t = getToken();
      const payload = parseJwt(t);
      if (payload && payload.user_id) {
        await fetch(`${API_URL}/make-admin/${payload.user_id}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${t}`
          }
        });
        alert("Admin yetkisi verildi! Lütfen çıkış yapıp tekrar giriş yapın.");
      }
    } else {
      alert("Hatalı anahtar!");
    }
    setAdminKeyInput("");
  };

  const handleLogin = (t) => {
    setToken(t);
    setIsAdmin(getIsAdminFromToken());
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("token");
    setIsAdmin(false);
  };

  const payload = token ? parseJwt(token) : null;
  const userRole = payload && payload.role ? payload.role : "user";

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
            <Login onLogin={handleLogin} />
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <button onClick={() => setPage("home")}>Ana Sayfa</button>
          <button onClick={() => setPage("tests")}>Testler</button>
          <button onClick={() => setPage("mytests")}>Testlerim</button>
        </div>
        <form onSubmit={handleAdminKey} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <input
            type="password"
            placeholder="Admin Key"
            value={adminKeyInput}
            onChange={e => setAdminKeyInput(e.target.value)}
            style={{ padding: 4 }}
          />
          <button type="submit">Admin Ol</button>
        </form>
        {isAdmin && <span style={{ color: "#1976d2", fontWeight: "bold" }}>Admin</span>}
        <button onClick={handleLogout}>Çıkış</button>
      </div>
      {page === "tests" ? (
        <TestPage isAdmin={isAdmin} />
      ) : page === "mytests" ? (
        <MyTests />
      ) : (
        <>
          <div style={{ margin: "16px 0", fontWeight: "bold" }}>
            Kullanıcı tipi: {userRole}
          </div>
          {isAdmin && <AdminPanel />}
          <TestList onSolve={setSolvingTestId} />
          <SolvedTests />
        </>
      )}
    </div>
  );
}

export default App;
