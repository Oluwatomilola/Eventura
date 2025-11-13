import { NextRequest, NextResponse } from 'next/server'

const PINATA_FILE_ENDPOINT = 'https://api.pinata.cloud/pinning/pinFileToIPFS'
const PINATA_JSON_ENDPOINT = 'https://api.pinata.cloud/pinning/pinJSONToIPFS'

function getGatewayUrl(cid: string) {
  const gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/'
  return gateway.endsWith('/') ? `${gateway}${cid}` : `${gateway}/${cid}`
}

function getPinataHeaders(contentType?: string): HeadersInit {
  const jwt = process.env.PINATA_JWT
  const apiKey = process.env.PINATA_API_KEY
  const apiSecret = process.env.PINATA_SECRET_KEY

  if (jwt) {
    return {
      Authorization: `Bearer ${jwt}`,
      ...(contentType ? { 'Content-Type': contentType } : {}),
    }
  }
  if (apiKey && apiSecret) {
    return {
      pinata_api_key: apiKey,
      pinata_secret_api_key: apiSecret,
      ...(contentType ? { 'Content-Type': contentType } : {}),
    }
  }
  throw new Error('Pinata credentials not configured. Set PINATA_JWT or PINATA_API_KEY/PINATA_SECRET_KEY')
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 3, delayMs = 500): Promise<T> {
  let lastErr: any
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (e) {
      lastErr = e
      if (i < attempts - 1) await new Promise(r => setTimeout(r, delayMs * (i + 1)))
    }
  }
  throw lastErr
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''

    // JSON upload
    if (contentType.includes('application/json')) {
      const body = await req.json()
      const headers = getPinataHeaders('application/json')

      const resp = await withRetry(async () =>
        fetch(PINATA_JSON_ENDPOINT, {
          method: 'POST',
          headers,
          body: JSON.stringify({ pinataContent: body }),
        })
      )

      if (!resp.ok) {
        const text = await resp.text()
        return NextResponse.json({ error: `Pinata JSON upload failed: ${resp.status} ${text}` }, { status: 500 })
      }
      const json = await resp.json() as { IpfsHash: string }
      return NextResponse.json({ cid: json.IpfsHash, uri: `ipfs://${json.IpfsHash}`, gatewayUrl: getGatewayUrl(json.IpfsHash) })
    }

    // Multipart (file) upload
    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData()
      const file = form.get('file') as File | null
      if (!file) {
        return NextResponse.json({ error: 'Missing file field in multipart/form-data' }, { status: 400 })
      }

      const pinataForm = new FormData()
      pinataForm.append('file', file, file.name || 'upload')

      const headers = getPinataHeaders() // fetch will set boundary header
      const resp = await withRetry(async () =>
        fetch(PINATA_FILE_ENDPOINT, {
          method: 'POST',
          headers,
          body: pinataForm,
        })
      )

      if (!resp.ok) {
        const text = await resp.text()
        return NextResponse.json({ error: `Pinata file upload failed: ${resp.status} ${text}` }, { status: 500 })
      }
      const json = await resp.json() as { IpfsHash: string }
      return NextResponse.json({ cid: json.IpfsHash, uri: `ipfs://${json.IpfsHash}`, gatewayUrl: getGatewayUrl(json.IpfsHash) })
    }

    return NextResponse.json({ error: 'Unsupported Content-Type. Use application/json or multipart/form-data' }, { status: 415 })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'IPFS upload error' }, { status: 500 })
  }
}
