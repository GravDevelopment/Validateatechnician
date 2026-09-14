// Shared logic for the /api/validate lookup — called from the Azure
// Function wrapper (index.js) in production, and directly from Vite's
// dev server (see vite.config.js) so local dev doesn't need `func start`.
module.exports = async function validate(idNumber) {
  const url = process.env.CERT_VALIDATE_URL
  const code = process.env.CERT_VALIDATE_KEY
  if (!url || !code) {
    return {
      status: 500,
      body: { error: 'CERT_VALIDATE_URL / CERT_VALIDATE_KEY are not configured' },
    }
  }

  try {
    const upstream = await fetch(
      `${url}?idNumber=${encodeURIComponent(idNumber)}&code=${encodeURIComponent(code)}`,
    )
    const data = await upstream.json()
    return { status: upstream.status, body: data }
  } catch {
    return { status: 502, body: { error: 'Could not reach the validation service' } }
  }
}
