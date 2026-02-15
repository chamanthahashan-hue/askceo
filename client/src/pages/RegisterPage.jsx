import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import http from '../api/http';
import { useAuth } from '../context/AuthContext';

const branches = [
  'Business A',
  'Business B',
  'Business C',
  'Business D',
  'Business E',
  'Business F',
  'Business G',
  'Business H',
  'Business I',
  'Business J',
  'Business K'
];

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', branch: branches[0], post: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await http.post('/auth/register', form);
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2>Register</h2>
      {error && <p className="error">{error}</p>}
      <input placeholder="Full name" required onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Email" type="email" required onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input
        placeholder="Password"
        type="password"
        required
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <label>Branch</label>
      <select onChange={(e) => setForm({ ...form, branch: e.target.value })} defaultValue={branches[0]}>
        {branches.map((branch) => (
          <option key={branch}>{branch}</option>
        ))}
      </select>
      <input placeholder="Post / Role" required onChange={(e) => setForm({ ...form, post: e.target.value })} />
      <button type="submit">Create account</button>
      <p>
        Already have account? <Link to="/login">Login</Link>
      </p>
    </form>
  );
}
