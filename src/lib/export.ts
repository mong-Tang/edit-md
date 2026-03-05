export function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function createHtmlDocument(title: string, markdown: string) {
  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body>
    <pre>${escapeHtml(markdown)}</pre>
  </body>
</html>`
}

export async function createPdfBytesFromElement(sourceElement: HTMLElement): Promise<ArrayBuffer> {
  const { jsPDF } = await import('jspdf')
  const document = new jsPDF({ format: 'a4', unit: 'pt' })
  const pageWidth = document.internal.pageSize.getWidth()
  const margin = 36
  const contentWidth = pageWidth - margin * 2

  const wrapper = window.document.createElement('div')
  wrapper.style.left = '-99999px'
  wrapper.style.position = 'fixed'
  wrapper.style.top = '0'
  wrapper.style.width = `${contentWidth}px`
  wrapper.style.backgroundColor = '#ffffff'
  wrapper.style.color = '#111111'
  wrapper.style.padding = '16px'
  wrapper.append(sourceElement.cloneNode(true))
  window.document.body.append(wrapper)

  try {
    await new Promise<void>((resolve) => {
      document.html(wrapper, {
        autoPaging: 'text',
        callback: () => resolve(),
        html2canvas: {
          backgroundColor: '#ffffff',
          scale: 2,
        },
        margin: [margin, margin, margin, margin],
        width: contentWidth,
        windowWidth: wrapper.scrollWidth,
      })
    })

    return document.output('arraybuffer')
  } finally {
    wrapper.remove()
  }
}
