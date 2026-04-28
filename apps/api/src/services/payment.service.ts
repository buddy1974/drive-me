import crypto from 'crypto'
import { prisma } from '../lib/prisma'
import { NotFoundError, UnauthorizedError, ValidationError } from './auth.service'

export { NotFoundError, UnauthorizedError, ValidationError }

export interface InitiateResult {
  paymentId:   string
  status:      'pending' | 'processing' | 'paid'
  message:     string
  paymentUrl?: string  // Orange Money WebPay redirect URL; absent for MTN/Cash
}

// ─── Token cache ──────────────────────────────────────────────────────────────

interface TokenCache {
  token:     string
  expiresAt: number  // unix ms
}

let mtnCollectionTokenCache: TokenCache | null = null
let mtnWithdrawTokenCache:   TokenCache | null = null
let orangeTokenCache:        TokenCache | null = null

async function fetchOAuthToken(
  tokenUrl:       string,
  consumerKey:    string,
  consumerSecret: string,
): Promise<string> {
  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      Authorization:  `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`OAuth token request to ${tokenUrl} failed (${res.status}): ${body}`)
  }

  const data = await res.json() as { access_token: string; expires_in?: number }
  return data.access_token
}

// ─── MTN MADAPI — Collections token (cached) ─────────────────────────────────

async function getMtnCollectionToken(): Promise<string> {
  const now = Date.now()
  if (mtnCollectionTokenCache && mtnCollectionTokenCache.expiresAt > now + 60_000) {
    return mtnCollectionTokenCache.token
  }

  const baseUrl        = process.env.MTN_MOMO_BASE_URL ?? 'https://api.mtn.com/v1'
  const consumerKey    = process.env.MTN_MOMO_API_USER!
  const consumerSecret = process.env.MTN_MOMO_API_KEY!

  const token = await fetchOAuthToken(
    `${baseUrl}/oauth/access_token`,
    consumerKey,
    consumerSecret,
  )

  mtnCollectionTokenCache = { token, expiresAt: now + 3600 * 1000 }
  return token
}

// ─── MTN MADAPI — Withdrawals token (cached) ─────────────────────────────────

async function getMtnWithdrawToken(): Promise<string> {
  const now = Date.now()
  if (mtnWithdrawTokenCache && mtnWithdrawTokenCache.expiresAt > now + 60_000) {
    return mtnWithdrawTokenCache.token
  }

  const withdrawBaseUrl = process.env.MTN_MOMO_WITHDRAW_URL ?? 'https://preprod.mtn.com/v1'
  const consumerKey     = process.env.MTN_MOMO_API_USER!
  const consumerSecret  = process.env.MTN_MOMO_API_KEY!

  const token = await fetchOAuthToken(
    `${withdrawBaseUrl}/oauth/access_token`,
    consumerKey,
    consumerSecret,
  )

  mtnWithdrawTokenCache = { token, expiresAt: now + 3600 * 1000 }
  return token
}

// ─── MTN MADAPI — Collect from user ──────────────────────────────────────────

async function requestMtnCollection(
  phone:       string,
  amount:      number,
  jobId:       string,
  referenceId: string,
): Promise<void> {
  const token   = await getMtnCollectionToken()
  const baseUrl = process.env.MTN_MOMO_BASE_URL ?? 'https://api.mtn.com/v1'

  const res = await fetch(`${baseUrl}/payments`, {
    method: 'POST',
    headers: {
      Authorization:    `Bearer ${token}`,
      'Content-Type':   'application/json',
      'X-Reference-Id': referenceId,
      'X-Callback-Url': 'https://drive-me.onrender.com/api/v1/payments/webhook/mtn',
    },
    body: JSON.stringify({
      amount:         String(Math.round(amount)),
      currency:       'XAF',
      customerMsisdn: phone.replace('+', ''),
      description:    'Drive Me job payment',
      referenceId:    jobId,
      payerNote:      'Drive Me delivery payment',
    }),
  })

  // 200 or 202 = accepted; anything else is an error
  if (res.status !== 200 && res.status !== 202) {
    const body = await res.text()
    throw new Error(`MTN MADAPI collection failed (${res.status}): ${body}`)
  }
}

// ─── MTN MADAPI — Pay out to agent ───────────────────────────────────────────

async function requestMtnWithdrawal(
  agentMomoPhone: string,
  amount:         number,
  payoutId:       string,
): Promise<void> {
  const token          = await getMtnWithdrawToken()
  const withdrawBaseUrl = process.env.MTN_MOMO_WITHDRAW_URL ?? 'https://preprod.mtn.com/v1'
  const apiKey         = process.env.MTN_MOMO_API_KEY!
  const correlatorId   = crypto.randomUUID()

  const res = await fetch(`${withdrawBaseUrl}/withdraw`, {
    method: 'POST',
    headers: {
      Authorization:  `Bearer ${token}`,
      'X-API-Key':    apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      correlatorId,
      callingSystem:     'EWP',
      externalReference: payoutId,
      customerId:        agentMomoPhone.replace('+', ''),
      status:            'Pending',
      amount: {
        amount: String(Math.round(amount)),
        units:  'XAF',
      },
      description: 'Drive Me agent payout',
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`MTN Withdrawal request failed (${res.status}): ${body}`)
  }
}

// ─── Orange Money — OAuth2 token (cached 3600s) ───────────────────────────────

async function orangeGetToken(): Promise<string> {
  const now = Date.now()
  if (orangeTokenCache && orangeTokenCache.expiresAt > now + 60_000) {
    return orangeTokenCache.token
  }

  const clientId     = process.env.ORANGE_CLIENT_ID!
  const clientSecret = process.env.ORANGE_CLIENT_SECRET!

  const token = await fetchOAuthToken(
    'https://api.orange.com/oauth/v3/token',
    clientId,
    clientSecret,
  )

  orangeTokenCache = { token, expiresAt: now + 3600 * 1000 }
  return token
}

// ─── Orange Money — WebPay initiation ────────────────────────────────────────
// Orange WebPay is a redirect flow: the response contains a payment_url that
// the customer must open in a browser to approve the transaction.

async function initiateOrangeMoney(
  amount: number,
  jobId:  string,
): Promise<string> {  // resolves to the payment_url
  const token       = await orangeGetToken()
  const merchantKey = process.env.ORANGE_MERCHANT_KEY!
  const webhookUrl  = 'https://drive-me.onrender.com/api/v1/payments/webhook/orange'

  const res = await fetch(
    'https://api.orange.com/orange-money-webpay/cm/v1/webpayment',
    {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        merchant_key: merchantKey,
        currency:     'XAF',
        order_id:     jobId,
        amount:       String(Math.round(amount)),
        return_url:   webhookUrl,
        cancel_url:   webhookUrl,
        notif_url:    webhookUrl,
        lang:         'fr',
        reference:    jobId,
      }),
    },
  )

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Orange WebPay initiation failed (${res.status}): ${body}`)
  }

  const data = await res.json() as {
    status?: number
    data?:   { payment_url?: string; payment_token?: string }
  }

  const paymentUrl = data.data?.payment_url
  if (!paymentUrl) {
    throw new Error('Orange WebPay response missing payment_url')
  }

  return paymentUrl
}

