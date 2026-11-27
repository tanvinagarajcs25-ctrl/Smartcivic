import { useState } from 'react'

function TrackComplaint() {
  const [ticketId, setTicketId] = useState('')
  const [complaint, setComplaint] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleTrack(event) {
    event.preventDefault()

    setComplaint(null)
    setError('')
    setLoading(true)

    try {
      const response = await fetch(
        `http://localhost:3000/api/complaints/${ticketId.trim()}`
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Complaint not found.')
      }

      setComplaint(result.data)

    } catch (err) {
      setError(err.message || 'Unable to connect to the server.')
    }

    setLoading(false)
  }

  return (
    <div className="track-container">

      <h2>Track Your Complaint</h2>

      <p>Enter your Ticket ID to check the status of your complaint.</p>

      <form onSubmit={handleTrack}>

        <input
          type="text"
          placeholder="Enter your Ticket ID"
          value={ticketId}
          onChange={(event) => setTicketId(event.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Track Complaint'}
        </button>

      </form>

      {error && (
        <p className="error-message">{error}</p>
      )}

      {complaint && (
        <div className="complaint-details">

          <h3>Complaint Details</h3>

          <p><strong>Ticket ID:</strong> {complaint.ticket_id}</p>
          <p><strong>Category:</strong> {complaint.category}</p>
          <p><strong>Description:</strong> {complaint.description}</p>
          <p><strong>Location:</strong> {complaint.location}</p>
          <p><strong>Status:</strong> {complaint.status}</p>

        </div>
      )}

    </div>
  )
}

export default TrackComplaint