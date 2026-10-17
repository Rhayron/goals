let context: AudioContext | null = null

function audioContext() {
  if (!context || context.state === 'closed') context = new AudioContext()
  return context
}

/** Called from start/enable clicks so the browser can unlock audio before the deadline. */
export async function prepareTimerBell(): Promise<boolean> {
  try {
    const ctx = audioContext()
    if (ctx.state !== 'running') await ctx.resume()
    return ctx.state === 'running'
  } catch {
    return false
  }
}

/** Two soft bell strikes, with a quiet overtone and a natural decay. */
export async function ringTimerBell(): Promise<boolean> {
  if (!await prepareTimerBell()) return false
  const ctx = context!
  try {
    for (const [delay, frequency] of [[0, 1046.5], [0.28, 784]]) {
      for (const [ratio, volume] of [[1, 0.13], [2.76, 0.025]]) {
        const oscillator = ctx.createOscillator()
        const envelope = ctx.createGain()
        const at = ctx.currentTime + delay
        oscillator.type = 'sine'
        oscillator.frequency.value = frequency * ratio
        envelope.gain.setValueAtTime(0.0001, at)
        envelope.gain.exponentialRampToValueAtTime(volume, at + 0.008)
        envelope.gain.exponentialRampToValueAtTime(0.0001, at + 1.5)
        oscillator.connect(envelope)
        envelope.connect(ctx.destination)
        oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect() }
        oscillator.start(at)
        oscillator.stop(at + 1.55)
      }
    }
    return true
  } catch {
    return false
  }
}
