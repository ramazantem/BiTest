import React, { useState } from "react";
import { API_URL } from "./api";

export default function Register({ onSuccess }) {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.detail || "Kayıt başarısız");
      return;
    }
    setSuccess("Kayıt başarılı! Lütfen emailini doğrula ve giriş yap.");
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" placeholder="Kullanıcı Adı" onChange={handleChange} required />
      <input name="email" placeholder="Email" type="email" onChange={handleChange} required />
      <input name="password" placeholder="Şifre" type="password" onChange={handleChange} required />
      <button type="submit">Kayıt Ol</button>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {success && <div style={{ color: "green" }}>{success}</div>}
    </form>
  );
} 