// ─── Orange Money — Webhook ───────────────────────────────────────────────────

export async function handleOrangeWebhook(
  rawBody:   string,
  signature: string | undefined,
): Promise<void> {
  // Orange signs webhook notifications with HMAC-SHA256 using the merchant key
  const merchantKey = process.env.ORANGE_MERCHANT_KEY
  if (merchantKey && signature) {
    const expected  = crypto.createHmac('sha256', merchantKey).update(rawBody).digest('hex')
    const sigBuffer = Buffer.from(signature, 'hex')
    const expBuffer = Buffer.from(expected, 'hex')
    if (sigBuffer.length !== expBuffer.length || !crypto.timingSafeEqual(sigBuffer, expBuffer)) {
      throw new UnauthorizedError('Invalid Orange webhook signature')
    }
  }

  const body = JSON.parse(rawBody) as {
    status?:    string
    order_id?:  string
    reference?: string
    txnid?:     string
    amount?:    string
    message?:   string
  }

  // Orange sends reference (our jobId) or order_id as identifier
  const referenceId = body.reference ?? body.order_id
  if (!referenceId) return

  const payment = await prisma.payment.findFirst({
    where: { OR: [{ mobileMoneyRef: referenceId }, { jobId: referenceId }] },
  })
  if (!payment || payment.status !== 'PROCESSING') return

  // Orange WebPay uses "SUCCESS" for approved transactions
  const isSuccess = body.status === 'SUCCESS'

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: isSuccess ? 'PAID' : 'FAILED',
      ...(!isSuccess ? { failureReason: body.message ?? 'Payment failed or cancelled' } : {}),
    },
  })

  if (isSuccess) await triggerPayout(payment.jobId)
}

