import { ShieldAlert } from 'lucide-react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Spinner } from './ui'

export default function RequireAdmin() {
  const { configured, loading, isAuthenticated, isAdmin, user, signOut } = useAuth()
  const location = useLocation()

  if (!configured) {
    return (
      <div className="ad-gate">
        <ShieldAlert size={28} />
        <h1>Painel indisponível</h1>
        <p>
          As variáveis <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>{' '}
          não foram encontradas neste ambiente.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="ad-gate">
        <Spinner label="Validando sua sessão…" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  if (!isAdmin) {
    return (
      <div className="ad-gate">
        <ShieldAlert size={28} />
        <h1>Acesso não autorizado</h1>
        <p>
          A conta <strong>{user?.email}</strong> está autenticada, mas não tem permissão de
          administrador nesta loja.
        </p>
        <button type="button" className="ad-btn" onClick={signOut}>
          Sair desta conta
        </button>
      </div>
    )
  }

  return <Outlet />
}
