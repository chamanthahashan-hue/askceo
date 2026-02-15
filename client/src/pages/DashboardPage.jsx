import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  BarElement,
  Tooltip,
  Title
} from 'chart.js';
import { io } from 'socket.io-client';
import http from '../api/http';
import { useAuth } from '../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title);

export default function DashboardPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);

  const load = async () => {
    const reqRes = await http.get('/requests?limit=50');
    setRequests(reqRes.data.requests);
    if (user.role === 'admin') {
      const statRes = await http.get('/requests/stats/summary');
      setStats(statRes.data);
    }
  };

  useEffect(() => {
    load();
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    socket.emit('join:user', user._id || user.id);
    if (user.role === 'admin') socket.emit('join:admin');
    socket.on('request:new', load);
    socket.on('request:updated', load);
    return () => socket.disconnect();
  }, []);

  const chartData = stats
    ? {
        labels: stats.breakdown.map((item) => item.categoryName),
        datasets: [
          { label: 'Pending', data: stats.breakdown.map((item) => item.pending), backgroundColor: '#f59e0b' },
          { label: 'Completed', data: stats.breakdown.map((item) => item.completed), backgroundColor: '#22c55e' }
        ]
      }
    : null;

  return (
    <div className="stack">
      <h2>{user.role === 'admin' ? 'CEO Dashboard' : 'My Requests'}</h2>
      {stats && (
        <div className="grid three">
          <article className="card small"><h3>Total Requests</h3><p>{stats.total}</p></article>
          <article className="card small"><h3>Pending/Open</h3><p>{stats.pending}</p></article>
          <article className="card small"><h3>Completed</h3><p>{stats.completed}</p></article>
        </div>
      )}
      {stats && chartData && (
        <div className="card">
          <h3>Category Breakdown</h3>
          <Bar data={chartData} />
        </div>
      )}
      <div className="card">
        <h3>Requests</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Branch</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((item) => (
              <tr key={item._id}>
                <td><Link to={`/requests/${item._id}`}>{item.requestCode}</Link></td>
                <td>{item.title}</td>
                <td>{item.categoryId?.name}</td>
                <td>{item.status}</td>
                <td>{item.priority}</td>
                <td>{item.branch}</td>
                <td>{new Date(item.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
