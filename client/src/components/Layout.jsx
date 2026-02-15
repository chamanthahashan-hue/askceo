import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <header className="header">
        <h1>AskCEO Internal Platform</h1>
        {user && (
          <nav>
            <Link to="/dashboard">Dashboard</Link>
            {user.role !== 'admin' && <Link to="/request/new">New Request</Link>}
            {user.role === 'admin' && <Link to="/categories">Categories</Link>}
            <button onClick={onLogout}>Logout</button>
          </nav>
        )}
      </header>
      <main className="container">{children}</main>
    </div>
  );
}
