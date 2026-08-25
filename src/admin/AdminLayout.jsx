import {
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Package,
  Receipt,
  Store,
  Sun,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'

const NAV = [
  { to: '/admin', label: 'Painel', icon: LayoutDashboard, end: true },
  { to: '/admin/produtos', label: 'Produtos', icon: Package },
  { to: '/admin/vendas', label: 'Vendas', icon: Receipt },
  { to: '/admin/conteudo', label: 'Conteúdo do site', icon: FileText },
]

export default function AdminLayout() {
  const { admin, user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [navOpen, setNavOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="ad-shell">
      <aside className={`ad-side ${navOpen ? 'is-open' : ''}`}>
        <div className="ad-side__brand">
          <span className="ad-side__logo">CI</span>
          <div>
            <strong>CAIO IMPORTS</strong>
            <small>Gestão da loja</small>
          </div>
        </div>

        <nav className="ad-nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `ad-nav__link ${isActive ? 'is-active' : ''}`}
              onClick={() => setNavOpen(false)}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ad-side__foot">
          <Link to="/" className="ad-nav__link" onClick={() => setNavOpen(false)}>
            <Store size={18} />
            Ver a loja
          </Link>
          <div className="ad-side__user">
            <span>{admin?.name || user?.email}</span>
            <small>{admin?.role === 'owner' ? 'Proprietário' : 'Equipe'}</small>
          </div>
          <button type="button" className="ad-nav__link ad-nav__link--danger" onClick={signOut}>
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {navOpen ? (
        <button
          type="button"
          className="ad-side__overlay"
          aria-label="Fechar menu"
          onClick={() => setNavOpen(false)}
        />
      ) : null}

      <div className="ad-main">
        <header className="ad-top">
          <button
            type="button"
            className="ad-icon-btn ad-top__menu"
            onClick={() => setNavOpen((open) => !open)}
            aria-label="Abrir menu do painel"
          >
            {navOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <p className="ad-top__crumb">
            {NAV.find((item) =>
              item.end ? location.pathname === item.to : location.pathname.startsWith(item.to),
            )?.label ?? 'Painel'}
          </p>
          <button
            type="button"
            className="ad-icon-btn"
            onClick={toggleTheme}
            aria-label="Alternar tema"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </header>

        <main className="ad-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
