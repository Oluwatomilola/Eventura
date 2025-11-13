import { NextRequest, NextResponse } from 'next/server'

const PINATA_PIN_BY_HASH = 'https://api.pinata.cloud/pinning/pinByHash'

function getPinataHeaders(): HeadersInit {
  const jwt = process.env.PINATA_JWT
  const apiKey = process.env.PINATA_API_KEY
  const apiSecret = process.env.PINATA_SECRET_KEY

  if (jwt) return { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' }
  if (apiKey && apiSecret)
    return { pinata_api_key: apiKey, pinata_secret_api_key: apiSecret, 'Content-Type': 'application/json' }
  throw new Error('Pinata credentials not configured. Set PINATA_JWT or PINATA_API_KEY/PINATA_SECRET_KEY')
}

export async function POST(req: NextRequest) {
  try {
    const { cid } = await req.json()
    if (!cid || typeof cid !== 'string') {
      return NextResponse.json({ error: 'cid is required' }, { status: 400 })
    }

    const resp = await fetch(PINATA_PIN_BY_HASH, {
      method: 'POST',
      headers: getPinataHeaders(),
      body: JSON.stringify({ hashToPin: cid }),
    })

    if (!resp.ok) {
      const text = await resp.text()
      return NextResponse.json({ error: `Pinata pinByHash failed: ${resp.status} ${text}` }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'IPFS pin error' }, { status: 500 })
  }
}
