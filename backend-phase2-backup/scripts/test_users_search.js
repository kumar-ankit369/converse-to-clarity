// Simple script to test /api/users/search endpoint. Requires backend to be running.
const fetch = require('node-fetch');

async function run() {
  const q = process.argv[2] || 'alice';
  const token = process.env.TOKEN || '';
  const url = `http://localhost:5000/api/users/search?q=${encodeURIComponent(q)}`;
  try {
    const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
