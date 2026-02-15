import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import http from '../api/http';

export default function RequestFormPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ categoryId: '', title: '', description: '', priority: 'Medium', attachments: [] });

  useEffect(() => {
    http.get('/categories').then((res) => {
      setCategories(res.data.categories);
      if (res.data.categories[0]) {
        setForm((prev) => ({ ...prev, categoryId: res.data.categories[0]._id }));
      }
    });
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const fd = new FormData();
      fd.append('categoryId', form.categoryId);
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('priority', form.priority);
      Array.from(form.attachments).forEach((file) => fd.append('attachments', file));

      await http.post('/requests', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Submit failed');
    }
  };

  return (
    <form className="card" onSubmit={onSubmit}>
      <h2>Submit New Request</h2>
      {error && <p className="error">{error}</p>}
      <label>Category</label>
      <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
        {categories.map((cat) => (
          <option key={cat._id} value={cat._id}>{cat.name}</option>
        ))}
      </select>
      <input placeholder="Title" required onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <textarea
        placeholder="Describe your request"
        rows={5}
        required
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <label>Priority</label>
      <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
        {['Low', 'Medium', 'High', 'Urgent'].map((p) => (
          <option key={p}>{p}</option>
        ))}
      </select>
      <label>Attachments (max 3, PDF/images, 5MB each)</label>
      <input type="file" multiple accept="application/pdf,image/*" onChange={(e) => setForm({ ...form, attachments: e.target.files })} />
      <button type="submit">Submit Request</button>
    </form>
  );
}
