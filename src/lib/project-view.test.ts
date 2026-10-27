import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveProjectMedia } from './project-view.ts'

test('sin imagen, vacía o 404.png → image null', () => {
  assert.equal(resolveProjectMedia({}).image, null)
  assert.equal(resolveProjectMedia({ image: '' }).image, null)
  assert.equal(resolveProjectMedia({ image: '/404.png' }).image, null)
  assert.equal(resolveProjectMedia({ image: '   ' }).image, null)
})

test('sin enlace, vacío o # → href null', () => {
  assert.equal(resolveProjectMedia({}).href, null)
  assert.equal(resolveProjectMedia({ href: '' }).href, null)
  assert.equal(resolveProjectMedia({ href: '#' }).href, null)
  assert.equal(resolveProjectMedia({ href: '  ' }).href, null)
})

test('valores válidos se conservan', () => {
  assert.deepEqual(resolveProjectMedia({ image: '/portfolio.png', href: 'https://github.com/BeastAnniee/portfolio' }), {
    image: '/portfolio.png',
    href: 'https://github.com/BeastAnniee/portfolio',
  })
})
