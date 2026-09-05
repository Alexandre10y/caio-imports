import { ArrowLeft, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { Feedback } from '../components/ui'

export default function LoginPage() {
  const { isAuthenticated, loading, signIn, configured } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [recovery, setRecovery] = useState(false)
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    if (!supabase) return undefined
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setRecovery(true)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  // Quem já tem sessão vai para o painel; é lá que a permissão de admin é
  // conferida, então uma conta sem acesso recebe a mensagem certa.
  if (isAuthenticated && !recovery && !loading) {
    return <Navigate to={location.state?.from ?? '/admin'} replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setFeedback(null)
    const { error } = await signIn(email, password)
    setSubmitting(false)
    if (error) setFeedback({ type: 'error', message: error })
  }

  async function handleRecover() {
    if (!supabase) return
    if (!email.trim()) {
      setFeedback({ type: 'error', message: 'Informe o e-mail para receber o link.' })
      return
    }
    setSubmitting(true)
    await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/admin/login`,
    })
    setSubmitting(false)
    // Resposta sempre igual: não revela se o e-mail existe na base.
    setFeedback({
      type: 'info',
      message: 'Se este e-mail tiver acesso ao painel, o link de redefinição chegou na caixa.',
    })
  }

  async function handleNewPassword(event) {
    event.preventDefault()
    if (newPassword.length < 10) {
      setFeedback({ type: 'error', message: 'Use ao menos 10 caracteres na nova senha.' })
      return
    }
    setSubmitting(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSubmitting(false)
    if (error) {
      setFeedback({ type: 'error', message: error.message })
      return
    }
    setRecovery(false)
    setNewPassword('')
    setFeedback({ type: 'success', message: 'Senha atualizada. Pode entrar no painel.' })
  }

  return (
    <div className="ad-login">
      <div className="ad-login__aside">
        <Link to="/" className="ad-login__back">
          <ArrowLeft size={16} />
          Voltar para a loja
        </Link>
        <div>
          <p className="ad-login__kicker">Área restrita</p>
          <h1>
            CAIO
            <span>IMPORTS</span>
          </h1>
          <p className="ad-login__lead">
            Cadastro de chuteiras, controle de vendas, estoque e os textos do site — tudo em um
            painel só seu.
          </p>
        </div>
        <ul className="ad-login__list">
          <li>
            <ShieldCheck size={16} />
            Acesso individual com e-mail e senha
          </li>
          <li>
            <ShieldCheck size={16} />
            Dados de vendas isolados por permissão no banco
          </li>
          <li>
            <ShieldCheck size={16} />
            Sessão criptografada e renovada automaticamente
          </li>
        </ul>
      </div>

      <div className="ad-login__panel">
        {recovery ? (
          <form className="ad-login__form" onSubmit={handleNewPassword}>
            <h2>Definir nova senha</h2>
            <p className="ad-login__hint">Escolha uma senha longa e exclusiva deste painel.</p>

            <label className="ad-field">
              <span className="ad-field__label">Nova senha</span>
              <div className="ad-input-icon">
                <Lock size={16} />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={10}
                  required
                />
              </div>
            </label>

            <Feedback state={feedback} />

            <button type="submit" className="ad-btn ad-btn--primary" disabled={submitting}>
              {submitting ? 'Salvando…' : 'Salvar senha'}
            </button>
          </form>
        ) : (
          <form className="ad-login__form" onSubmit={handleSubmit}>
            <h2>Entrar no painel</h2>
            <p className="ad-login__hint">Use as credenciais cadastradas para a loja.</p>

            <label className="ad-field">
              <span className="ad-field__label">E-mail</span>
              <div className="ad-input-icon">
                <Mail size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="username"
                  placeholder="caioimpors@caioimports.com"
                  required
                />
              </div>
            </label>

            <label className="ad-field">
              <span className="ad-field__label">Senha</span>
              <div className="ad-input-icon">
                <Lock size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="ad-input-icon__action"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            <Feedback state={feedback} />

            <button
              type="submit"
              className="ad-btn ad-btn--primary"
              disabled={submitting || !configured}
            >
              {submitting ? 'Verificando…' : 'Acessar painel'}
            </button>

            <button
              type="button"
              className="ad-link-btn"
              onClick={handleRecover}
              disabled={submitting}
            >
              Esqueci minha senha
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
