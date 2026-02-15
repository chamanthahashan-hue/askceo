import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import http from '../api/http';
import { useAuth } from '../context/AuthContext';

export default function ThreadPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [message, setMessage] = useState('');
  const [decision, setDecision] = useState({ status: 'Approved', reason: '' });

  const load = () => http.get(`/requests/${id}`).then((res) => setItem(res.data.request));

  useEffect(() => {
    load();
  }, [id]);

  const sendReply = async (e) => {
    e.preventDefault();
    await http.post(`/requests/${id}/reply`, { message });
    setMessage('');
    await load();
  };

  const sendDecision = async (e) => {
    e.preventDefault();
    await http.post(`/requests/${id}/decision`, decision);
    setDecision({ ...decision, reason: '' });
    await load();
  };

  if (!item) return <div>Loading...</div>;

  return (
    <section className="stack">
      <article className="card">
        <h2>{item.title}</h2>
        <p><strong>ID:</strong> {item.requestCode} | <strong>Status:</strong> {item.status} | <strong>Priority:</strong> {item.priority}</p>
        <p><strong>Category:</strong> {item.categoryId?.name} | <strong>Branch:</strong> {item.branch}</p>
        {item.attachments?.length > 0 && (
          <div>
            <h4>Attachments</h4>
            <ul>
              {item.attachments.map((file) => (
                <li key={file}><a href={`${import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'}${file}`} target="_blank">{file}</a></li>
              ))}
            </ul>
          </div>
        )}
      </article>

      <article className="card">
        <h3>Conversation</h3>
        {item.thread.map((entry, i) => (
          <div className="thread-item" key={i}>
            <p><strong>{entry.userId?.name || 'User'}</strong> ({entry.type})</p>
            <p>{entry.message}</p>
            <small>{new Date(entry.timestamp).toLocaleString()}</small>
          </div>
        ))}
      </article>

      {!['Approved', 'Rejected'].includes(item.status) && (
        <form className="card" onSubmit={sendReply}>
          <h3>Reply</h3>
          <textarea rows={4} required value={message} onChange={(e) => setMessage(e.target.value)} />
          <button type="submit">Send Reply</button>
        </form>
      )}

      {user.role === 'admin' && !['Approved', 'Rejected'].includes(item.status) && (
        <form className="card" onSubmit={sendDecision}>
          <h3>Final Decision</h3>
          <select value={decision.status} onChange={(e) => setDecision({ ...decision, status: e.target.value })}>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
          <textarea
            rows={3}
            required
            placeholder="Reason"
            value={decision.reason}
            onChange={(e) => setDecision({ ...decision, reason: e.target.value })}
          />
          <button type="submit">Submit Decision</button>
        </form>
      )}
    </section>
  );
}
