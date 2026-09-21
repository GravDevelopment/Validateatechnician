// Azure Function (v4 programming model) — keeps the function key
// server-side. See handler.js for the proxy logic, shared with local Vite dev.
const { app } = require('@azure/functions')
const validate = require('./handler')

app.http('validate', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'validate',
  handler: async (request) => {
    const idNumber = request.query.get('idNumber')
    if (!idNumber) {
      return { status: 400, jsonBody: { error: 'idNumber is required' } }
    }
    const { status, body } = await validate(idNumber)
    return { status, jsonBody: body }
  },
})
