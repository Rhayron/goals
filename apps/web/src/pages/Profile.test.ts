import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { emptyState } from '@coado/shared'
import { describe, expect, it, vi } from 'vitest'
import ProfilePage from './Profile'

vi.mock('../components/Layout', () => ({ PageHeader: () => null }))
vi.mock('../lib/store', () => ({ useStore: () => ({ state: emptyState(), sync: { status: 'saved', errorMessage: '' } }) }))
vi.mock('../lib/auth', () => ({
  firstName: (name: string) => name,
  useMe: () => ({ name: 'Pessoa de teste', email: 'perfil@example.test', createdAt: '2026-01-01T12:00:00Z' }),
  useAuth: () => ({ updateProfile: vi.fn(), deleteAccount: vi.fn() }),
}))

const render = (path: string) => renderToStaticMarkup(
  createElement(MemoryRouter, { initialEntries: [path] }, createElement(ProfilePage)),
)

describe('navegação do perfil', () => {
  it.each([
    ['/perfil', 'Minha conta', 'perfil@example.test'],
    ['/perfil#identidade', 'Minha conta', 'perfil@example.test'],
    ['/perfil#atividade', 'Minha atividade', 'Sua história por aqui'],
    ['/perfil#aparelhos', 'Aparelhos conectados', 'Onde você está conectado'],
    ['/perfil#conta', 'Gerenciar conta', 'Fechar a conta'],
    ['/perfil#desconhecido', 'Minha conta', 'perfil@example.test'],
  ])('abre somente a seção correspondente a %s', (path, title, content) => {
    const html = render(path)
    expect(html).toMatch(new RegExp(`<section[^>]*aria-label="${title}"`))
    expect(html).toContain(content)
    expect(html.match(/aria-current="page"/g)).toHaveLength(1)
    for (const other of ['perfil@example.test', 'Sua história por aqui', 'Onde você está conectado', 'Fechar a conta']) {
      if (other !== content) expect(html).not.toContain(other)
    }
  })

  it('mantém o histórico sem os atalhos de conquistas e ranking no painel', () => {
    const html = render('/perfil#atividade')
    expect(html).toContain('href="/historico"')
    const nav = html.match(/<nav[\s\S]*?<\/nav>/)?.[0]
    expect(nav).toBeDefined()
    for (const path of ['/conquistas', '/comunidade', '/historico']) {
      expect(nav).not.toContain(`href="${path}"`)
    }
  })

  it.each([
    ['/perfil#preferencias', 'Preferências', 'Pomodoro e temporizador'],
    ['/perfil#privacidade', 'Privacidade e comunidade', 'Como você aparece na comunidade'],
    ['/perfil#seguranca', 'Segurança', 'Acesso à conta'],
  ])('abre a configuração %s sem misturar os dados pessoais', (path, title, content) => {
    const html = render(path)
    expect(html).toMatch(new RegExp(`<section[^>]*aria-label="${title}"`))
    expect(html).toContain(content)
    expect(html).not.toContain('Nome completo')
    expect(html.match(/aria-current="page"/g)).toHaveLength(1)
  })
})
