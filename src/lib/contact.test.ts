import test from 'node:test'
import assert from 'node:assert/strict'
import { validateContact, readEmailConfig, sendContact, statusAfterEdit, CONTACT_FIELDS, TIMEOUT_MS } from './contact.ts'

const valid = { name: 'Ana', email: 'ana@example.com', subject: 'Hola', message: 'Un mensaje' }
const config = { serviceId: 's', templateId: 't', publicKey: 'k' }

test('TIMEOUT_MS = 15 s y orden de campos para el foco', () => {
  assert.equal(TIMEOUT_MS, 15_000)
  assert.deepEqual([...CONTACT_FIELDS], ['name', 'email', 'subject', 'message'])
})

test('validateContact: datos válidos', () => {
  assert.deepEqual(validateContact(valid), { errors: {}, firstInvalid: null })
})

test('validateContact: vacío → required en todos y el primero es name', () => {
  const r = validateContact({ name: '', email: '', subject: '', message: '' })
  assert.deepEqual(r.errors, { name: 'required', email: 'required', subject: 'required', message: 'required' })
  assert.equal(r.firstInvalid, 'name')
})

test('validateContact: espacios cuentan como vacío', () => {
  assert.equal(validateContact({ ...valid, subject: '   ' }).errors.subject, 'required')
})

test('validateContact: correo inválido y orden del primer error', () => {
  const r = validateContact({ ...valid, email: 'no-es-correo', message: '' })
  assert.equal(r.errors.email, 'invalid-email')
  assert.equal(r.errors.message, 'required')
  assert.equal(r.firstInvalid, 'email')
  for (const bad of ['a@b', 'a b@c.com', '@c.com', 'a@.com']) {
    assert.equal(validateContact({ ...valid, email: bad }).errors.email, 'invalid-email', bad)
  }
})

test('readEmailConfig: null si falta o está vacía cualquiera', () => {
  assert.deepEqual(readEmailConfig({ service: 's', template: 't', key: 'k' }), config)
  assert.equal(readEmailConfig({ service: undefined, template: 't', key: 'k' }), null)
  assert.equal(readEmailConfig({ service: 's', template: '', key: 'k' }), null)
  assert.equal(readEmailConfig({ service: 's', template: 't', key: '  ' }), null)
})

test('sendContact: éxito', async () => {
  let calls = 0
  const r = await sendContact({ send: async () => { calls++ }, config, data: valid, timeoutMs: 50 })
  assert.deepEqual(r, { ok: true })
  assert.equal(calls, 1)
})

test('sendContact: envía los campos recortados, como los validó validateContact', async () => {
  let sent: unknown
  const padded = { name: ' Ana ', email: 'ana@example.com ', subject: ' Hola', message: 'Un mensaje\n' }
  await sendContact({ send: async (_c, d) => { sent = d }, config, data: padded, timeoutMs: 50 })
  assert.deepEqual(sent, valid)
})

test('sendContact: sin configuración no llama a send', async () => {
  let calls = 0
  const r = await sendContact({ send: async () => { calls++ }, config: null, data: valid, timeoutMs: 50 })
  assert.deepEqual(r, { ok: false, reason: 'config' })
  assert.equal(calls, 0)
})

test('sendContact: send rechaza → network (nunca lanza)', async () => {
  const r = await sendContact({
    send: async () => { throw new Error('boom') },
    config, data: valid, timeoutMs: 50,
  })
  assert.deepEqual(r, { ok: false, reason: 'network' })
})

test('sendContact: send que no resuelve → timeout, y una respuesta tardía no cambia el resultado', async () => {
  let resolveLate: () => void = () => {}
  const never = new Promise<void>((resolve) => { resolveLate = resolve })
  const started = Date.now()
  const r = await sendContact({ send: () => never, config, data: valid, timeoutMs: 20 })
  assert.deepEqual(r, { ok: false, reason: 'timeout' })
  assert.ok(Date.now() - started < 1000)
  resolveLate()
})

test('sendContact: el temporizador se limpia tras un éxito rápido', async () => {
  const before = process.getActiveResourcesInfo().filter((x) => x === 'Timeout').length
  await sendContact({ send: async () => {}, config, data: valid, timeoutMs: 60_000 })
  const after = process.getActiveResourcesInfo().filter((x) => x === 'Timeout').length
  assert.ok(after <= before)
})

test('statusAfterEdit: escribir de nuevo borra el «enviado» y respeta el resto de estados', () => {
  assert.equal(statusAfterEdit('success'), 'idle')
  assert.equal(statusAfterEdit('sending'), 'sending')
  assert.equal(statusAfterEdit('error'), 'error')
  assert.equal(statusAfterEdit('idle'), 'idle')
})
