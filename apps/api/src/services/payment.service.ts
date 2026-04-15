import crypto from 'crypto'
import { prisma } from '../lib/prisma'
import { NotFoundError, UnauthorizedError, ValidationError } from './auth.service'

export { NotFoundError, UnauthorizedError, ValidationError }

export interface InitiateResult {
  paymentId: string
  status: 'pending' | 'processing' | 'paid'
  message: string
}

// ─── MTN MoMo helpers ─────────────────────────────────────────────────────────

async function getMtnAccessToken(): Promise<string> {
  const apiUser = process.env.MTN_MOMO_API_USER
  const apiKey  = process.env.MTN_MOMO_API_KEY
  const subKey  = process.env.MTN_MOMO_SUBSCRIPTION_KEY

  const credentials = Buffer.from(`${apiUser}:${apiKey}`).toString('base64')

  const res = await fetch('https://sandbox.momodeveloper.mtn.com/collection/token/', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Ocp-Apim-Subscription-Key': subKey!,
    },
  })

  if (!res.ok) throw new Error(`MTN token request failed: ${res.status}`)
  const data = await res.json() as { access_token: string }
  return data.access_token
}

async function requestMtnCollection(
  phone: string,
  amount: number,
  referenceId: string,
): Promise<void> {
  const token  = await getMtnAccessToken()
  const subKey = process.env.MTN_MOMO_SUBSCRIPTION_KEY!

  const res = await fetch(
    'https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay',
    {
      method: 'POST',
      headers: {
        Authorization:                `Bearer ${token}`,
        'X-Reference-Id':             referenceId,
        'X-Target-Environment':       'sandbox',
        'Ocp-Apim-Subscription-Key':  subKey,
        'Content-Type':               'application/json',
        'X-Callback-Url':             `${process.env.API_BASE_URL ?? ''}/api/v1/payments/webhook/mtn`,
      },
      body: JSON.stringify({
        amount:       String(Math.round(amount)),
        currency:     'XAF',
        externalId:   referenceId,
        payer:        { partyIdType: 'MSISDN', partyId: phone.replace('+', '') },
        payerMessage: 'Drive Me payment',
        payeeNote:    'Drive Me service',
      }),
    },
  )

  // 202 = accepted (async); anything else is a failure
  if (res.status !== 202) {
    const body = await res.text()
    throw new Error(`MTN collection request failed (${res.status}): ${body}`)
  }
}

// ─── Orange Money helpers ─────────────────────────────────────────────────────

async function getOrangeAccessToken(): Promise<string> {
  const apiKey = process.env.ORANGE_MONEY_API_KEY!
  const credentials = Buffer.from(apiKey).toString('base64')

  const res = await fetch('https://api.orange.com/oauth/v3/token', {
    method: 'POST',
    headers: {
      Authorization:  `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept:         'application/json',
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) throw new Error(`Orange token request failed: ${res.status}`)
  const data = await res.json() as { access_token: string }
  return data.access_token
}

async function requestOrangeCollection(
  phone: string,
  amount: number,
  referenceId: string,
  orderId: string,
): Promise<void> {
  const token  = await getOrangeAccessToken()
  const apiKey = process.env.ORANGE_MONEY_API_KEY!

  const res = await fetch(
    'https://api.orange.com/orange-money-webpay/cm/v1/webpayment',
    {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        merchant_key: apiKey,
        currency:     'XAF',
        order_id:     orderId,
        amount:       String(Math.round(amount)),
        return_url:   process.env.ORANGE_RETURN_URL  ?? '',
        cancel_url:   process.env.ORANGE_CANCEL_URL  ?? '',
        notif_url:    `${process.env.API_BASE_URL ?? ''}/api/v1/payments/webhook/orange`,
        lang:         'fr',
        reference:    referenceId,
        customer_msisdn: phone.replace('+', ''),
      }),
    },
  )

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Orange collection request failed (${res.status}): ${body}`)
  }
}

// ─── Payout trigger ───────────────────────────────────────────────────────────

async function triggerPayout(jobId: string): Promise<void> {
  const payout = await prisma.payout.findUnique({ where: { jobId } })
  if (!payout || payout.status !== 'PENDING') return

  await prisma.payout.update({ where: { id: payout.id }, data: { status: 'PROCESSING' } })

  try {
    // Production: call MTN Disbursement or Orange Transfer API here.
    // For now we mark PAID immediately (settlement handled manually / via future disbursement task).
    await prisma.$transaction(async (tx) => {
      await tx.payout.update({
        where: { id: payout.id },
        data: { status: 'PAID' },
      })
      // Reduce the pendingPayout balance on the agent's earnings record
      await tx.agentEarnings.updateMany({
        where: { agentId: payout.agentId },
        data: { pendingPayout: { decrement: payout.amount } },
      })
    })
  } catch (err) {
    console.error('[payout] failed for job', jobId, err)
    await prisma.payout.update({
      where: { id: payout.id },
      data: { status: 'FAILED', failureReason: 'Payout processing failed' },
    })
  }
}

// ─── Initiate payment ─────────────────────────────────────────────────────────

export async function initiatePayment(
  jobId: string,
  userId: string,
): Promise<InitiateResult> {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      userId: true,
      status: true,
      finalPrice: true,
      estimatedPrice: true,
      paymentMethod: true,
      user: { select: { phone: true } },
    },
  })

  if (!job) throw new NotFoundError('Job not found')
  if (job.userId !== userId) throw new UnauthorizedError('Access denied')
  if (job.status !== 'COMPLETED') throw new ValidationError('Payment can only be initiated for completed jobs')

  const amount = job.finalPrice ?? job.estimatedPrice

  // Upsert payment record — idempotent if called more than once
  const payment = await prisma.payment.upsert({
    where: { jobId },
    create: {
      jobId,
      userId,
      amount,
      method: job.paymentMethod,
      status: 'PENDING',
    },
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
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'PAID' },
    })
    await triggerPayout(jobId)
    return { paymentId: payment.id, status: 'paid', message: 'Cash payment recorded' }
  }

  // ── MTN MoMo ────────────────────────────────────────────────────────────────
  if (job.paymentMethod === 'MTN_MOMO') {
    if (!process.env.MTN_MOMO_API_KEY || !process.env.MTN_MOMO_API_USER || !process.env.MTN_MOMO_SUBSCRIPTION_KEY) {
      console.warn('[payment] MTN MoMo credentials not configured')
      return { paymentId: payment.id, status: 'pending', message: 'Payment processor not configured' }
    }

    const referenceId = crypto.randomUUID()
    try {
      await requestMtnCollection(job.user.phone, amount, referenceId)
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'PROCESSING', mobileMoneyRef: referenceId },
      })
      return { paymentId: payment.id, status: 'processing', message: 'MTN MoMo payment request sent — approve on your phone' }
    } catch (err) {
      console.error('[payment] MTN collection failed', err)
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED', failureReason: String(err) },
      })
      throw new ValidationError('MTN MoMo payment request failed — please retry')
    }
  }

  // ── Orange Money ─────────────────────────────────────────────────────────────
  if (job.paymentMethod === 'ORANGE_MONEY') {
    if (!process.env.ORANGE_MONEY_API_KEY) {
      console.warn('[payment] Orange Money credentials not configured')
      return { paymentId: payment.id, status: 'pending', message: 'Payment processor not configured' }
    }

    const referenceId = crypto.randomUUID()
    try {
      await requestOrangeCollection(job.user.phone, amount, referenceId, jobId)
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'PROCESSING', mobileMoneyRef: referenceId },
      })
      return { paymentId: payment.id, status: 'processing', message: 'Orange Money payment request sent — approve on your phone' }
    } catch (err) {
      console.error('[payment] Orange collection failed', err)
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED', failureReason: String(err) },
      })
      throw new ValidationError('Orange Money payment request failed — please retry')
    }
  }

  throw new ValidationError(`Unknown payment method: ${job.paymentMethod}`)
}

