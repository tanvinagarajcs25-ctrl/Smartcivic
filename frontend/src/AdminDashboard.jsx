import { useEffect, useState } from 'react'

function AdminDashboard({ onLogout }) {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
const [statusFilter, setStatusFilter] = useState('All')
const [categoryFilter, setCategoryFilter] = useState('All')
  const pendingCount = complaints.filter(
  (complaint) => complaint.status === 'Pending'
).length

const resolvedCount = complaints.filter(
  (complaint) => complaint.status === 'Resolved'
).length

const inProgressCount = complaints.filter(
  (complaint) => complaint.status === 'In Progress'
).length
  async function handlePriorityChange(ticketId, newPriority) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/complaints/${ticketId}/priority`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ priority: newPriority })
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to update priority.')
    }

    setComplaints((previousComplaints) =>
      previousComplaints.map((complaint) =>
        complaint.ticket_id === ticketId
          ? { ...complaint, priority: newPriority }
          : complaint
      )
    )

  } catch (err) {
    alert(err.message)
  }
}
  async function handleStatusChange(ticketId, newStatus) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/complaints/${ticketId}/status`,
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

    setComplaints((previousComplaints) =>
      previousComplaints.map((complaint) =>
        complaint.ticket_id === ticketId
          ? { ...complaint, status: newStatus }
          : complaint
      )
    )

  } catch (err) {
    alert(err.message)
  }
}  
const filteredComplaints = complaints.filter((complaint) => {
  const matchesSearch = complaint.ticket_id
    .toLowerCase()
    .includes(searchTerm.toLowerCase())

  const matchesStatus =
    statusFilter === 'All' || complaint.status === statusFilter

  const matchesCategory =
    categoryFilter === 'All' || complaint.category === categoryFilter

  return matchesSearch && matchesStatus && matchesCategory
})
  async function fetchComplaints() {
    try {
      const response = await fetch('http://localhost:3000/api/complaints')
      const result = await response.json()

      if (!response.ok) {
        throw new Error('Failed to fetch complaints.')
      }

      setComplaints(result.data)
    } catch (err) {
      setError(err.message)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchComplaints()
  }, [])

  return (
    <div className="admin-container">

      <h1>Admin Dashboard</h1>
      <button
  className="logout-button"
  onClick={onLogout}
>
  Logout
</button>

      <p>Manage and monitor citizen complaints.</p>
      <div className="admin-stats">

  <div className="stat-card">
    <h3>Total Complaints</h3>
    <h2>{complaints.length}</h2>
  </div>

  <div className="stat-card">
    <h3>Pending</h3>
    <h2>{pendingCount}</h2>
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

      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <div className="complaints-list">
            <div className="admin-filters">

  <input
    type="text"
    placeholder="Search by Ticket ID..."
    value={searchTerm}
    onChange={(event) => setSearchTerm(event.target.value)}
  />

  <select
    value={statusFilter}
    onChange={(event) => setStatusFilter(event.target.value)}
  >
    <option value="All">All Statuses</option>
    <option value="Pending">Pending</option>
    <option value="In Progress">In Progress</option>
    <option value="Resolved">Resolved</option>
  </select>

  <select
    value={categoryFilter}
    onChange={(event) => setCategoryFilter(event.target.value)}
  >
    <option value="All">All Categories</option>
    <option value="Road">Road</option>
    <option value="Waste">Waste</option>
    <option value="Electrical">Electrical</option>
  </select>

</div>

          <h2>Total Complaints: {complaints.length}</h2>

          {complaints.length === 0 ? (
            <p>No complaints found.</p>
          ) : (
            filteredComplaints.map((complaint) => (
              <div className="admin-complaint-card" key={complaint.ticket_id}>

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
                    src={`http://localhost:3000/${complaint.image_url}`}
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
                <strong>Status:</strong> {complaint.status}
                </p>
                <p>
                <strong>Priority:</strong>
                </p>

                <select
  className={
    complaint.priority === 'High'
      ? 'priority-high'
      : complaint.priority === 'Low'
        ? 'priority-low'
        : 'priority-medium'
  }
  value={complaint.priority || 'Medium'}
  onChange={(event) =>
    handlePriorityChange(complaint.ticket_id, event.target.value)
  }
>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
                </select>
                <select
                value={complaint.status}
                onChange={(event) =>
                    handleStatusChange(complaint.ticket_id, event.target.value)
                }
                >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                </select>

              </div>
            ))
          )}

        </div>
      )}

    </div>
  )
}

export default AdminDashboard