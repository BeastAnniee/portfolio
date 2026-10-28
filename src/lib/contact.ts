export const TIMEOUT_MS = 15_000

export const CONTACT_FIELDS = ['name', 'email', 'subject', 'message'] as const
export type ContactField = (typeof CONTACT_FIELDS)[number]
export type ContactData = Record<ContactField, string>
export type ContactError = 'required' | 'invalid-email'

export interface EmailConfig {
  serviceId: string
  templateId: string
  publicKey: string
}

export type SendResult = { ok: true } | { ok: false; reason: 'config' | 'network' | 'timeout' }

const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/

export function validateContact(data: ContactData): {
  errors: Partial<Record<ContactField, ContactError>>
  firstInvalid: ContactField | null
} {
  const errors: Partial<Record<ContactField, ContactError>> = {}
  for (const field of CONTACT_FIELDS) {
    const value = data[field].trim()
    if (!value) errors[field] = 'required'
    else if (field === 'email' && !EMAIL_RE.test(value)) errors[field] = 'invalid-email'
  }
  const firstInvalid = CONTACT_FIELDS.find((field) => errors[field]) ?? null
  return { errors, firstInvalid }
}

export function readEmailConfig(env: {
  service: string | undefined
  template: string | undefined
  key: string | undefined
}): EmailConfig | null {
  const serviceId = env.service?.trim()
  const templateId = env.template?.trim()
  const publicKey = env.key?.trim()
  if (!serviceId || !templateId || !publicKey) return null
  return { serviceId, templateId, publicKey }
}

export async function sendContact(args: {
  send: (config: EmailConfig, data: ContactData) => Promise<unknown>
  config: EmailConfig | null
  data: ContactData
  timeoutMs: number
}): Promise<SendResult> {
  const { send, config, timeoutMs } = args
  if (!config) return { ok: false, reason: 'config' }
  const data = Object.fromEntries(CONTACT_FIELDS.map((field) => [field, args.data[field].trim()])) as ContactData

  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<SendResult>((resolve) => {
    timer = setTimeout(() => resolve({ ok: false, reason: 'timeout' }), timeoutMs)
  })
  const attempt = (async (): Promise<SendResult> => {
    try {
      await send(config, data)
      return { ok: true }
    } catch {
      return { ok: false, reason: 'network' }
    }
  })()

  try {
    return await Promise.race([attempt, timeout])
  } finally {
    clearTimeout(timer)
  }
}

/** Al volver a escribir tras un envío correcto, el «enviado» deja de describir el formulario. */
export function statusAfterEdit<S extends string>(status: S): S | 'idle' {
  return status === 'success' ? 'idle' : status
}
