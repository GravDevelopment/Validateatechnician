import { useState } from 'react'
import hero from './assets/hero.jpg'
import './App.css'

// Empty during `npm run dev` (Vite serves /api/validate itself); set to the
// Azure Function App origin in .env.production for the GitHub Pages build.
const API_BASE = import.meta.env.VITE_API_BASE ?? ''

function isExpired(revalidationDate) {
  return new Date(revalidationDate) < new Date()
}

function Record({ record }) {
  const expired = isExpired(record.revalidationDate)
  return (
    <div className="card">
      <Row label="ID Number" value={record.idNumber} />
      <Row label="Name" value={record.name} />
      <Row label="Surname" value={record.surname} />
      <Row label="Course Title" value={record.course} />
      <Row label="Date Issued" value={record.dateIssued} />
      <Row label="Expiry Date" value={record.revalidationDate} />
      <Row label="Fraudulent" value={record.fraudulent ? 'Yes' : 'No'} />

      {record.fraudulent && (
        <div className="banner banner-danger">
          This certificate has been flagged as fraudulent. Please contact{' '}
          <a href="tel:+27123491318">+27 12 349 1318</a>.
        </div>
      )}
      {!record.fraudulent && expired && (
        <div className="banner banner-warning">
          Your certificate has expired. Please contact{' '}
          <a href="tel:+27123491318">+27 12 349 1318</a> to arrange a renewal.
        </div>
      )}
      {!record.fraudulent && !expired && (
        <div className="banner banner-ok">This certificate is valid.</div>
      )}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="row">
      <span>{value}</span>
      <span className="pill">{label}</span>
    </div>
  )
}

function App() {
  const [idNumber, setIdNumber] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [records, setRecords] = useState(null)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    const id = idNumber.trim()
    if (!id) return

    setStatus('loading')
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/validate?idNumber=${encodeURIComponent(id)}`)
      if (!res.ok) throw new Error('Lookup failed, please try again.')
      const data = await res.json()
      setRecords(data.records ?? [])
      setStatus('done')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  return (
    <>
      <img className="hero" src={hero} alt="Validate a Technician" />

      <div className="page">
        <h1 className="section-title">Search</h1>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Please enter Technician Identity Number (as on certificate)"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
          />
          <button type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Searching…' : 'Search'}
          </button>
        </form>

        {status === 'error' && <p className="error-text">{error}</p>}

        {status === 'done' && records && records.length === 0 && (
          <div className="card">
            <div className="banner banner-danger">
              No certificate was found for that ID number.
            </div>
          </div>
        )}

        {status === 'done' &&
          records &&
          records.map((record, i) => <Record key={i} record={record} />)}

        <section className="help">
          <h2 className="section-title">Having Trouble?</h2>
          <p>Contact our Certification Department for assistance</p>
          <a className="email-btn" href="mailto:certification@gravitytraining.co.za">
            ✉ Send Email
          </a>
          <p className="contact-numbers">
            Or call us at: <a href="tel:0861101213">086 110 1213</a> |{' '}
            <a href="tel:+27123491318">+27 12 349 1318</a>
          </p>
        </section>
      </div>
    </>
  )
}

export default App
