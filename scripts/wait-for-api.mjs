const base = (process.env.NEXT_PUBLIC_API_URL || 'https://renderphones-11.onrender.com/').replace(/\/$/, '')
const headers = process.env.INTERNAL_API_KEY ? { 'X-Internal-Key': process.env.INTERNAL_API_KEY } : {}
const deadline = Date.now() + 4 * 60_000

for (let attempt = 1; Date.now() < deadline; attempt++) {
  try {
    const res = await fetch(`${base}/health/db`, { headers, signal: AbortSignal.timeout(30_000) })
    if (res.ok) {
      console.log(`API ready after ${attempt} attempt(s)`)
      process.exit(0)
    }
    console.log(`attempt ${attempt}: HTTP ${res.status}`)
  } catch (e) {
    console.log(`attempt ${attempt}: ${e.message}`)
  }
  await new Promise(r => setTimeout(r, 10_000))
}

console.error('API did not become healthy in time')
process.exit(1)
