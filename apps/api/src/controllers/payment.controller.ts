import { Request, Response } from 'express'
import {
  initiatePayment,
  processMtnWebhook,
  handleOrangeWebhook,
  getPaymentByJobId,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../services/payment.service'

function handleError(res: Response, err: unknown): void {
  if (err instanceof NotFoundError) {
    res.status(404).json({ error: err.message })
  } else if (err instanceof UnauthorizedError) {
    res.status(401).json({ error: err.message })
  } else if (err instanceof ValidationError) {
    res.status(400).json({ error: err.message })
  } else {
    res.status(500).json({ error: 'Internal server error' })
  }
}

// POST /api/v1/payments/initiate
export async function initiatePaymentHandler(req: Request, res: Response): Promise<void> {
  try {
    if (req.actor.role !== 'user') {
      res.status(403).json({ error: 'Only users can initiate payments' })
      return
    }
    const { jobId } = req.body as { jobId: string }
    const result = await initiatePayment(jobId, req.actor.actorId)
    res.json(result)
  } catch (err) {
    handleError(res, err)
  }
}

// POST /api/v1/payments/webhook/mtn
export async function mtnWebhookHandler(req: Request, res: Response): Promise<void> {
  try {
    const rawBody  = (req as Request & { rawBody?: string }).rawBody ?? JSON.stringify(req.body)
    const signature = req.headers['x-callback-signature'] as string | undefined
    await processMtnWebhook(rawBody, signature)
    res.status(200).json({ received: true })
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      res.status(401).json({ error: err.message })
    } else {
      console.error('[webhook/mtn]', err)
      res.status(500).json({ error: 'Webhook processing failed' })
    }
  }
}

// POST /api/v1/payments/webhook/orange
export async function orangeWebhookHandler(req: Request, res: Response): Promise<void> {
  try {
    const rawBody   = (req as Request & { rawBody?: string }).rawBody ?? JSON.stringify(req.body)
    const signature = req.headers['x-orange-signature'] as string | undefined
    await handleOrangeWebhook(rawBody, signature)
    res.status(200).json({ received: true })
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      res.status(401).json({ error: err.message })
    } else {
      console.error('[webhook/orange]', err)
      res.status(500).json({ error: 'Webhook processing failed' })
    }
  }
}

// GET /api/v1/payments/:jobId
export async function getPaymentHandler(req: Request, res: Response): Promise<void> {
  try {
    if (req.actor.role !== 'user') {
      res.status(403).json({ error: 'Only users can view payment status' })
      return
    }
    const payment = await getPaymentByJobId(req.params.jobId, req.actor.actorId)
    res.json(payment)
  } catch (err) {
    handleError(res, err)
  }
}
