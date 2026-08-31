import { ImagePlus, Plus, Save, Trash2, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useCatalog } from '../../hooks/useCatalog'
import { saveSiteContent } from '../../lib/catalog'
import { DEFAULT_CONTENT } from '../../lib/defaultContent'
import { uploadProductImage } from '../api'
import { Feedback, Field, Panel } from '../components/ui'

const HERO_SHOT_SLOTS = [
  { label: 'Foto principal (topo esquerdo)', hint: 'Primeira imagem que o cliente vê no collage.' },
  { label: 'Foto do meio (direita)', hint: 'Segunda camada do collage.' },
  { label: 'Foto de baixo', hint: 'Terceira camada — costuma ser um close ou detalhe.' },
]

const SECTIONS = [
  {
    key: 'contact',
    title: 'Contato da loja',
    description: 'Usado em todos os botões de WhatsApp e no ícone do Instagram.',
    fields: [
      {
        name: 'whatsapp',
        label: 'WhatsApp (com DDI e DDD, só números)',
        hint: 'Exemplo: 5511990000000',
      },
      { name: 'instagram', label: 'Link do Instagram' },
    ],
  },
  {
    key: 'hero',
    title: 'Abertura do site',
    description: 'Primeira tela que o cliente vê — textos e as três fotos do collage.',
    fields: [
      { name: 'eyebrow', label: 'Linha de cima' },
      { name: 'title', label: 'Título' },
      { name: 'titleAccent', label: 'Título em destaque' },
      { name: 'lead', label: 'Texto de apresentação', type: 'textarea' },
      { name: 'ctaLabel', label: 'Texto do botão' },
      { name: 'meta', label: 'Aviso ao lado do botão' },
      { name: 'badge', label: 'Selo sobre as fotos' },
    ],
    shots: true,
  },
  {
    key: 'showcase',
    title: 'Vitrine',
    fields: [
      { name: 'kicker', label: 'Linha de cima' },
      { name: 'title', label: 'Título da seção' },
    ],
  },
  {
    key: 'guide',
    title: 'Informações úteis',
    description: 'Os blocos que explicam compra, numeração, frete e modalidades.',
    fields: [
      { name: 'kicker', label: 'Linha de cima' },
      { name: 'title', label: 'Título da seção' },
    ],
    items: {
      name: 'items',
      label: 'Blocos de informação',
      icons: [
        { value: 'message', label: 'Conversa' },
        { value: 'field', label: 'Campo' },
        { value: 'ruler', label: 'Numeração' },
        { value: 'truck', label: 'Entrega' },
        { value: 'info', label: 'Informação' },
      ],
    },
  },
  {
    key: 'guarantee',
    title: 'Garantia',
    fields: [
      { name: 'kicker', label: 'Linha de cima' },
      { name: 'title', label: 'Título da seção' },
      { name: 'stampNumber', label: 'Número do selo' },
      { name: 'stampLabel', label: 'Legenda do selo' },
      { name: 'text', label: 'Texto principal', type: 'textarea' },
      { name: 'fine', label: 'Letra miúda', type: 'textarea' },
    ],
  },
  {
    key: 'footer',
    title: 'Rodapé',
    fields: [
      { name: 'kicker', label: 'Linha de cima' },
      { name: 'title', label: 'Título' },
      { name: 'text', label: 'Texto', type: 'textarea' },
      { name: 'copyright', label: 'Nome no copyright' },
      { name: 'tagline', label: 'Assinatura da direita' },
    ],
  },
]

function normalizeHeroShots(shots) {
  const defaults = DEFAULT_CONTENT.hero.shots ?? []
  return HERO_SHOT_SLOTS.map((_, index) => ({
    src: shots?.[index]?.src ?? defaults[index]?.src ?? '',
    alt: shots?.[index]?.alt ?? defaults[index]?.alt ?? '',
  }))
}

