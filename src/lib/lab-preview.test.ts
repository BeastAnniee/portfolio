import test from 'node:test'
import assert from 'node:assert/strict'
import { anchorOffset, previewOffset, shouldPreview } from './lab-preview.ts'

const list = { listTop: 100, listHeight: 600, previewHeight: 160 }

test('previewOffset centra la miniatura en el puntero', () => {
  assert.equal(previewOffset({ ...list, pointerY: 400 }), 300 - 80)
})

test('previewOffset se acota dentro de la lista', () => {
  assert.equal(previewOffset({ ...list, pointerY: 50 }), 0)
  assert.equal(previewOffset({ ...list, pointerY: 120 }), 0)
  assert.equal(previewOffset({ ...list, pointerY: 5000 }), 600 - 160)
  assert.equal(previewOffset({ listTop: 0, listHeight: 100, previewHeight: 160, pointerY: 50 }), 0)
})

test('anchorOffset ancla al borde superior de la fila con el mismo acotado', () => {
  assert.equal(anchorOffset({ ...list, rowTop: 250 }), 150)
  assert.equal(anchorOffset({ ...list, rowTop: 90 }), 0)
  assert.equal(anchorOffset({ ...list, rowTop: 900 }), 440)
  assert.equal(anchorOffset({ listTop: 0, listHeight: 100, previewHeight: 160, rowTop: 30 }), 0)
})

test('shouldPreview: hover real y sin reduced-motion', () => {
  assert.equal(shouldPreview({ hover: true, reducedMotion: false }), true)
  assert.equal(shouldPreview({ hover: true, reducedMotion: true }), false)
  assert.equal(shouldPreview({ hover: false, reducedMotion: false }), false)
  assert.equal(shouldPreview({ hover: false, reducedMotion: true }), false)
})
