const fetch = require('node-fetch')

// Usage:
// BASE_URL=http://localhost:5000 TOKEN=<jwt> TEAM_ID=<teamId> INVITE_USER_ID=<userId> node scripts/test_invite_member.js

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000'
const TOKEN = process.env.TOKEN
const TEAM_ID = process.env.TEAM_ID
const INVITE_USER_ID = process.env.INVITE_USER_ID
const ROLE = process.env.ROLE || 'member'

if (!TOKEN || !TEAM_ID || !INVITE_USER_ID) {
  console.error('Missing required environment variables. Provide TOKEN, TEAM_ID and INVITE_USER_ID.')
  console.error('Example: BASE_URL=http://localhost:5000 TOKEN=<jwt> TEAM_ID=<teamId> INVITE_USER_ID=<userId> node scripts/test_invite_member.js')
  process.exit(1)
}

async function invite() {
  try {
    const res = await fetch(`${BASE_URL}/api/teams/${TEAM_ID}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ userId: INVITE_USER_ID, role: ROLE }),
    })

    const body = await res.json()
    console.log('Status:', res.status)
    console.log('Response:', body)
  } catch (err) {
    console.error('Request failed', err)
  }
}

invite()
