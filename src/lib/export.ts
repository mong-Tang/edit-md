import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export async function createHtmlDocument(title: string, markdown: string) {
  const contentHtml = renderToStaticMarkup(
    createElement(ReactMarkdown, { remarkPlugins: [remarkGfm] }, markdown),
  )

  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #ffffff;
        --text: #111827;
        --muted: #6b7280;
        --border: #d1d5db;
        --accent: #2563eb;
        --code-bg: #f3f4f6;
      }

      * {
        box-sizing: border-box;
      }

      html,
      body {
        margin: 0;
        padding: 0;
        background: var(--bg);
        color: var(--text);
        font-family: "Segoe UI", Arial, sans-serif;
        line-height: 1.6;
      }

      body {
        padding: 40px;
      }

      .markdown-body {
        max-width: 920px;
        margin: 0 auto;
        word-break: break-word;
      }

      .markdown-body > *:first-child {
        margin-top: 0;
      }

      .markdown-body > *:last-child {
        margin-bottom: 0;
      }

      .markdown-body h1,
      .markdown-body h2,
      .markdown-body h3 {
        line-height: 1.25;
        margin: 1.6rem 0 0.8rem;
      }

      .markdown-body h1 {
        font-size: 2rem;
        border-bottom: 1px solid var(--border);
        padding-bottom: 0.35rem;
      }

      .markdown-body h2 {
        font-size: 1.5rem;
        border-bottom: 1px solid var(--border);
        padding-bottom: 0.35rem;
      }

      .markdown-body h3 {
        font-size: 1.2rem;
      }

      .markdown-body p,
      .markdown-body ul,
      .markdown-body ol,
      .markdown-body blockquote,
      .markdown-body pre,
      .markdown-body table,
      .markdown-body hr {
        margin: 0 0 1rem;
      }

      .markdown-body ul,
      .markdown-body ol {
        padding-left: 1.5rem;
      }

      .markdown-body blockquote {
        margin-left: 0;
        padding: 0.75rem 1rem;
        border-left: 4px solid var(--accent);
        background: #f9fafb;
        color: var(--muted);
      }

      .markdown-body hr {
        border: 0;
        border-top: 1px solid var(--border);
      }

      .markdown-body a {
        color: var(--accent);
      }

      .markdown-body code {
        padding: 0.15rem 0.35rem;
        border-radius: 6px;
        background: var(--code-bg);
        font-family: "Cascadia Code", Consolas, "Courier New", monospace;
      }

      .markdown-body pre {
        overflow: auto;
        padding: 1rem;
        border: 1px solid var(--border);
        border-radius: 12px;
        background: var(--code-bg);
      }

      .markdown-body pre code {
        padding: 0;
        background: transparent;
      }

      .markdown-body table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid var(--border);
      }

      .markdown-body th,
      .markdown-body td {
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--border);
        text-align: left;
        vertical-align: top;
      }

      .markdown-body thead th {
        background: #f9fafb;
      }

      @media print {
        body {
          padding: 0;
        }

        .markdown-body {
          max-width: none;
        }
      }
    </style>
  </head>
  <body>
    <main class="markdown-body">${contentHtml}</main>
  </body>
</html>`
}

export async function createPdfBytesFromMarkdown(title: string, markdown: string): Promise<ArrayBuffer> {
  const { jsPDF } = await import('jspdf')
  const document = new jsPDF({ format: 'a4', unit: 'pt' })
  const pageWidth = document.internal.pageSize.getWidth()
  const pageHeight = document.internal.pageSize.getHeight()
  const margin = 36
  const contentWidth = pageWidth - margin * 2
  const titleText = title.trim() || 'document'
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  let cursorY = margin

  document.setFont('helvetica', 'bold')
  document.setFontSize(16)
  const wrappedTitle = document.splitTextToSize(titleText, contentWidth)
  document.text(wrappedTitle, margin, cursorY)
  cursorY += wrappedTitle.length * 20

  document.setDrawColor(209, 213, 219)
  document.line(margin, cursorY, pageWidth - margin, cursorY)
  cursorY += 20

  document.setFont('courier', 'normal')
  document.setFontSize(11)

  for (const line of lines) {
    const safeLine = line.length > 0 ? line : ' '
    const wrappedLines = document.splitTextToSize(safeLine, contentWidth)

    for (const wrappedLine of wrappedLines) {
      if (cursorY > pageHeight - margin) {
        document.addPage()
        cursorY = margin
        document.setFont('courier', 'normal')
        document.setFontSize(11)
      }

      document.text(wrappedLine, margin, cursorY)
      cursorY += 16
    }
  }

  return document.output('arraybuffer')
}
