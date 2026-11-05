import { useState } from 'react'
import { isSupabaseConfigured, supabase } from './supabaseClient'

const navigation = [
  { id: 'inicio', label: 'Início', icon: '⌂' },
  { id: 'cadastro', label: 'Cadastro', icon: '＋' },
  { id: 'registros', label: 'Registros', icon: '▤' },
]

const pageCopy = {
  inicio: { title: 'Olá, seja bem-vinda!', subtitle: 'Um espaço simples para começar.' },
  cadastro: { title: 'Cadastro de nome', subtitle: 'Preencha o campo abaixo para testar o envio.' },
  registros: { title: 'Novo registro', subtitle: 'Adicione um nome ao banco de dados.' },
}

export default function App() {
  const [activePage, setActivePage] = useState('cadastro')
  const [nome, setNome] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const copy = pageCopy[activePage]

  async function handleSubmit(event) {
    event.preventDefault()
    const nomeLimpo = nome.trim()

    if (!nomeLimpo) {
      setFeedback({ type: 'error', message: 'Digite um nome antes de continuar.' })
      return
    }

    setLoading(true)
    setFeedback(null)

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('nomes').insert({ nome: nomeLimpo })
        if (error) throw error
        setFeedback({ type: 'success', message: 'Nome salvo no Supabase com sucesso!' })
      } else {
        setFeedback({ type: 'demo', message: 'Modo demonstração: configure o Supabase para salvar no banco de dados.' })
      }
      setNome('')
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Não foi possível salvar o nome.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#inicio" onClick={() => setActivePage('inicio')} aria-label="Oficina Conexão - início">
          <span className="brand-mark">oc</span>
          <span><strong>Oficina Conexão</strong><small>PAINEL DE TESTE</small></span>
        </a>
        <div className="topbar-right">
          <span className="status-dot" />
          <span>{isSupabaseConfigured ? 'Supabase conectado' : 'Modo demonstração'}</span>
          <div className="avatar">OC</div>
        </div>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <div className="side-label">MENU PRINCIPAL</div>
          <nav aria-label="Menu lateral">
            {navigation.map((item) => (
              <button
                className={`nav-link ${activePage === item.id ? 'active' : ''}`}
                key={item.id}
                onClick={() => { setActivePage(item.id); setFeedback(null) }}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
                {activePage === item.id && <span className="active-indicator" />}
              </button>
            ))}
          </nav>
          <div className="sidebar-note">
            <span className="note-flower">✿</span>
            <strong>Feito com carinho</strong>
            <p>Um teste, um novo começo.</p>
          </div>
        </aside>

        <main className="main-content">
          <div className="page-heading">
            <div>
              <span className="eyebrow">OFICINA CONEXÃO / TESTE</span>
              <h1>{copy.title}</h1>
              <p>{copy.subtitle}</p>
            </div>
            <span className="heading-sparkle">✳</span>
          </div>

          <section className="form-card">
            <div className="card-topline">
              <span className="card-icon">♡</span>
              <span>FORMULÁRIO SIMPLES</span>
            </div>
            <h2>Vamos começar?</h2>
            <p className="form-description">Por enquanto, precisamos apenas de uma informação.</p>

            <form onSubmit={handleSubmit}>
              <label htmlFor="nome">Nome</label>
              <input
                id="nome"
                name="nome"
                type="text"
                placeholder="Digite seu nome"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                maxLength={120}
                autoComplete="name"
                required
              />
              {feedback && <div className={`feedback ${feedback.type}`} role="status">{feedback.message}</div>}
              <button className="submit-button" type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar nome'}
                <span aria-hidden="true">→</span>
              </button>
            </form>
            <div className="card-footnote"><span>✧</span> Seus dados serão tratados com cuidado.</div>
          </section>

          <div className="bottom-decoration" aria-hidden="true">✿　✧　♡</div>
        </main>
      </div>

      <footer className="bottom-nav">
        <span className="footer-copy">© 2026 Oficina Conexão</span>
        <nav aria-label="Navegação inferior">
          {navigation.map((item) => (
            <button
              key={item.id}
              className={activePage === item.id ? 'footer-link active' : 'footer-link'}
              onClick={() => { setActivePage(item.id); setFeedback(null) }}
            >
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <span className="footer-version">VERSÃO 0.1.0</span>
      </footer>
    </div>
  )
}