// ─── Payout trigger ───────────────────────────────────────────────────────────

async function triggerPayout(jobId: string): Promise<void> {
  const payout = await prisma.payout.findUnique({
    where:   { jobId },
    include: { agent: { select: { momoPhone: true, orangePhone: true } } },
  })
  if (!payout || payout.status !== 'PENDING') return

  await prisma.payout.update({ where: { id: payout.id }, data: { status: 'PROCESSING' } })

  try {
    const hasMtnCreds    = !!(process.env.MTN_MOMO_API_USER && process.env.MTN_MOMO_API_KEY)
    const agentMomoPhone = payout.agent?.momoPhone

    if (hasMtnCreds && agentMomoPhone) {
      await requestMtnWithdrawal(agentMomoPhone, payout.amount, payout.id)
    } else {
      console.warn('[payout] Skipping MTN withdrawal — credentials or agent momoPhone missing')
    }

    await prisma.$transaction(async (tx) => {
      await tx.payout.update({
        where: { id: payout.id },
        data:  { status: 'PAID' },
      })
      await tx.agentEarnings.updateMany({
        where: { agentId: payout.agentId },
        data:  { pendingPayout: { decrement: payout.amount } },
      })
    })
  } catch (err) {
    console.error('[payout] failed for job', jobId, err)
    await prisma.payout.update({
      where: { id: payout.id },
      data:  { status: 'FAILED', failureReason: String(err) },
    })
  }
}

// ─── Initiate payment ─────────────────────────────────────────────────────────

export async function initiatePayment(
  jobId:  string,
  userId: string,
): Promise<InitiateResult> {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: {
      id:             true,
      userId:         true,
      status:         true,
      finalPrice:     true,
      estimatedPrice: true,
      paymentMethod:  true,
      user:           { select: { phone: true } },
    },
  })

  if (!job)                        throw new NotFoundError('Job not found')
  if (job.userId !== userId)       throw new UnauthorizedError('Access denied')
  if (job.status !== 'COMPLETED')  throw new ValidationError('Payment can only be initiated for completed jobs')

  const amount = job.finalPrice ?? job.estimatedPrice

  // Upsert payment record — idempotent if called more than once
  const payment = await prisma.payment.upsert({
    where:  { jobId },
    create: { jobId, userId, amount, method: job.paymentMethod, status: 'PENDING' },
    update: {},
  })

  if (payment.status === 'PAID') {
    return { paymentId: payment.id, status: 'paid', message: 'Payment already completed' }
  }
  if (payment.status === 'PROCESSING') {
    return { paymentId: payment.id, status: 'processing', message: 'Payment already in progress' }
  }
  if (payment.status !== 'PENDING') {
    throw new ValidationError(`Cannot initiate payment with status: ${payment.status}`)
  }

  // ── CASH: settle immediately ────────────────────────────────────────────────
  if (job.paymentMethod === 'CASH') {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: 'PAID' } })
    await triggerPayout(jobId)
    return { paymentId: payment.id, status: 'paid', message: 'Cash payment recorded' }
  }

  // ── MTN MoMo ────────────────────────────────────────────────────────────────
  if (job.paymentMethod === 'MTN_MOMO') {
    if (!process.env.MTN_MOMO_API_KEY || !process.env.MTN_MOMO_API_USER) {
      console.warn('[payment] MTN MADAPI credentials not configured')
      return { paymentId: payment.id, status: 'pending', message: 'Payment processor not configured' }
    }

    const referenceId = crypto.randomUUID()
    try {
      await requestMtnCollection(job.user.phone, amount, jobId, referenceId)
      await prisma.payment.update({
        where: { id: payment.id },
        data:  { status: 'PROCESSING', mobileMoneyRef: referenceId },
      })
      return {
        paymentId: payment.id,
        status:    'processing',
        message:   'MTN MoMo payment request sent — approve on your phone',
      }
    } catch (err) {
      console.error('[payment] MTN MADAPI collection failed', err)
      await prisma.payment.update({
        where: { id: payment.id },
        data:  { status: 'FAILED', failureReason: String(err) },
      })
      throw new ValidationError('MTN MoMo payment request failed — please retry')
    }
  }

  // ── Orange Money (WebPay redirect flow) ─────────────────────────────────────
  if (job.paymentMethod === 'ORANGE_MONEY') {
    const hasCreds = !!(
      process.env.ORANGE_CLIENT_ID &&
      process.env.ORANGE_CLIENT_SECRET &&
      process.env.ORANGE_MERCHANT_KEY
    )

    if (!hasCreds) {
      console.warn('[payment] Orange Money credentials not configured (need ORANGE_CLIENT_ID, ORANGE_CLIENT_SECRET, ORANGE_MERCHANT_KEY)')
      return { paymentId: payment.id, status: 'pending', message: 'Payment processor not configured' }
    }

    try {
      const paymentUrl = await initiateOrangeMoney(amount, jobId)
      await prisma.payment.update({
        where: { id: payment.id },
        // Use jobId as the reference so the webhook can match by order_id/reference
        data:  { status: 'PROCESSING', mobileMoneyRef: jobId },
      })
      return {
        paymentId:  payment.id,
        status:     'processing',
        message:    'Orange Money payment ready — complete payment on the Orange Money page',
        paymentUrl,
      }
    } catch (err) {
      console.error('[payment] Orange WebPay initiation failed', err)
      await prisma.payment.update({
        where: { id: payment.id },
        data:  { status: 'FAILED', failureReason: String(err) },
      })
      throw new ValidationError('Orange Money payment initiation failed — please retry')
    }
  }

  throw new ValidationError(`Unknown payment method: ${job.paymentMethod}`)
}

