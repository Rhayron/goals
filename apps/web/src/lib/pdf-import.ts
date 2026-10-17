import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

GlobalWorkerOptions.workerSrc = workerUrl
export interface PdfText {
  pages: string[]
  fingerprint: string
  emptyPages: number[]
}
export async function extractPdf(
  bytes: Uint8Array,
  progress: (page: number, total: number) => void,
  signal: AbortSignal,
): Promise<PdfText> {
  if (bytes.length > 20 * 1024 * 1024) throw new Error('O PDF deve ter até 20 MB.')
  if (new TextDecoder().decode(bytes.subarray(0, 5)) !== '%PDF-') throw new Error('O arquivo não é um PDF válido.')
  const digest = await crypto.subtle.digest('SHA-256', bytes.slice().buffer)
  const fingerprint = [...new Uint8Array(digest)].map((v) => v.toString(16).padStart(2, '0')).join('')
  const task = getDocument({ data: bytes, useSystemFonts: true, disableFontFace: true, stopAtErrors: true })
  const cancel = () => {
    void task.destroy()
  }
  signal.addEventListener('abort', cancel, { once: true })
  if (signal.aborted) {
    await task.destroy()
    throw new Error('Leitura cancelada.')
  }
  // Um PDF difícil não deve deixar o navegador processando indefinidamente.
  const timeout = setTimeout(cancel, 60_000)
  try {
    const pdf = await task.promise
    if (pdf.numPages > 300) throw new Error('O PDF tem mais de 300 páginas. Separe o anexo do cargo e importe esse arquivo.')
    const pages: string[] = [],
      emptyPages: number[] = []
    let chars = 0
    for (let n = 1; n <= pdf.numPages; n++) {
      if (signal.aborted) throw new Error('Leitura cancelada.')
      const page = await pdf.getPage(n),
        content = await page.getTextContent()
      let text = '',
        lastY: number | undefined
      for (const item of content.items) {
        if (!('str' in item)) continue
        const y = item.transform[5]
        if (lastY !== undefined && Math.abs(y - lastY) > 3 && !text.endsWith('\n')) text += '\n'
        text += item.str + (item.hasEOL ? '\n' : ' ')
        lastY = y
      }
      chars += text.length
      if (chars > 1_000_000) throw new Error('Texto muito extenso. Importe apenas o anexo do cargo desejado.')
      pages.push(text.trim())
      if (text.trim().length < 30) emptyPages.push(n)
      progress(n, pdf.numPages)
      page.cleanup()
    }
    return { pages, fingerprint, emptyPages }
  } catch (e) {
    if ((e as Error).name === 'PasswordException') throw new Error('Este PDF exige senha. Importe uma cópia desbloqueada.')
    throw e
  } finally {
    clearTimeout(timeout)
    signal.removeEventListener('abort', cancel)
    await task.destroy()
  }
}
