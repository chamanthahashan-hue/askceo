import { useEffect, useState } from 'react';
import http from '../api/http';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');

  const load = () => http.get('/categories').then((res) => setCategories(res.data.categories));
  useEffect(() => {
    load();
  }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await http.post('/categories', { name });
    setName('');
    load();
  };

  const update = async (id, currentName) => {
    const next = window.prompt('Update category', currentName);
    if (!next) return;
    await http.put(`/categories/${id}`, { name: next });
    load();
  };

  const remove = async (id) => {
    await http.delete(`/categories/${id}`);
    load();
  };

  return (
    <section className="stack">
      <form className="card" onSubmit={add}>
        <h2>Category Manager</h2>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category" />
        <button type="submit">Add Category</button>
      </form>
      <div className="card">
        <table>
          <thead><tr><th>Name</th><th>Actions</th></tr></thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat._id}>
                <td>{cat.name}</td>
                <td>
                  <button onClick={() => update(cat._id, cat.name)}>Edit</button>
                  <button onClick={() => remove(cat._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
