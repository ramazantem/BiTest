import React, { useState } from "react";
import { API_URL } from "./api";

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.detail || "Giriş başarısız");
      return;
    }
    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    onLogin(data.access_token);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" placeholder="Email" onChange={handleChange} required />
      <input name="password" placeholder="Şifre" type="password" onChange={handleChange} required />
      <button type="submit">Giriş Yap</button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
} 