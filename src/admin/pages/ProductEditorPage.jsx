import { ArrowLeft, ChevronDown, ChevronUp, ImagePlus, Plus, Trash2, Upload } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCatalog } from '../../hooks/useCatalog'
import { MODALITIES, SIZE_RANGE } from '../../lib/catalog'
import { slugify } from '../../lib/format'
import { fetchProductById, saveProduct, uploadProductImage } from '../api'
import { formatBytes } from '../../lib/imageOptimize'
import { Feedback, Field, Panel, Spinner } from '../components/ui'

const EMPTY = {
  slug: '',
  model: '',
  brand: '',
  modality: 'Campo',
  price: '',
  cost: '',
  stock: 0,
  position: 0,
  description: '',
  specs: [
    { key: 'cabedal', value: '' },
    { key: 'solado', value: '' },
    { key: 'peso', value: '' },
    { key: 'origem', value: 'Importada' },
  ],
  sizes: [38, 39, 40, 41, 42, 43, 44],
  colors: [{ name: '', hex: '#C8FF00', filter: '' }],
  images: [{ url: '', label: 'Frontal' }],
  active: true,
  featured: false,
}

const IMAGE_LABELS = ['Frontal', 'Lateral', 'Solado', 'Detalhe', 'Em campo']

export default function ProductEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { reload: reloadStorefront } = useCatalog()
  const fileInput = useRef(null)
  const [values, setValues] = useState(EMPTY)
  const [loading, setLoading] = useState(Boolean(id))
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [slugLocked, setSlugLocked] = useState(Boolean(id))

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const product = await fetchProductById(id)
      if (!product) {
        setFeedback({ type: 'error', message: 'Produto não encontrado.' })
        return
      }
      setValues({
        slug: product.slug,
        model: product.model,
        brand: product.brand,
        modality: product.modality,
        price: String(product.price),
        cost: product.cost == null ? '' : String(product.cost),
        stock: product.stock,
        position: product.position,
        description: product.description,
        specs: Object.entries(product.specs ?? {}).map(([key, value]) => ({ key, value })),
        sizes: product.sizes,
        colors: product.colors,
        images: product.images.map((image) => ({ url: image.src, label: image.label })),
        active: product.active,
        featured: product.featured,
      })
    } catch (error) {
      setFeedback({ type: 'error', message: error.message })
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  function patch(next) {
    setValues((current) => ({ ...current, ...next }))
  }

  function handleModel(value) {
    patch(slugLocked ? { model: value } : { model: value, slug: slugify(value) })
  }

  function toggleSize(size) {
    patch({
      sizes: values.sizes.includes(size)
        ? values.sizes.filter((item) => item !== size)
        : [...values.sizes, size].sort((a, b) => a - b),
    })
  }

  function updateList(key, index, next) {
    const list = [...values[key]]
    list[index] = { ...list[index], ...next }
    patch({ [key]: list })
  }

  function removeFromList(key, index) {
    patch({ [key]: values[key].filter((_, position) => position !== index) })
  }

  function moveImage(index, direction) {
    const target = index + direction
    if (target < 0 || target >= values.images.length) return
    const list = [...values.images]
    ;[list[index], list[target]] = [list[target], list[index]]
    patch({ images: list })
  }

  async function handleUpload(event) {
    const files = [...(event.target.files ?? [])]
    if (files.length === 0) return

    setUploading(true)
    setFeedback(null)
    try {
      const slug = values.slug || slugify(values.model) || 'novo-produto'
      const uploaded = []
      let savedBytes = 0
      for (const file of files) {
        const result = await uploadProductImage(file, slug)
        uploaded.push({ url: result.url, label: IMAGE_LABELS[uploaded.length] ?? 'Detalhe' })
        savedBytes += Math.max(0, result.originalBytes - result.bytes)
      }
      const existing = values.images.filter((image) => image.url.trim())
      patch({ images: [...existing, ...uploaded] })
      const savedLabel = savedBytes > 0 ? ` · ${formatBytes(savedBytes)} a menos por foto` : ''
      setFeedback({
        type: 'success',
        message: `${uploaded.length} foto(s) na nuvem da loja, já otimizadas${savedLabel}.`,
      })
    } catch (error) {
      setFeedback({ type: 'error', message: `Falha no upload: ${error.message}` })
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const images = values.images.filter((image) => image.url.trim())
    if (images.length === 0) {
      setFeedback({ type: 'error', message: 'Adicione ao menos uma foto — a primeira é a capa.' })
      return
    }
    if (values.sizes.length === 0) {
      setFeedback({ type: 'error', message: 'Selecione as numerações disponíveis.' })
      return
    }

    const colors = values.colors.filter((color) => color.name.trim())
    if (colors.length === 0) {
      setFeedback({ type: 'error', message: 'Informe ao menos uma cor.' })
      return
    }

    const specs = values.specs.reduce((acc, spec) => {
      if (spec.key.trim() && spec.value.trim()) acc[spec.key.trim()] = spec.value.trim()
      return acc
    }, {})

    setSaving(true)
    setFeedback(null)
    try {
      await saveProduct({
        id,
        values: {
          ...values,
          slug: values.slug || slugify(values.model),
          specs,
          colors,
          images,
        },
      })
      await reloadStorefront()
      navigate('/admin/produtos')
    } catch (error) {
      const duplicated = error.message?.includes('duplicate key')
      setFeedback({
        type: 'error',
        message: duplicated
          ? 'Já existe um produto com este endereço (slug). Ajuste o campo endereço.'
          : error.message,
      })
      setSaving(false)
    }
  }

  if (loading) return <Spinner label="Carregando produto…" />

  return (
    <form className="ad-stack" onSubmit={handleSubmit}>
      <div className="ad-page-head">
        <Link to="/admin/produtos" className="ad-btn">
          <ArrowLeft size={16} />
          Voltar
        </Link>
        <h1>{id ? 'Editar chuteira' : 'Nova chuteira'}</h1>
      </div>

      <Panel title="Identificação">
        <div className="ad-form-grid">
          <Field label="Modelo">
            <input
              type="text"
              value={values.model}
              onChange={(event) => handleModel(event.target.value)}
              placeholder="Predator Elite FG"
              required
            />
          </Field>
          <Field label="Marca">
            <input
              type="text"
              value={values.brand}
              onChange={(event) => patch({ brand: event.target.value })}
              placeholder="Adidas"
              required
            />
          </Field>
          <Field label="Modalidade">
            <select
              value={values.modality}
              onChange={(event) => patch({ modality: event.target.value })}
            >
              {MODALITIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Endereço na loja"
            hint={`caioimports.com/chuteira/${values.slug || 'modelo'}`}
          >
            <input
              type="text"
              value={values.slug}
              onChange={(event) => {
                setSlugLocked(true)
                patch({ slug: slugify(event.target.value) })
              }}
              required
            />
          </Field>
        </div>
      </Panel>

      <Panel title="Preço e estoque" description="O custo alimenta o cálculo de lucro no painel.">
        <div className="ad-form-grid">
          <Field label="Preço de venda (R$)">
            <input
              type="number"
              min="0"
              step="1"
              value={values.price}
              onChange={(event) => patch({ price: event.target.value })}
              required
            />
          </Field>
          <Field label="Custo do par (R$)" hint="Opcional, mas melhora o relatório de lucro.">
            <input
              type="number"
              min="0"
              step="1"
              value={values.cost}
              onChange={(event) => patch({ cost: event.target.value })}
            />
          </Field>
          <Field label="Pares em estoque">
            <input
              type="number"
              min="0"
              step="1"
              value={values.stock}
              onChange={(event) => patch({ stock: event.target.value })}
            />
          </Field>
          <Field label="Ordem na vitrine" hint="Menor número aparece primeiro.">
            <input
              type="number"
              step="1"
              value={values.position}
              onChange={(event) => patch({ position: event.target.value })}
            />
          </Field>
        </div>

        <div className="ad-switches">
          <label className="ad-switch">
            <input
              type="checkbox"
              checked={values.active}
              onChange={(event) => patch({ active: event.target.checked })}
            />
            <span>Publicado na loja</span>
          </label>
          <label className="ad-switch">
            <input
              type="checkbox"
              checked={values.featured}
              onChange={(event) => patch({ featured: event.target.checked })}
            />
            <span>Destaque no topo da vitrine</span>
          </label>
        </div>
      </Panel>

      <Panel title="Descrição e especificações">
        <Field label="Descrição exibida na página do produto" wide>
          <textarea
            rows={5}
            value={values.description}
            onChange={(event) => patch({ description: event.target.value })}
            placeholder="Fale do cabedal, do solado e para quem esse modelo serve."
          />
        </Field>

        <div className="ad-repeater">
          {values.specs.map((spec, index) => (
            <div key={index} className="ad-repeater__row">
              <input
                type="text"
                value={spec.key}
                onChange={(event) => updateList('specs', index, { key: event.target.value })}
                placeholder="cabedal"
              />
              <input
                type="text"
                value={spec.value}
                onChange={(event) => updateList('specs', index, { value: event.target.value })}
                placeholder="Primeknit"
              />
              <button
                type="button"
                className="ad-icon-btn ad-icon-btn--danger"
                onClick={() => removeFromList('specs', index)}
                aria-label="Remover especificação"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="ad-btn"
            onClick={() => patch({ specs: [...values.specs, { key: '', value: '' }] })}
          >
            <Plus size={15} />
            Nova especificação
          </button>
        </div>
      </Panel>

      <Panel title="Numerações" description="Só os números marcados aparecem para o cliente.">
        <div className="ad-size-grid">
          {SIZE_RANGE.map((size) => (
            <button
              key={size}
              type="button"
              className={`ad-size ${values.sizes.includes(size) ? 'is-on' : ''}`}
              onClick={() => toggleSize(size)}
            >
              {size}
            </button>
          ))}
        </div>
      </Panel>

      <Panel
        title="Cores"
        description="O nome vai na mensagem do WhatsApp. O filtro é um ajuste visual opcional na foto."
      >
        <div className="ad-repeater">
          {values.colors.map((color, index) => (
            <div key={index} className="ad-repeater__row ad-repeater__row--color">
              <input
                type="text"
                value={color.name}
                onChange={(event) => updateList('colors', index, { name: event.target.value })}
                placeholder="Volt"
              />
              <input
                type="color"
                value={color.hex}
                onChange={(event) => updateList('colors', index, { hex: event.target.value })}
                aria-label="Cor"
              />
              <input
                type="text"
                value={color.filter}
                onChange={(event) => updateList('colors', index, { filter: event.target.value })}
                placeholder="saturate(1.1)"
              />
              <button
                type="button"
                className="ad-icon-btn ad-icon-btn--danger"
                onClick={() => removeFromList('colors', index)}
                aria-label="Remover cor"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="ad-btn"
            onClick={() =>
              patch({ colors: [...values.colors, { name: '', hex: '#C8FF00', filter: '' }] })
            }
          >
            <Plus size={15} />
            Nova cor
          </button>
        </div>
      </Panel>

      <Panel
        title="Fotos e ângulos"
        description="Prefira enviar do celular ou do computador — as fotos ficam salvas na nuvem da loja (Supabase), já redimensionadas para carregar rápido. A primeira foto é a capa."
        actions={
          <>
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              hidden
              onChange={handleUpload}
            />
            <button
              type="button"
              className="ad-btn ad-btn--primary"
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
            >
              <Upload size={15} />
              {uploading ? 'Enviando…' : 'Enviar fotos'}
            </button>
          </>
        }
      >
        <div className="ad-images">
          {values.images.map((image, index) => (
            <div key={index} className="ad-image-row">
              <div className="ad-image-row__thumb">
                {image.url ? <img src={image.url} alt="" loading="lazy" /> : <ImagePlus size={18} />}
              </div>
              <div className="ad-image-row__fields">
                <input
                  type="url"
                  value={image.url}
                  onChange={(event) => updateList('images', index, { url: event.target.value })}
                  placeholder="Link externo (opcional)"
                />
                <input
                  type="text"
                  value={image.label}
                  onChange={(event) => updateList('images', index, { label: event.target.value })}
                  placeholder="Lateral"
                />
              </div>
              <div className="ad-image-row__actions">
                {index === 0 ? <span className="ad-tag">Capa</span> : null}
                <button
                  type="button"
                  className="ad-icon-btn"
                  onClick={() => moveImage(index, -1)}
                  aria-label="Subir foto"
                >
                  <ChevronUp size={15} />
                </button>
                <button
                  type="button"
                  className="ad-icon-btn"
                  onClick={() => moveImage(index, 1)}
                  aria-label="Descer foto"
                >
                  <ChevronDown size={15} />
                </button>
                <button
                  type="button"
                  className="ad-icon-btn ad-icon-btn--danger"
                  onClick={() => removeFromList('images', index)}
                  aria-label="Remover foto"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="ad-btn"
          onClick={() => patch({ images: [...values.images, { url: '', label: 'Detalhe' }] })}
        >
          <Plus size={15} />
          Usar link externo
        </button>
      </Panel>

      <div className="ad-form-foot">
        <Feedback state={feedback} />
        <button type="submit" className="ad-btn ad-btn--primary" disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar produto'}
        </button>
      </div>
    </form>
  )
}
