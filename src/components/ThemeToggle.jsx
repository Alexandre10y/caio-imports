import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle({ theme, onToggle }) {
  const isLight = theme === 'light'

  return (
    <button
      type="button"
      className="icon-btn"
      onClick={onToggle}
      aria-label={isLight ? 'Ativar modo escuro' : 'Ativar modo claro'}
      title={isLight ? 'Modo escuro' : 'Modo claro'}
    >
      {isLight ? <Moon size={18} strokeWidth={2.2} /> : <Sun size={18} strokeWidth={2.2} />}
    </button>
  )
}
