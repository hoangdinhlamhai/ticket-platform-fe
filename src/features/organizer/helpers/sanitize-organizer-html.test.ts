import assert from 'node:assert/strict'
import test from 'node:test'
import { sanitizeOrganizerHtml } from './sanitize-organizer-html.ts'

test('sanitizes unsafe markup while keeping basic formatting', () => {
  const output = sanitizeOrganizerHtml('<p onclick="alert(1)"><strong>Xin chào</strong><script>alert(1)</script><a href="javascript:bad">link</a></p>')
  assert.match(output, /<strong>Xin chào<\/strong>/)
  assert.doesNotMatch(output, /script|onclick|javascript/i)
})

test('keeps only safe inline color styles', () => {
  const output = sanitizeOrganizerHtml('<span style="color:#ff0000">đỏ</span><span style="background-image:url(x)">x</span>')
  assert.match(output, /color:\s*#ff0000/)
  assert.doesNotMatch(output, /background-image|url\(/i)
})
