// Kapital Bank mTLS payment gateway client
// API docs: https://pg.kapitalbank.az/docs
// MOCK MODE active when KAPITAL_CERT_BASE64 / KAPITAL_KEY_BASE64 are absent

import { Agent, fetch as undiciFetch } from 'undici'

export type KBOrderType = 'Purchase' | 'PreAuth'

export interface KBCreateResult {
  orderId: string
  sessionId: string
  paymentUrl: string
  orderType: KBOrderType
  isMock: boolean
}

export interface KBStatusResult {
  orderId: string
  orderStatus: string
  isMock: boolean
}

export class KapitalBankError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly raw: string
  ) {
    super(message)
    this.name = 'KapitalBankError'
  }
}

export function mapKBStatus(raw: string): 'paid' | 'failed' | 'pending' | 'cancelled' {
  switch (raw?.toUpperCase()) {
    case 'APPROVED':
      return 'paid'
    case 'DECLINED':
      return 'failed'
    case 'REVERSED':
    case 'REFUNDED':
      return 'cancelled'
    default:
      return 'pending'
  }
}

interface KBClientOptions {
  merchantId: string
  approveUrl: string
  cancelUrl: string
  declineUrl: string
  liveMode: boolean
  cert: string | null
  key: string | null
}

export class KapitalBankClient {
  private readonly baseUrl: string
  private readonly merchantId: string
  private readonly approveUrl: string
  private readonly cancelUrl: string
  private readonly declineUrl: string
  private readonly cert: string | null
  private readonly key: string | null
  readonly isMockMode: boolean

  constructor(opts: KBClientOptions) {
    this.merchantId = opts.merchantId
    this.approveUrl = opts.approveUrl
    this.cancelUrl = opts.cancelUrl
    this.declineUrl = opts.declineUrl
    this.cert = opts.cert
    this.key = opts.key
    this.isMockMode = !opts.cert || !opts.key
    this.baseUrl = opts.liveMode
      ? 'https://txpg.kapitalbank.az'
      : 'https://tstpg.kapitalbank.az'

    if (this.isMockMode) {
      console.warn(
        '[KapitalBank] MOCK MODE — KAPITAL_CERT_BASE64 / KAPITAL_KEY_BASE64 not set. ' +
          'Returning synthetic responses. Set env vars when certificates arrive.'
      )
    }
  }

  async createOrder(
    amountAZN: number,
    description: string,
    preAuth = false
  ): Promise<KBCreateResult> {
    if (this.isMockMode) {
      const ts = Date.now()
      const mockId = `MOCK-${ts}`
      const mockSess = `SESS-${ts}`
      const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(
        /\/$/,
        ''
      )
      return {
        orderId: mockId,
        sessionId: mockSess,
        paymentUrl: `${siteUrl}/payment/success?ORDERID=${mockId}&SESSIONID=${mockSess}&mock=1`,
        orderType: 'Purchase',
        isMock: true,
      }
    }

    type CreateResponse = {
      order?: { id?: string | number; password?: string }
    }

    const body = {
      order: {
        typeRid: preAuth ? 'PreAuth' : 'Purchase',
        amount: Math.round(amountAZN * 100),
        currency: 944,
        language: 'AZ',
        description,
        hppRedirectUrl: this.approveUrl,
        merchant: { id: this.merchantId },
      },
      redirect: {
        approveUrl: this.approveUrl,
        cancelUrl: this.cancelUrl,
        declineUrl: this.declineUrl,
      },
    }

    const data = await this.request<CreateResponse>('POST', '/api/order', body)

    const kbOrderId = String(data?.order?.id ?? '')
    const kbSessionId = String(data?.order?.password ?? '')

    if (!kbOrderId || !kbSessionId) {
      throw new KapitalBankError(
        'Missing orderId or sessionId in bank response',
        502,
        JSON.stringify(data)
      )
    }

    const paymentUrl = `${this.baseUrl}/index.jsp?ORDERID=${encodeURIComponent(kbOrderId)}&SESSIONID=${encodeURIComponent(kbSessionId)}`

    return {
      orderId: kbOrderId,
      sessionId: kbSessionId,
      paymentUrl,
      orderType: preAuth ? 'PreAuth' : 'Purchase',
      isMock: false,
    }
  }

  async getOrderStatus(kbOrderId: string, kbSessionId: string): Promise<KBStatusResult> {
    if (this.isMockMode) {
      return { orderId: kbOrderId, orderStatus: 'APPROVED', isMock: true }
    }

    type StatusResponse = {
      order?: { status?: string; id?: string | number }
    }

    const data = await this.request<StatusResponse>(
      'GET',
      `/api/order/${encodeURIComponent(kbOrderId)}/status?password=${encodeURIComponent(kbSessionId)}`
    )

    return {
      orderId: kbOrderId,
      orderStatus: String(data?.order?.status ?? 'CREATED'),
      isMock: false,
    }
  }

  private async request<T>(method: 'GET' | 'POST', path: string, body?: object): Promise<T> {
    const agent = new Agent({ connect: { cert: this.cert!, key: this.key! } })

    const url = `${this.baseUrl}${path}`
    const res = await undiciFetch(url, {
      method,
      dispatcher: agent,
      headers: { 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })

    if (!res.ok) {
      const raw = await res.text().catch(() => '')
      throw new KapitalBankError(`Kapital Bank HTTP ${res.status}`, res.status, raw)
    }

    return res.json() as Promise<T>
  }
}

let _client: KapitalBankClient | null = null

export function getKapitalBankClient(): KapitalBankClient {
  if (_client) return _client

  const merchantId = process.env.KAPITAL_MERCHANT_ID?.trim() || 'MOCK_MERCHANT'
  const liveMode = process.env.KAPITAL_LIVE_MODE === 'true'
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

  const certB64 = process.env.KAPITAL_CERT_BASE64?.trim()
  const keyB64 = process.env.KAPITAL_KEY_BASE64?.trim()

  const cert = certB64 ? Buffer.from(certB64, 'base64').toString('utf-8') : null
  const key = keyB64 ? Buffer.from(keyB64, 'base64').toString('utf-8') : null

  _client = new KapitalBankClient({
    merchantId,
    approveUrl: `${siteUrl}/payment/success`,
    cancelUrl: `${siteUrl}/payment/cancel`,
    declineUrl: `${siteUrl}/payment/failed`,
    liveMode,
    cert,
    key,
  })
  return _client
}
