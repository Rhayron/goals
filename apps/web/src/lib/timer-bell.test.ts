import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

class AudioContextStub {
  static instances: AudioContextStub[] = []
  state = 'suspended'
  currentTime = 20
  destination = {}
  resume = vi.fn(async () => { this.state = 'running' })
  createOscillator = vi.fn(() => ({
    type: 'sine', frequency: { value: 0 }, connect: vi.fn(), disconnect: vi.fn(),
    start: vi.fn(), stop: vi.fn(), onended: null as (() => void) | null,
  }))
  createGain = vi.fn(() => ({
    gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn(), disconnect: vi.fn(),
  }))
  constructor() { AudioContextStub.instances.push(this) }
}

describe('aviso sonoro do Pomodoro', () => {
  beforeEach(() => {
    vi.resetModules()
    AudioContextStub.instances = []
    vi.stubGlobal('AudioContext', AudioContextStub)
  })
  afterEach(() => vi.unstubAllGlobals())

  it('desbloqueia no início sem tocar e reutiliza o contexto no fim do ciclo', async () => {
    const { prepareTimerBell, ringTimerBell } = await import('./timer-bell')
    expect(await prepareTimerBell()).toBe(true)
    const ctx = AudioContextStub.instances[0]
    expect(ctx.resume).toHaveBeenCalledOnce()
    expect(ctx.createOscillator).not.toHaveBeenCalled()
    expect(await ringTimerBell()).toBe(true)
    expect(await ringTimerBell()).toBe(true)
    expect(AudioContextStub.instances).toHaveLength(1)
    expect(ctx.createOscillator.mock.results.every(({ value }) => value.start.mock.calls.length === 1 && value.stop.mock.calls.length === 1)).toBe(true)
  })

  it('não agenda um toque enquanto o navegador bloqueia o áudio', async () => {
    const { prepareTimerBell, ringTimerBell } = await import('./timer-bell')
    await prepareTimerBell()
    const ctx = AudioContextStub.instances[0]
    ctx.state = 'suspended'
    ctx.resume.mockRejectedValueOnce(new Error('Autoplay blocked'))
    expect(await ringTimerBell()).toBe(false)
    expect(ctx.createOscillator).not.toHaveBeenCalled()
  })

  it('não interrompe o relógio quando Web Audio não está disponível', async () => {
    vi.stubGlobal('AudioContext', undefined)
    const { ringTimerBell } = await import('./timer-bell')
    expect(await ringTimerBell()).toBe(false)
  })
})