function SectionForm({ section, initial, onSaved }) {
  const [values, setValues] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [uploadingIndex, setUploadingIndex] = useState(null)
  const [pendingUploadIndex, setPendingUploadIndex] = useState(0)
  const shotFileInput = useRef(null)

  useEffect(() => {
    setValues(section.shots ? { ...initial, shots: normalizeHeroShots(initial.shots) } : initial)
  }, [initial, section.shots])

  const items = Array.isArray(values.items) ? values.items : []
  const heroShots = section.shots ? normalizeHeroShots(values.shots) : []

  function patch(next) {
    setValues((current) => ({ ...current, ...next }))
  }

  function patchItem(index, next) {
    const list = [...items]
    list[index] = { ...list[index], ...next }
    patch({ items: list })
  }

  function patchHeroShot(index, next) {
    const list = normalizeHeroShots(values.shots)
    list[index] = { ...list[index], ...next }
    patch({ shots: list })
  }

  function triggerHeroUpload(index) {
    setPendingUploadIndex(index)
    shotFileInput.current?.click()
  }

  async function handleHeroUpload(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setUploadingIndex(pendingUploadIndex)
    setFeedback(null)
    try {
      const result = await uploadProductImage(file, 'hero')
      patchHeroShot(pendingUploadIndex, { src: result.url })
      setFeedback({
        type: 'success',
        message: `Foto ${pendingUploadIndex + 1} enviada e otimizada. Clique em Publicar para aparecer no site.`,
      })
    } catch (error) {
      setFeedback({ type: 'error', message: `Falha no upload: ${error.message}` })
    } finally {
      setUploadingIndex(null)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setFeedback(null)
    try {
      const payload = section.shots
        ? { ...values, shots: normalizeHeroShots(values.shots) }
        : values
      await saveSiteContent(section.key, payload)
      await onSaved()
      setFeedback({ type: 'success', message: 'Publicado no site.' })
    } catch (error) {
      setFeedback({ type: 'error', message: error.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Panel title={section.title} description={section.description}>
      <form className="ad-stack" onSubmit={handleSubmit}>
        <div className="ad-form-grid">
          {section.fields.map((field) =>
            field.type === 'textarea' ? (
              <Field key={field.name} label={field.label} hint={field.hint} wide>
                <textarea
                  rows={3}
                  value={values[field.name] ?? ''}
                  onChange={(event) => patch({ [field.name]: event.target.value })}
                />
              </Field>
            ) : (
              <Field key={field.name} label={field.label} hint={field.hint}>
                <input
                  type="text"
                  value={values[field.name] ?? ''}
                  onChange={(event) => patch({ [field.name]: event.target.value })}
                />
              </Field>
            ),
          )}
        </div>

        {section.shots ? (
          <div className="ad-repeater">
            <input
              ref={shotFileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              hidden
              onChange={handleHeroUpload}
            />
            <p className="ad-field__label">Fotos de abertura</p>
            <p className="ad-field__hint">
              Três fotos de chuteiras no collage da primeira tela. Prefira enviar do celular ou
              computador — ficam salvas na nuvem da loja. Também pode colar um link externo.
            </p>
            <div className="ad-images">
              {heroShots.map((shot, index) => (
                <div key={index} className="ad-image-row ad-image-row--stacked">
                  <div className="ad-image-row__thumb">
                    {shot.src ? (
                      <img src={shot.src} alt="" loading="lazy" />
                    ) : (
                      <ImagePlus size={18} />
                    )}
                  </div>
                  <div className="ad-image-row__fields ad-image-row__fields--stacked">
                    <p className="ad-field__label">{HERO_SHOT_SLOTS[index].label}</p>
                    {HERO_SHOT_SLOTS[index].hint ? (
                      <p className="ad-field__hint">{HERO_SHOT_SLOTS[index].hint}</p>
                    ) : null}
                    <input
                      type="url"
                      value={shot.src}
                      onChange={(event) => patchHeroShot(index, { src: event.target.value })}
                      placeholder="Link da foto ou envie pelo botão ao lado"
                    />
                    <input
                      type="text"
                      value={shot.alt}
                      onChange={(event) => patchHeroShot(index, { alt: event.target.value })}
                      placeholder="Descrição da foto (acessibilidade)"
                    />
                  </div>
                  <div className="ad-image-row__actions">
                    <button
                      type="button"
                      className="ad-btn"
                      onClick={() => triggerHeroUpload(index)}
                      disabled={uploadingIndex !== null}
                    >
                      <Upload size={15} />
                      {uploadingIndex === index ? 'Enviando…' : 'Enviar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {section.items ? (
          <div className="ad-repeater">
            <p className="ad-field__label">{section.items.label}</p>
            {items.map((item, index) => (
              <div key={index} className="ad-content-item">
                <div className="ad-content-item__head">
                  <select
                    value={item.icon ?? 'info'}
                    onChange={(event) => patchItem(index, { icon: event.target.value })}
                    aria-label="Ícone do bloco"
                  >
                    {section.items.icons.map((icon) => (
                      <option key={icon.value} value={icon.value}>
                        {icon.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={item.title ?? ''}
                    onChange={(event) => patchItem(index, { title: event.target.value })}
                    placeholder="Título do bloco"
                  />
                  <button
                    type="button"
                    className="ad-icon-btn ad-icon-btn--danger"
                    onClick={() => patch({ items: items.filter((_, i) => i !== index) })}
                    aria-label="Remover bloco"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={item.text ?? ''}
                  onChange={(event) => patchItem(index, { text: event.target.value })}
                  placeholder="Texto explicativo"
                />
              </div>
            ))}
            <button
              type="button"
              className="ad-btn"
              onClick={() => patch({ items: [...items, { icon: 'info', title: '', text: '' }] })}
            >
              <Plus size={15} />
              Novo bloco
            </button>
          </div>
        ) : null}

        <div className="ad-form-foot">
          <Feedback state={feedback} />
          <button type="submit" className="ad-btn ad-btn--primary" disabled={saving}>
            <Save size={15} />
            {saving ? 'Publicando…' : 'Publicar alterações'}
          </button>
        </div>
      </form>
    </Panel>
  )
}

export default function ContentPage() {
  const { content, reload } = useCatalog()

  return (
    <div className="ad-stack">
      <Panel
        title="Conteúdo do site"
        description="Cada bloco abaixo corresponde a uma seção da loja. Ao publicar, o site atualiza na hora."
      />
      {SECTIONS.map((section) => (
        <SectionForm
          key={section.key}
          section={section}
          initial={content[section.key] ?? {}}
          onSaved={reload}
        />
      ))}
    </div>
  )
}