// ─── MTN webhook ──────────────────────────────────────────────────────────────

export async function processMtnWebhook(
  rawBody:   string,
  signature: string | undefined,
): Promise<void> {
  // Signature verification using the API key as the HMAC secret
  const apiKey = process.env.MTN_MOMO_API_KEY
  if (apiKey && signature) {
    const expected  = crypto.createHmac('sha256', apiKey).update(rawBody).digest('hex')
    const sigBuffer = Buffer.from(signature.replace('sha256=', ''), 'hex')
    const expBuffer = Buffer.from(expected, 'hex')
    if (sigBuffer.length !== expBuffer.length || !crypto.timingSafeEqual(sigBuffer, expBuffer)) {
      throw new UnauthorizedError('Invalid MTN webhook signature')
    }
  }

  const body = JSON.parse(rawBody) as {
    referenceId?: string
    externalId?:  string
    status?:      string
    financialTransactionId?: string
    reason?:      unknown
  }

  const referenceId = body.referenceId ?? body.externalId
  if (!referenceId) return

  const payment = await prisma.payment.findFirst({ where: { mobileMoneyRef: referenceId } })
  if (!payment || payment.status !== 'PROCESSING') return

  const isSuccess = body.status === 'SUCCESSFUL'

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: isSuccess ? 'PAID' : 'FAILED',
      ...(!isSuccess ? { failureReason: JSON.stringify(body.reason ?? 'Payment failed') } : {}),
    },
  })

  if (isSuccess) await triggerPayout(payment.jobId)
}

// ─── Orange webhook (public alias) ───────────────────────────────────────────

export async function processOrangeWebhook(
  rawBody:   string,
  signature: string | undefined,
): Promise<void> {
  return handleOrangeWebhook(rawBody, signature)
}

// ─── Get payment ──────────────────────────────────────────────────────────────

export async function getPaymentByJobId(jobId: string, userId: string) {
  const payment = await prisma.payment.findUnique({
    where: { jobId },
    select: {
      id:             true,
      jobId:          true,
      amount:         true,
      method:         true,
      status:         true,
      mobileMoneyRef: true,
      failureReason:  true,
      createdAt:      true,
      updatedAt:      true,
    },
  })

  if (!payment) throw new NotFoundError('Payment not found')

  const job = await prisma.job.findUnique({ where: { id: jobId }, select: { userId: true } })
  if (!job || job.userId !== userId) throw new UnauthorizedError('Access denied')

  return payment
}
