import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../hooks/useCatalog'
import { InstagramIcon } from './icons/BrandIcons'

export default function Footer() {
  const { content, instagram } = useCatalog()
  const copy = content.footer

  return (
    <footer className="site-footer" id="social">
      <div className="site-footer__top flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div>
          <p className="kicker">{copy.kicker}</p>
          <h2>{copy.title}</h2>
          <p>{copy.text}</p>
        </div>

        <a
          className="ig-orb"
          href={instagram}
          target="_blank"
          rel="noreferrer"
          aria-label="Abrir Instagram da CAIO IMPORTS"
        >
          <span className="ig-orb__ring" />
          <span className="ig-orb__ring ig-orb__ring--delayed" />
          <InstagramIcon size={28} />
          <span className="ig-orb__label">
            Instagram
            <ArrowUpRight size={16} />
          </span>
        </a>
      </div>
      <div className="site-footer__bottom flex items-center justify-between gap-4">
        <small>© {copy.copyright}</small>
        <small className="flex items-center gap-3">
          {copy.tagline}
          <Link to="/admin" className="site-footer__admin">
            Área do lojista
          </Link>
        </small>
      </div>
    </footer>
  )
}
