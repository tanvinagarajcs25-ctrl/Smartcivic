import { useState } from 'react'
import TrackComplaint from './TrackComplaint'
import AdminDashboard from './AdminDashboard'
import AdminLogin from './AdminLogin'
import './App.css'

function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ticketId, setTicketId] = useState('')
  const [aiCategory, setAiCategory] = useState('')

  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [locationLoading, setLocationLoading] = useState(false)
  const [activePage, setActivePage] = useState('citizen')

  async function handleImageChange(event) {
    const selectedFile = event.target.files[0]

    if (!selectedFile) {
        return
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

    if (!allowedTypes.includes(selectedFile.type)) {
        setError('Only JPG, PNG and WEBP images are allowed.')
        event.target.value = ''
        return
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
        setError('Image must be 5 MB or smaller.')
        event.target.value = ''
        return
    }

    setError('')
    setImage(selectedFile)
    setPreview(URL.createObjectURL(selectedFile))
    setAiCategory('Analyzing image...')

    const formData = new FormData()
    formData.append('image', selectedFile)

    try {
        const response = await fetch(
            'http://localhost:3000/api/complaints/classify',
            {
                method: 'POST',
                body: formData
            }
        )

        const result = await response.json()

        if (!response.ok) {
            throw new Error(result.message || 'Image analysis failed.')
        }

        const suggestedCategory = result.suggestedCategory

        setAiCategory(suggestedCategory)

        if (
            ['Road', 'Garbage', 'Water', 'Electrical', 'Other'].includes(
                suggestedCategory
            )
        ) {
            setCategory(suggestedCategory)
        }

    } catch (err) {
        console.error('AI analysis error:', err)
        setAiCategory('Unable to analyze image')
    }
}

  function removeImage() {
    setImage(null)
    setPreview(null)
    setAiCategory('')
    setError('')
    setCategory('')
}
  function resetForm() {
  setCategory('')
  setDescription('')
  setLocation('')
  setLatitude('')
  setLongitude('')
  setImage(null)
  setPreview(null)
  setTicketId('')
  setAiCategory('')
  setError('')
}
  function detectLocation() {
  setLocationLoading(true)
  setError('')

  if (!navigator.geolocation) {
    setError('Geolocation is not supported by your browser.')
    setLocationLoading(false)
    return
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude
      const lon = position.coords.longitude

      setLatitude(lat)
      setLongitude(lon)

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
        )

        const data = await response.json()

        setLocation(data.display_name || `${latitude}, ${longitude}`)
      } catch (err) {
        setLocation(`${lat}, ${lon}`)
      }

      setLocationLoading(false)
    },

    (error) => {
      setError('Unable to detect location. Please allow location access.')
      setLocationLoading(false)
    }
  )
}

  async function handleSubmit(event) {
    event.preventDefault()
    if (description.trim().length < 10) {
      setError('Please provide a more detailed description (at least 10 characters).')
      return
    }

    setError('')
    setTicketId('')
    setLoading(true)

    const formData = new FormData()

    formData.append('category', category)
    formData.append('description', description)
    formData.append('location', location)
    formData.append('latitude', latitude)
    formData.append('longitude', longitude)

    if (image) {
      formData.append('image', image)
    }

    try {
      const response = await fetch('http://localhost:3000/api/complaints', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Complaint submission failed.')
      }

      setTicketId(result.data.ticketId)

const suggestedCategory = result.data.aiSuggestedCategory

setAiCategory(suggestedCategory || 'Not detected')

if (
    ['Road', 'Garbage', 'Water', 'Electrical', 'Other'].includes(suggestedCategory)
) {
    setCategory(suggestedCategory)
}

    } catch (err) {
      setError(err.message || 'Unable to connect to the server.')
    }

    setLoading(false)
  }

  return (
    <div className="app-container">

      <header className="header">
  <div className="brand-label">CITIZEN REPORTING PLATFORM</div>

  <h1>Smart Civic</h1>

  <p>Making our cities better, one report at a time.</p>
</header>
<nav className="main-nav">
    <button
        className={activePage === 'citizen' ? 'nav-active' : ''}
        onClick={() => setActivePage('citizen')}
    >
        Report Issue
    </button>

    <button
        className={activePage === 'track' ? 'nav-active' : ''}
        onClick={() => setActivePage('track')}
    >
        Track Complaint
    </button>

    <button
        className={activePage === 'admin' ? 'nav-active' : ''}
        onClick={() => setActivePage('admin')}
    >
        Admin
    </button>
</nav>
      {activePage === 'citizen' && (
      <div className="form-container">

        <h2>Report a Civic Issue</h2>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>
    Complaint Category
    {image && aiCategory && aiCategory !== 'Analyzing image...' && (
        <span className="ai-label"> 🤖 AI-assisted</span>
    )}
</label>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              required
            >
              <option value="">Select category</option>
              <option value="Road">Road</option>
              <option value="Garbage">Garbage</option>
              <option value="Water">Water</option>
              <option value="Electrical">Electrical</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>

            <textarea
              placeholder="Describe the civic issue..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
  <label>Location</label>

  <input
    type="text"
    placeholder="Your location will appear here"
    value={location}
    onChange={(event) => setLocation(event.target.value)}
    required
  />

  <button
  type="button"
  className="location-button"
  onClick={detectLocation}
  disabled={locationLoading}
>
  {locationLoading ? 'Detecting Location...' : '📍 Detect My Location'}
</button>
</div>

          <div className="form-group">
            <label>Upload Image</label>

            <div className="upload-box">

              <p className="upload-title">Upload a photo of the civic issue</p>

              <p className="upload-info">
                JPG, PNG or WEBP · Maximum size 5 MB
              </p>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
              />

              

              {preview && (
                <div className="image-preview">

                  <img src={preview} alt="Complaint preview" />

                  <p>{image.name}</p>
                  {aiCategory && (
    <p className="ai-status">
        🤖 AI: {aiCategory === 'Analyzing image...'
            ? 'Analyzing your image...'
            : aiCategory === 'Unable to analyze image'
                ? 'Could not analyze image'
                : `Suggested category: ${aiCategory}`}
    </p>
)}

                  <button
                    type="button"
                    className="remove-button"
                    onClick={removeImage}
                  >
                    Remove Image
                  </button>

                </div>
              )}

            </div>
          </div>
          {error && (
            <p className="error-message">{error}</p>
          )}
          <button
            className="submit-button"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>

          {ticketId && (
    <div className="success-message">
        <h3>Complaint submitted successfully! 🎉</h3>

        <p>Your Ticket ID:</p>
        <strong>{ticketId}</strong>

        {aiCategory && (
            <div className="ai-result">
                <h4>🤖 AI Image Analysis</h4>
                <p>Suggested Category: <strong>{aiCategory}</strong></p>
            </div>
        )}

        <p>Keep this ID to track your complaint.</p>

        <button
            type="button"
            onClick={resetForm}
            className="reset-button"
        >
            Report Another Issue
        </button>
    </div>
)}

        </form>

            </div>
      )}

     {activePage === 'track' && <TrackComplaint />}

{activePage === 'admin' && (
    isAdminLoggedIn ? (
        <AdminDashboard onLogout={() => setIsAdminLoggedIn(false)} />
    ) : (
        <AdminLogin onLogin={() => setIsAdminLoggedIn(true)} />
    )
)}

      

      <footer className="footer">
        <p>Smart Civic | Building cleaner, safer, better cities.</p>
        <p>Powered by technology for a better community.</p>
      </footer>
    </div>
  )
}

export default App