import React, { useEffect, useState } from "react";
import { API_URL, getToken } from "./api";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetch(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then(setUsers);
  }, [loading]);

  const handleDelete = async (id) => {
    if (!window.confirm("Kullanıcı silinsin mi?")) return;
    await fetch(`${API_URL}/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    setLoading(l => !l);
  };

  const handleEdit = (user) => {
    setEditId(user.id);
    setEditData({ ...user });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData(d => ({ ...d, [name]: type === "checkbox" ? checked : value }));
  };

  const handleEditSave = async () => {
    await fetch(`${API_URL}/users/${editId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify(editData)
    });
    setEditId(null);
    setLoading(l => !l);
  };

  return (
    <div style={{ border: "1px solid #1976d2", padding: 12, margin: "16px 0" }}>
      <h3>Kullanıcı Yönetimi</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Kullanıcı Adı</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Aktif</th>
            <th>Doğrulandı</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(users) ? users.map(u => (
            <tr key={u.id} style={{ borderBottom: "1px solid #eee" }}>
              <td>{u.id}</td>
              <td>{editId === u.id ? <input name="username" value={editData.username} onChange={handleEditChange} /> : u.username}</td>
              <td>{editId === u.id ? <input name="email" value={editData.email} onChange={handleEditChange} /> : u.email}</td>
              <td>{editId === u.id ? <input name="role" value={editData.role} onChange={handleEditChange} /> : u.role}</td>
              <td>{editId === u.id ? <input type="checkbox" name="is_active" checked={!!editData.is_active} onChange={handleEditChange} /> : (u.is_active ? "Evet" : "Hayır")}</td>
              <td>{editId === u.id ? <input type="checkbox" name="is_verified" checked={!!editData.is_verified} onChange={handleEditChange} /> : (u.is_verified ? "Evet" : "Hayır")}</td>
              <td>
                {editId === u.id ? (
                  <>
                    <button onClick={handleEditSave}>Kaydet</button>
                    <button onClick={() => setEditId(null)}>İptal</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(u)}>Güncelle</button>
                    <button onClick={() => handleDelete(u.id)}>Sil</button>
                  </>
                )}
              </td>
            </tr>
          )) : <tr><td colSpan={7}>Kullanıcı verisi alınamadı veya yetkiniz yok.</td></tr>}
        </tbody>
      </table>
    </div>
  );
} 