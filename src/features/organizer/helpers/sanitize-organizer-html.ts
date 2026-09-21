const allowedTags = new Set(['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'span', 'div'])

function escapeText(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function sanitizeWithoutDom(html: string) {
  let output = ''
  let cursor = 0
  while (cursor < html.length) {
    const open = html.indexOf('<', cursor)
    if (open < 0) { output += escapeText(html.slice(cursor)); break }
    output += escapeText(html.slice(cursor, open))
    const close = html.indexOf('>', open + 1)
    if (close < 0) break
    const token = html.slice(open + 1, close).trim()
    const closing = token.startsWith('/')
    const body = token.slice(closing ? 1 : 0).trim()
    const nameEnd = body.search(/[\s/>]/u)
    const name = (nameEnd < 0 ? body : body.slice(0, nameEnd)).toLowerCase()
    if (name && allowedTags.has(name)) {
      if (!closing && name === 'span') {
        const styleStart = body.toLowerCase().indexOf('style=')
        if (styleStart >= 0) {
          const quoted = body.slice(styleStart + 6).trim()
          const quote = quoted[0]
          const end = quote === '"' || quote === "'" ? quoted.indexOf(quote, 1) : -1
          const style = end > 0 ? quoted.slice(1, end).trim() : ''
          const separator = style.indexOf(':')
          const property = separator < 0 ? '' : style.slice(0, separator).trim().toLowerCase()
          const value = separator < 0 ? '' : style.slice(separator + 1).trim()
          const safeValue = value.startsWith('#') || value.toLowerCase().startsWith('rgb(') ? value : ''
          output += safeValue && property === 'color' ? `<span style="color: ${safeValue}">` : '<span>'
        } else output += '<span>'
      } else output += `<${closing ? '/' : ''}${name}>`
    }
    cursor = close + 1
  }
  return output
}

/** Browser parser allowlist. Uses a token parser outside a DOM for Node tests. */
export function sanitizeOrganizerHtml(html: string) {
  if (typeof DOMParser === 'undefined') return sanitizeWithoutDom(html)
  const document = new DOMParser().parseFromString(html, 'text/html')
  for (const element of [...document.body.querySelectorAll('*')]) {
    if (!allowedTags.has(element.tagName.toLowerCase())) {
      element.replaceWith(...element.childNodes)
      continue
    }
    for (const attribute of [...element.attributes]) {
      if (attribute.name === 'style' && element.tagName.toLowerCase() === 'span') {
        const color = /^\s*color\s*:\s*(#[0-9a-f]{3,8}|rgb\([\d\s,]+\))\s*;?\s*$/i.exec(attribute.value)
        if (color) { element.setAttribute('style', `color: ${color[1]}`); continue }
      }
      element.removeAttribute(attribute.name)
    }
  }
  return document.body.innerHTML
}
