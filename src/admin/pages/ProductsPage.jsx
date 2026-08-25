import { Eye, EyeOff, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../../hooks/useCatalog'
import { MODALITIES } from '../../lib/catalog'
import { formatBRL } from '../../lib/format'
import { deleteProduct, fetchAllProducts, setProductFlag } from '../api'
import { EmptyState, Feedback, Panel, Spinner } from '../components/ui'

export default function ProductsPage() {
  const { reload: reloadStorefront } = useCatalog()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState(null)
  const [query, setQuery] = useState('')
  const [modality, setModality] = useState('all')
  const [status, setStatus] = useState('all')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setProducts(await fetchAllProducts())
    } catch (error) {
      setFeedback({ type: 'error', message: error.message })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return products.filter((product) => {
      const matchesQuery =
        needle.length === 0 ||
        product.model.toLowerCase().includes(needle) ||
        product.brand.toLowerCase().includes(needle)
      const matchesModality = modality === 'all' || product.modality === modality
      const matchesStatus =
        status === 'all' ||
        (status === 'active' && product.active) ||
        (status === 'inactive' && !product.active)
      return matchesQuery && matchesModality && matchesStatus
    })
  }, [modality, products, query, status])

  async function mutate(action, successMessage) {
    try {
      await action()
      await load()
      await reloadStorefront()
      setFeedback({ type: 'success', message: successMessage })
    } catch (error) {
      setFeedback({ type: 'error', message: error.message })
    }
  }

  function handleDelete(product) {
    const confirmed = window.confirm(
      `Excluir "${product.model}"? As fotos e o histórico de interesse desse produto saem do site.`,
    )
    if (!confirmed) return
    void mutate(() => deleteProduct(product.dbId), 'Produto excluído.')
  }

  return (
    <div className="ad-stack">
      <Panel
        title="Catálogo"
        description="Cadastre, edite e controle o que aparece na vitrine."
        actions={
          <Link to="/admin/produtos/novo" className="ad-btn ad-btn--primary">
            <Plus size={16} />
            Nova chuteira
          </Link>
        }
      >
        <div className="ad-filters">
          <div className="ad-input-icon ad-input-icon--grow">
            <Search size={16} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por modelo ou marca"
            />
          </div>
          <select value={modality} onChange={(event) => setModality(event.target.value)}>
            <option value="all">Todas as modalidades</option>
            {MODALITIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">Ativos e inativos</option>
            <option value="active">Somente ativos</option>
            <option value="inactive">Somente inativos</option>
          </select>
        </div>

        <Feedback state={feedback} />

        {loading ? (
          <Spinner label="Carregando catálogo…" />
        ) : filtered.length === 0 ? (
          <EmptyState>Nenhum produto neste recorte.</EmptyState>
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Chuteira</th>
                  <th>Preço</th>
                  <th>Estoque</th>
                  <th>Fotos</th>
                  <th>Status</th>
                  <th aria-label="Ações" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.dbId}>
                    <td>
                      <div className="ad-cell-product">
                        {product.image ? (
                          <img src={product.image} alt="" loading="lazy" />
                        ) : (
                          <div className="ad-cell-product__empty" />
                        )}
                        <div>
                          <strong>{product.model}</strong>
                          <small>
                            {product.brand} · {product.modality}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      {formatBRL(product.price)}
                      {product.cost ? <small className="ad-muted"> custo {formatBRL(product.cost)}</small> : null}
                    </td>
                    <td>
                      <span className={product.stock <= 2 ? 'ad-warn' : ''}>{product.stock}</span>
                    </td>
                    <td>{product.images.filter((image) => image.src).length}</td>
                    <td>
                      <div className="ad-flags">
                        <button
                          type="button"
                          className={`ad-flag ${product.active ? 'is-on' : ''}`}
                          onClick={() =>
                            mutate(
                              () => setProductFlag(product.dbId, { active: !product.active }),
                              product.active ? 'Produto oculto na loja.' : 'Produto publicado.',
                            )
                          }
                          title={product.active ? 'Publicado' : 'Oculto'}
                        >
                          {product.active ? <Eye size={15} /> : <EyeOff size={15} />}
                        </button>
                        <button
                          type="button"
                          className={`ad-flag ${product.featured ? 'is-on' : ''}`}
                          onClick={() =>
                            mutate(
                              () => setProductFlag(product.dbId, { featured: !product.featured }),
                              product.featured ? 'Destaque removido.' : 'Produto em destaque.',
                            )
                          }
                          title="Destaque da vitrine"
                        >
                          <Star size={15} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="ad-row-actions">
                        <Link to={`/admin/produtos/${product.dbId}`} className="ad-icon-btn" title="Editar">
                          <Pencil size={15} />
                        </Link>
                        <button
                          type="button"
                          className="ad-icon-btn ad-icon-btn--danger"
                          onClick={() => handleDelete(product)}
                          title="Excluir"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  )
}
