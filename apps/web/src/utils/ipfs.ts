// TODO: IPFS utility functions for metadata storage

export type IpfsUploadResponse = { cid: string; uri: string; gatewayUrl: string }

// Upload to IPFS through server API route (keeps secrets server-side)
export async function uploadToIPFS(data: any): Promise<IpfsUploadResponse> {
  // File/Blob/FormData -> multipart; otherwise JSON
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData
  const isFileLike = typeof File !== 'undefined' && data instanceof File
  const isBlobLike = typeof Blob !== 'undefined' && data instanceof Blob

  let res: Response
  if (isFormData) {
    res = await fetch('/api/ipfs/upload', { method: 'POST', body: data })
  } else if (isFileLike || isBlobLike) {
    const form = new FormData()
    form.append('file', data)
    res = await fetch('/api/ipfs/upload', { method: 'POST', body: form })
  } else {
    res = await fetch('/api/ipfs/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`IPFS upload failed: ${res.status} ${text}`)
  }
  return (await res.json()) as IpfsUploadResponse
}

function baseGateway(): string {
  return process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/'
}

function resolveIpfsPath(uriOrCid: string): string {
  return uriOrCid.startsWith('ipfs://') ? uriOrCid.replace('ipfs://', '') : uriOrCid
}

async function fetchWithTimeout(url: string, ms = 8000): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    return await fetch(url, { cache: 'no-store', signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchFromIPFS(uriOrCid: string): Promise<any> {
  const path = resolveIpfsPath(uriOrCid)

  // Try primary gateway first
  const primary = baseGateway()
  const firstUrl = primary.endsWith('/') ? `${primary}${path}` : `${primary}/${path}`
  try {
    const res = await fetchWithTimeout(firstUrl)
    if (res.ok) return res.json()
  } catch (_) { /* try fallbacks */ }

  // Try fallback gateways if configured
  const fallbacks = (process.env.NEXT_PUBLIC_IPFS_GATEWAYS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  for (const gw of fallbacks) {
    const url = gw.endsWith('/') ? `${gw}${path}` : `${gw}/${path}`
    try {
      const res = await fetchWithTimeout(url)
      if (res.ok) return res.json()
    } catch (_) { /* continue */ }
  }

  throw new Error('IPFS fetch failed across gateways')
}
