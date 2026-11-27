import { useState } from 'react'

function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleLogin(event) {
    event.preventDefault()

    if (username === 'admin' && password === 'admin123') {
      onLogin()
    } else {
      setError('Invalid username or password.')
    }
  }

  return (
    <div className="admin-login">

      <h2>Admin Login</h2>
      <p>Login to manage citizen complaints.</p>

      <form onSubmit={handleLogin}>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <button type="submit">Login</button>

      </form>

      {error && <p className="error-message">{error}</p>}

    </div>
  )
}

export default AdminLogin