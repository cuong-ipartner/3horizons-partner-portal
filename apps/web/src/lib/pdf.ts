/**
 * Minimal single-page PDF generator (no external deps).
 * For demo seed / placeholder when real design PDFs are not uploaded yet.
 */

function escapePdfText(s: string) {
  return s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

/** Build a simple Helvetica PDF with title + body lines. */
export function buildSimplePdf(opts: {
  title: string
  lines?: string[]
  footer?: string
}): Blob {
  const title = escapePdfText(opts.title.slice(0, 80))
  const lines = (opts.lines ?? []).slice(0, 12).map((l) => escapePdfText(l.slice(0, 90)))
  const footer = escapePdfText(
    (opts.footer ?? '3HORIZONS · Partner library · Confidential').slice(0, 90),
  )

  const contentLines = [
    'BT',
    '/F1 18 Tf',
    '50 740 Td',
    `(${title}) Tj`,
    '/F1 11 Tf',
    '0 -28 Td',
  ]

  for (let i = 0; i < lines.length; i++) {
    if (i > 0) contentLines.push('0 -16 Td')
    contentLines.push(`(${lines[i]}) Tj`)
  }

  contentLines.push('0 -36 Td')
  contentLines.push('/F1 9 Tf')
  contentLines.push(`(${footer}) Tj`)
  contentLines.push('ET')

  const stream = contentLines.join('\n')
  const streamLen = new TextEncoder().encode(stream).length

  const objects: string[] = []
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n')
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n')
  objects.push(
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n',
  )
  objects.push(`4 0 obj\n<< /Length ${streamLen} >>\nstream\n${stream}\nendstream\nendobj\n`)
  objects.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n')

  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  for (const obj of objects) {
    offsets.push(pdf.length)
    pdf += obj
  }
  const xrefPos = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += '0000000000 65535 f \n'
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`
  pdf += `startxref\n${xrefPos}\n%%EOF\n`

  return new Blob([pdf], { type: 'application/pdf' })
}

export function slugifyFilename(title: string) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
}
