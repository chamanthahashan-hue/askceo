import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import http from '../api/http';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await http.post('/auth/login', form);
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <input placeholder="Email" type="email" required onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input
        placeholder="Password"
        type="password"
        required
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button type="submit">Sign In</button>
      <p>
        Need account? <Link to="/register">Register</Link>
      </p>
    </form>
  );
}
