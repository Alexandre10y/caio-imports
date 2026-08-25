import { Plus, Save, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useCatalog } from '../../hooks/useCatalog'
import { saveSiteContent } from '../../lib/catalog'
import { Feedback, Field, Panel } from '../components/ui'

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
    description: 'Primeira tela que o cliente vê.',
    fields: [
      { name: 'eyebrow', label: 'Linha de cima' },
      { name: 'title', label: 'Título' },
      { name: 'titleAccent', label: 'Título em destaque' },
      { name: 'lead', label: 'Texto de apresentação', type: 'textarea' },
      { name: 'ctaLabel', label: 'Texto do botão' },
      { name: 'meta', label: 'Aviso ao lado do botão' },
      { name: 'badge', label: 'Selo sobre as fotos' },
    ],
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

function SectionForm({ section, initial, onSaved }) {
  const [values, setValues] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    setValues(initial)
  }, [initial])

  const items = Array.isArray(values.items) ? values.items : []

  function patch(next) {
    setValues((current) => ({ ...current, ...next }))
  }

  function patchItem(index, next) {
    const list = [...items]
    list[index] = { ...list[index], ...next }
    patch({ items: list })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setFeedback(null)
    try {
      await saveSiteContent(section.key, values)
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
