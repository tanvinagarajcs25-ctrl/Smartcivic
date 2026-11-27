
import { useEffect, useState } from 'react'

const API_URL = 'http://localhost:3000/api/complaints'
const BASE_URL = 'http://localhost:3000'

function AdminDashboard({ onLogout }) {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [updatingTicket, setUpdatingTicket] = useState('')

  const statuses = ['Submitted', 'Assigned', 'In Progress', 'Resolved']

  async function fetchComplaints() {
    try {
      setError('')

      const response = await fetch(API_URL)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch complaints.')
      }

      if (!Array.isArray(result.data)) {
        throw new Error('Unexpected complaint data received.')
      }

      setComplaints(result.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComplaints()
  }, [])

  async function handleStatusChange(ticketId, newStatus) {
    try {
      setUpdatingTicket(ticketId)

      const response = await fetch(
        `${API_URL}/${encodeURIComponent(ticketId)}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update status.')
      }

      setComplaints(previous =>
        previous.map(complaint =>
          complaint.ticket_id === ticketId
            ? { ...complaint, status: newStatus }
            : complaint
        )
      )
    } catch (err) {
      alert(err.message)
    } finally {
      setUpdatingTicket('')
    }
  }

  const submittedCount = complaints.filter(
    complaint => complaint.status === 'Submitted'
  ).length

  const inProgressCount = complaints.filter(
    complaint => complaint.status === 'In Progress'
  ).length

  const resolvedCount = complaints.filter(
    complaint => complaint.status === 'Resolved'
  ).length

  const categories = [
    ...new Set(complaints.map(complaint => complaint.category))
  ]

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = String(complaint.ticket_id || '')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === 'All' || complaint.status === statusFilter

    const matchesCategory =
      categoryFilter === 'All' || complaint.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  function getImageUrl(imagePath) {
    if (!imagePath) return ''

    if (imagePath.startsWith('http')) {
      return imagePath
    }

    return `${BASE_URL}/${imagePath.replace(/^\/+/, '')}`
  }

  return (
    <div className="admin-container">

      <h1>Municipal Officer Dashboard</h1>

      <button className="logout-button" onClick={onLogout}>
        Logout
      </button>

      <p>Manage and monitor citizen complaints.</p>

      <div className="admin-stats">

        <div className="stat-card">
          <h3>Total Complaints</h3>
          <h2>{complaints.length}</h2>
        </div>

        <div className="stat-card">
          <h3>Submitted</h3>
          <h2>{submittedCount}</h2>
        </div>

        <div className="stat-card">
          <h3>In Progress</h3>
          <h2>{inProgressCount}</h2>
        </div>

        <div className="stat-card">
          <h3>Resolved</h3>
          <h2>{resolvedCount}</h2>
        </div>

      </div>

      {loading && <p>Loading complaints...</p>}

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchComplaints}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <div className="complaints-list">

          <h2>All Complaints ({complaints.length})</h2>

          <div className="admin-filters">

            <input
              type="text"
              placeholder="Search by Ticket ID..."
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
            />

            <select
              value={statusFilter}
              onChange={event => setStatusFilter(event.target.value)}
            >
              <option value="All">All Statuses</option>

              {statuses.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={event => setCategoryFilter(event.target.value)}
            >
              <option value="All">All Categories</option>

              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <button onClick={fetchComplaints}>
              Refresh
            </button>

          </div>

          {filteredComplaints.length === 0 ? (
            <p>No matching complaints found.</p>
          ) : (
            filteredComplaints.map(complaint => (

              <div
                className="admin-complaint-card"
                key={complaint.ticket_id}
              >

                <h3>{complaint.ticket_id}</h3>

                <p>
                  <strong>Category:</strong> {complaint.category}
                </p>

                <p>
                  <strong>Description:</strong> {complaint.description}
                </p>

                <p>
                  <strong>Location:</strong> {complaint.location}
                </p>

                {complaint.image_url && (
                  <div className="admin-image">
                    <strong>Uploaded Image:</strong>
                    <br />

                    <img
                      src={getImageUrl(complaint.image_url)}
                      alt="Complaint"
                      style={{
                        width: '200px',
                        height: '150px',
                        objectFit: 'cover',
                        borderRadius: '10px',
                        marginTop: '10px'
                      }}
                    />
                  </div>
                )}

                <p>
                  <strong>Current Status:</strong> {complaint.status}
                </p>

                <label>
                  <strong>Update Status:</strong>
                </label>

                <select
                  value={complaint.status}
                  disabled={updatingTicket === complaint.ticket_id}
                  onChange={event =>
                    handleStatusChange(
                      complaint.ticket_id,
                      event.target.value
                    )
                  }
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                {updatingTicket === complaint.ticket_id && (
                  <p>Updating status...</p>
                )}

              </div>

            ))
          )}

        </div>
      )}

    </div>
  )
}

export default AdminDashboard