// ─── MTN webhook ──────────────────────────────────────────────────────────────

export async function processMtnWebhook(
  rawBody: string,
  signature: string | undefined,
): Promise<void> {
  // Verify HMAC-SHA256 signature using subscription key
  const subKey = process.env.MTN_MOMO_SUBSCRIPTION_KEY
  if (subKey && signature) {
    const expected = crypto.createHmac('sha256', subKey).update(rawBody).digest('hex')
    const sigBuffer = Buffer.from(signature.replace('sha256=', ''), 'hex')
    const expBuffer = Buffer.from(expected, 'hex')
    if (sigBuffer.length !== expBuffer.length || !crypto.timingSafeEqual(sigBuffer, expBuffer)) {
      throw new UnauthorizedError('Invalid MTN webhook signature')
    }
  }

  const body = JSON.parse(rawBody) as {
    referenceId?: string
    externalId?: string
    status?: string
    financialTransactionId?: string
    reason?: unknown
  }

  const referenceId = body.referenceId ?? body.externalId
  if (!referenceId) return

  const payment = await prisma.payment.findFirst({
    where: { mobileMoneyRef: referenceId },
  })
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

// ─── Orange webhook ───────────────────────────────────────────────────────────

export async function processOrangeWebhook(
  rawBody: string,
  signature: string | undefined,
): Promise<void> {
  const apiKey = process.env.ORANGE_MONEY_API_KEY
  if (apiKey && signature) {
    const expected = crypto.createHmac('sha256', apiKey).update(rawBody).digest('hex')
    const sigBuffer = Buffer.from(signature, 'hex')
    const expBuffer = Buffer.from(expected, 'hex')
    if (sigBuffer.length !== expBuffer.length || !crypto.timingSafeEqual(sigBuffer, expBuffer)) {
      throw new UnauthorizedError('Invalid Orange webhook signature')
    }
  }

  const body = JSON.parse(rawBody) as {
    status?: string
    order_id?: string
    reference?: string
    txnid?: string
    amount?: string
    message?: string
  }

  const referenceId = body.reference ?? body.order_id
  if (!referenceId) return

  const payment = await prisma.payment.findFirst({
    where: { OR: [{ mobileMoneyRef: referenceId }, { jobId: referenceId }] },
  })
  if (!payment || payment.status !== 'PROCESSING') return

  const isSuccess = body.status === 'SUCCESS'

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: isSuccess ? 'PAID' : 'FAILED',
      ...(!isSuccess ? { failureReason: body.message ?? 'Payment failed' } : {}),
    },
  })

  if (isSuccess) await triggerPayout(payment.jobId)
}

// ─── Get payment ──────────────────────────────────────────────────────────────

export async function getPaymentByJobId(jobId: string, userId: string) {
  const payment = await prisma.payment.findUnique({
    where: { jobId },
    select: {
      id: true,
      jobId: true,
      amount: true,
      method: true,
      status: true,
      mobileMoneyRef: true,
      failureReason: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!payment) throw new NotFoundError('Payment not found')

  // Verify ownership via job
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { userId: true },
  })
  if (!job || job.userId !== userId) throw new UnauthorizedError('Access denied')

  return payment
}
