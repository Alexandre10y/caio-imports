import { ArrowLeft, ChevronDown, ChevronUp, ImagePlus, Plus, Trash2, Upload } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCatalog } from '../../hooks/useCatalog'
import { MODALITIES, SIZE_RANGE } from '../../lib/catalog'
import { slugify } from '../../lib/format'
import { fetchProductById, saveProduct, uploadProductImage } from '../api'
import { formatBytes } from '../../lib/imageOptimize'
import { Feedback, Field, Panel, Spinner } from '../components/ui'

const EMPTY_COLOR = () => ({
  name: '',
  hex: '#C8FF00',
  images: [{ url: '', label: 'Frontal' }],
})

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
  colors: [EMPTY_COLOR()],
  active: true,
  featured: false,
}

const IMAGE_LABELS = ['Frontal', 'Lateral', 'Solado', 'Detalhe', 'Em campo']

function colorsFromProduct(product) {
  const images = product.images ?? []
  const colors = (product.colors ?? []).map((color) => {
    const name = color.name || ''
    const needle = name.trim().toLowerCase()
    const matched = images
      .filter((image) => (image.colorName || '').trim().toLowerCase() === needle)
      .map((image) => ({ url: image.src, label: image.label || 'Ângulo' }))

    // Produtos antigos: se a cor não tem fotos, mas nenhuma imagem tem colorName, joga tudo na 1ª.
    return {
      name,
      hex: color.hex || '#C8FF00',
      images: matched.length > 0 ? matched : [{ url: '', label: 'Frontal' }],
    }
  })

  if (colors.length === 0) return [EMPTY_COLOR()]

  const anyLinked = images.some((image) => image.colorName?.trim())
  if (!anyLinked && images.length > 0) {
    colors[0] = {
      ...colors[0],
      images: images.map((image) => ({ url: image.src, label: image.label || 'Ângulo' })),
    }
  }

  return colors
}

