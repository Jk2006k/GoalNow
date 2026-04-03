export function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const s = document.createElement('script')
    s.src = src
    s.onload = resolve
    s.onerror = reject
    document.head.appendChild(s)
  })
}

export function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export const MIME_TYPES = {
  VIDEO: ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'],
  IMAGE: 'image/jpeg'
}

export const FACE_ALERTS = {
  'no-face': { msg: 'No face detected — look at the screen', color: 'red' },
  'look-left': { msg: 'You are looking left — face the camera', color: 'red' },
  'look-right': { msg: 'You are looking right — face the camera', color: 'red' },
  'look-up': { msg: 'You are looking up — face the camera', color: 'red' },
  'look-down': { msg: 'You are looking down — face the camera', color: 'red' },
  'multiple-faces': { msg: 'Multiple people detected in frame', color: 'orange' }
}

export function isMostlyBlackFrame(canvas) {
  try {
    const sampleWidth = Math.min(canvas.width, 64)
    const sampleHeight = Math.min(canvas.height, 36)
    if (!sampleWidth || !sampleHeight) return true

    const sample = document.createElement('canvas')
    sample.width = sampleWidth
    sample.height = sampleHeight
    const sampleCtx = sample.getContext('2d')
    if (!sampleCtx) return true

    sampleCtx.drawImage(canvas, 0, 0, sampleWidth, sampleHeight)
    const { data } = sampleCtx.getImageData(0, 0, sampleWidth, sampleHeight)
    let brightPixels = 0
    const total = sampleWidth * sampleHeight

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
      if (luminance > 18) brightPixels += 1
    }

    return brightPixels / total < 0.01
  } catch {
    return true
  }
}

export function formatTime(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}
