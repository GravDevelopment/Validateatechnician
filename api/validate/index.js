// Azure Function wrapper — keeps the function key server-side. See
// handler.js for the actual proxy logic (shared with local Vite dev).
const validate = require('./handler')

module.exports = async function (context, req) {
  const idNumber = req.query.idNumber
  if (!idNumber) {
    context.res = { status: 400, body: { error: 'idNumber is required' } }
    return
  }
  context.res = await validate(idNumber)
}
