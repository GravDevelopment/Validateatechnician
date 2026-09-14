// Proxies to the internal Gravity cert-validation Azure Function so the
// function key never reaches the browser. Same endpoint/contract used by
// the cert-validator skill: GET {CERT_VALIDATE_URL}?idNumber=..&code=..
// -> { records: [{ idNumber, name, surname, course, fraudulent, revalidationDate, dateIssued }] }
module.exports = async function (context, req) {
  const idNumber = req.query.idNumber
  if (!idNumber) {
    context.res = { status: 400, body: { error: 'idNumber is required' } }
    return
  }

  const url = process.env.CERT_VALIDATE_URL
  const code = process.env.CERT_VALIDATE_KEY
  if (!url || !code) {
    context.res = {
      status: 500,
      body: { error: 'CERT_VALIDATE_URL / CERT_VALIDATE_KEY are not configured on this Function App' },
    }
    return
  }

  try {
    const upstream = await fetch(
      `${url}?idNumber=${encodeURIComponent(idNumber)}&code=${encodeURIComponent(code)}`,
    )
    const data = await upstream.json()
    context.res = { status: upstream.status, body: data }
  } catch {
    context.res = { status: 502, body: { error: 'Could not reach the validation service' } }
  }
}