export default function ProductEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { reload: reloadStorefront } = useCatalog()
  const fileInput = useRef(null)
  const uploadColorIndex = useRef(0)
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
        colors: colorsFromProduct(product),
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

  function updateColor(index, next) {
    updateList('colors', index, next)
  }

  function updateColorImage(colorIndex, imageIndex, next) {
    const colors = [...values.colors]
    const images = [...(colors[colorIndex].images ?? [])]
    images[imageIndex] = { ...images[imageIndex], ...next }
    colors[colorIndex] = { ...colors[colorIndex], images }
    patch({ colors })
  }

  function removeColorImage(colorIndex, imageIndex) {
    const colors = [...values.colors]
    const images = (colors[colorIndex].images ?? []).filter((_, i) => i !== imageIndex)
    colors[colorIndex] = {
      ...colors[colorIndex],
      images: images.length > 0 ? images : [{ url: '', label: 'Frontal' }],
    }
    patch({ colors })
  }

  function moveColorImage(colorIndex, imageIndex, direction) {
    const target = imageIndex + direction
    const colors = [...values.colors]
    const images = [...(colors[colorIndex].images ?? [])]
    if (target < 0 || target >= images.length) return
    ;[images[imageIndex], images[target]] = [images[target], images[imageIndex]]
    colors[colorIndex] = { ...colors[colorIndex], images }
    patch({ colors })
  }

  function addColorImage(colorIndex) {
    const colors = [...values.colors]
    const images = [...(colors[colorIndex].images ?? [])]
    const label = IMAGE_LABELS[images.length] ?? 'Detalhe'
    colors[colorIndex] = {
      ...colors[colorIndex],
      images: [...images, { url: '', label }],
    }
    patch({ colors })
  }

  function triggerUpload(colorIndex) {
    uploadColorIndex.current = colorIndex
    fileInput.current?.click()
  }

  async function handleUpload(event) {
    const files = [...(event.target.files ?? [])]
    if (files.length === 0) return
    const colorIndex = uploadColorIndex.current

    setUploading(true)
    setFeedback(null)
    try {
      const slug = values.slug || slugify(values.model) || 'novo-produto'
      const uploaded = []
      let savedBytes = 0
      const existingCount = (values.colors[colorIndex]?.images ?? []).filter((image) =>
        image.url.trim(),
      ).length

      for (const file of files) {
        const result = await uploadProductImage(file, slug)
        uploaded.push({
          url: result.url,
          label: IMAGE_LABELS[existingCount + uploaded.length] ?? 'Detalhe',
        })
        savedBytes += Math.max(0, result.originalBytes - result.bytes)
      }

      const colors = [...values.colors]
      const existing = (colors[colorIndex].images ?? []).filter((image) => image.url.trim())
      colors[colorIndex] = {
        ...colors[colorIndex],
        images: [...existing, ...uploaded],
      }
      patch({ colors })

      const savedLabel = savedBytes > 0 ? ` · ${formatBytes(savedBytes)} a menos por foto` : ''
      setFeedback({
        type: 'success',
        message: `${uploaded.length} foto(s) na cor atual, já otimizadas${savedLabel}.`,
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

    if (values.sizes.length === 0) {
      setFeedback({ type: 'error', message: 'Selecione as numerações disponíveis.' })
      return
    }

    const colors = values.colors
      .map((color) => ({
        name: color.name.trim(),
        hex: color.hex || '#C8FF00',
        images: (color.images ?? []).filter((image) => image.url.trim()),
      }))
      .filter((color) => color.name)

    if (colors.length === 0) {
      setFeedback({ type: 'error', message: 'Informe ao menos uma cor com nome.' })
      return
    }

    const missingPhotos = colors.find((color) => color.images.length === 0)
    if (missingPhotos) {
      setFeedback({
        type: 'error',
        message: `A cor "${missingPhotos.name}" precisa de ao menos uma foto.`,
      })
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
      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        hidden
        onChange={handleUpload}
      />

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
        title="Cores e fotos"
        description="Cada cor tem sua própria galeria (ideal ~4 ângulos em 1600×1600). Na loja, ao clicar na cor, as fotos mudam. A primeira foto da primeira cor é a capa da vitrine."
      >
        <div className="ad-color-blocks">
          {values.colors.map((color, colorIndex) => (
            <div key={colorIndex} className="ad-color-block">
              <div className="ad-color-block__head">
                <input
                  type="text"
                  value={color.name}
                  onChange={(event) => updateColor(colorIndex, { name: event.target.value })}
                  placeholder="Nome da cor (ex.: Roxo)"
                  aria-label="Nome da cor"
                />
                <input
                  type="color"
                  value={color.hex}
                  onChange={(event) => updateColor(colorIndex, { hex: event.target.value })}
                  aria-label="Hex da cor"
                />
                {colorIndex === 0 ? <span className="ad-tag">Cor principal</span> : null}
                <button
                  type="button"
                  className="ad-icon-btn ad-icon-btn--danger"
                  onClick={() => {
                    if (values.colors.length <= 1) {
                      setFeedback({ type: 'error', message: 'Mantenha ao menos uma cor.' })
                      return
                    }
                    removeFromList('colors', colorIndex)
                  }}
                  aria-label="Remover cor"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="ad-color-block__actions">
                <button
                  type="button"
                  className="ad-btn ad-btn--primary"
                  onClick={() => triggerUpload(colorIndex)}
                  disabled={uploading}
                >
                  <Upload size={15} />
                  {uploading && uploadColorIndex.current === colorIndex
                    ? 'Enviando…'
                    : 'Enviar fotos desta cor'}
                </button>
                <button type="button" className="ad-btn" onClick={() => addColorImage(colorIndex)}>
                  <Plus size={15} />
                  Link externo
                </button>
              </div>

              <div className="ad-images">
                {(color.images ?? []).map((image, imageIndex) => (
                  <div key={imageIndex} className="ad-image-row">
                    <div className="ad-image-row__thumb">
                      {image.url ? (
                        <img src={image.url} alt="" loading="lazy" />
                      ) : (
                        <ImagePlus size={18} />
                      )}
                    </div>
                    <div className="ad-image-row__fields">
                      <input
                        type="url"
                        value={image.url}
                        onChange={(event) =>
                          updateColorImage(colorIndex, imageIndex, { url: event.target.value })
                        }
                        placeholder="Link da foto ou envie pelo botão acima"
                      />
                      <input
                        type="text"
                        value={image.label}
                        onChange={(event) =>
                          updateColorImage(colorIndex, imageIndex, { label: event.target.value })
                        }
                        placeholder="Frontal"
                      />
                    </div>
                    <div className="ad-image-row__actions">
                      {colorIndex === 0 && imageIndex === 0 ? (
                        <span className="ad-tag">Capa</span>
                      ) : null}
                      <button
                        type="button"
                        className="ad-icon-btn"
                        onClick={() => moveColorImage(colorIndex, imageIndex, -1)}
                        aria-label="Subir foto"
                      >
                        <ChevronUp size={15} />
                      </button>
                      <button
                        type="button"
                        className="ad-icon-btn"
                        onClick={() => moveColorImage(colorIndex, imageIndex, 1)}
                        aria-label="Descer foto"
                      >
                        <ChevronDown size={15} />
                      </button>
                      <button
                        type="button"
                        className="ad-icon-btn ad-icon-btn--danger"
                        onClick={() => removeColorImage(colorIndex, imageIndex)}
                        aria-label="Remover foto"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="ad-btn"
          onClick={() => patch({ colors: [...values.colors, EMPTY_COLOR()] })}
        >
          <Plus size={15} />
          Nova cor com fotos
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
