const TARGET_SIZE = 1600
const QUALITY = 0.82

/**
 * Normaliza para quadrado 1600×1600 (contain) e comprime em WebP.
 * Preserva a chuteira inteira — sem recorte no upload.
 */
export async function optimizeProductImage(file) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Selecione um arquivo de imagem (JPG, PNG ou WebP).')
  }

  // GIF animado ou arquivo já pequeno: evita reprocessar à toa.
  if (file.type === 'image/gif' || (file.type === 'image/webp' && file.size < 280_000)) {
    return file
  }

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(TARGET_SIZE / bitmap.width, TARGET_SIZE / bitmap.height, 1)
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = TARGET_SIZE
  canvas.height = TARGET_SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    return file
  }

  ctx.clearRect(0, 0, TARGET_SIZE, TARGET_SIZE)
  ctx.drawImage(bitmap, (TARGET_SIZE - width) / 2, (TARGET_SIZE - height) / 2, width, height)
  bitmap.close()

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error('Não foi possível comprimir a imagem.'))),
      'image/webp',
      QUALITY,
    )
  })

  const base = file.name.replace(/\.[^.]+$/i, '') || 'foto'
  return new File([blob], `${base}.webp`, { type: 'image/webp', lastModified: Date.now() })
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
