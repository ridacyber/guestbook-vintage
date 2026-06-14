import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function App() {
  const [messages, setMessages] = useState([])
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [myTokens, setMyTokens] = useState({})
  const [adminPassword, setAdminPassword] = useState('')
  const [showAdmin, setShowAdmin] = useState(false)
  const [isAdminVerified, setIsAdminVerified] = useState(false)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API}/messages`)
      setMessages(res.data)
    } catch (err) {
      console.error('Failed to fetch messages', err)
    }
  }

  const handleSubmit = async () => {
    if (!name.trim() || !message.trim()) return
    setLoading(true)
    try {
      const res = await axios.post(`${API}/messages`, { name, message })
      setMyTokens(prev => ({ ...prev, [res.data.id]: res.data.delete_token }))
      setMessages([res.data, ...messages])
      setName('')
      setMessage('')
    } catch (err) {
      console.error('Failed to post message', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAdminVerify = async () => {
    try {
      await axios({
        method: 'delete',
        url: `${API}/messages/verify`,
        data: { admin_password: adminPassword }
      })
      setIsAdminVerified(true)
    } catch (err) {
      if (err.response?.status === 403) {
        alert('Wrong password')
      }
    }
  }

  const handleDelete = async (id, isAdmin = false) => {
    try {
      await axios({
        method: 'delete',
        url: `${API}/messages/${id}`,
        data: isAdmin
          ? { admin_password: adminPassword }
          : { delete_token: myTokens[id] }
      })
      setMessages(messages.filter(m => m.id !== id))
      if (!isAdmin) {
        setMyTokens(prev => {
          const updated = { ...prev }
          delete updated[id]
          return updated
        })
      }
    } catch (err) {
      console.error('Failed to delete message', err)
    }
  }

  return (
    <div className="page">
      <h1 className="title">Guestbook</h1>
      <p className="subtitle">Leave a note. Say something kind.</p>

      <div className="form">
        <input
          className="input"
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={50}
        />
        <textarea
          className="textarea"
          placeholder="Leave a message..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          maxLength={300}
          rows={4}
        />
        <button
          className="btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Posting...' : 'Pin it'}
        </button>
      </div>

      <div className="board">
        {messages.length === 0 && (
          <p className="empty">No notes yet. Be the first.</p>
        )}
        {messages.map((msg) => (
          <div className="card" key={msg.id}>
            <p className="card-message">{msg.message}</p>
            <div className="card-footer">
              <span className="card-name">— {msg.name}</span>
              {myTokens[msg.id] && (
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(msg.id)}
                  title="Delete your message"
                >
                  ✕
                </button>
              )}
              {showAdmin && isAdminVerified && (
                <button
                  className="delete-btn admin"
                  onClick={() => handleDelete(msg.id, true)}
                  title="Admin delete"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="admin-panel">
        <button
          className="admin-toggle"
          onClick={() => {
            setShowAdmin(!showAdmin)
            setIsAdminVerified(false)
            setAdminPassword('')
          }}
        >
          {showAdmin ? 'Hide Admin' : 'Admin'}
        </button>
        {showAdmin && !isAdminVerified && (
          <div className="admin-verify">
            <input
              className="input admin-input"
              type="password"
              placeholder="Admin password"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
            />
            <button className="btn" onClick={handleAdminVerify}>
              Confirm
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
