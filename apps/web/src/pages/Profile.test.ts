import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { emptyState } from '@coado/shared'
import { describe, expect, it, vi } from 'vitest'
import ProfilePage from './Profile'

vi.mock('../components/Layout', () => ({ PageHeader: () => null }))
vi.mock('../lib/store', () => ({ useStore: () => ({ state: emptyState() }) }))
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
    expect(html).toMatch(new RegExp(`id="profile-section-title"[^>]*>${title}</h2>`))
    expect(html).toContain(content)
    expect(html.match(/aria-current="page"/g)).toHaveLength(1)
    for (const other of ['perfil@example.test', 'Sua história por aqui', 'Onde você está conectado', 'Fechar a conta']) {
      if (other !== content) expect(html).not.toContain(other)
    }
  })

  it('mantém os destinos de conquistas, comunidade e histórico', () => {
    const html = render('/perfil#atividade')
    for (const path of ['/conquistas', '/comunidade', '/historico']) {
      expect(html).toContain(`href="${path}"`)
    }
  })
})
