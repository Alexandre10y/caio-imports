import { MessageCircle, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useCatalog } from '../../hooks/useCatalog'
import {
  buildDirectWhatsAppLink,
  formatBRL,
  formatDate,
  onlyDigits,
  toDateInput,
} from '../../lib/format'
import {
  CONFIRMED_STATUS,
  PAYMENT_METHODS,
  SALE_CHANNELS,
  SALE_STATUS,
  createSale,
  decrementStock,
  deleteSale,
  fetchAllProducts,
  fetchSales,
  updateSale,
} from '../api'
import { EmptyState, Feedback, Field, Panel, Spinner, StatCard } from '../components/ui'

function monthStart() {
  const now = new Date()
  return toDateInput(new Date(now.getFullYear(), now.getMonth(), 1))
}

const EMPTY_SALE = {
  productId: '',
  productModel: '',
  productBrand: '',
  customerName: '',
  customerPhone: '',
  size: '',
  color: '',
  quantity: 1,
  unitPrice: '',
  unitCost: '',
  discount: 0,
  paymentMethod: 'pix',
  channel: 'whatsapp',
  status: 'pago',
  soldAt: toDateInput(),
  notes: '',
  reduceStock: true,
}

export default function SalesPage() {
  const { user } = useAuth()
  const { reload: reloadStorefront } = useCatalog()
  const [sales, setSales] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_SALE)
  const [filters, setFilters] = useState({
    from: monthStart(),
    to: toDateInput(),
    status: 'all',
    channel: 'all',
    query: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [salesData, productsData] = await Promise.all([
        fetchSales({
          from: filters.from,
          to: filters.to,
          status: filters.status,
          channel: filters.channel,
        }),
        fetchAllProducts(),
      ])
      setSales(salesData)
      setProducts(productsData)
    } catch (error) {
      setFeedback({ type: 'error', message: error.message })
    } finally {
      setLoading(false)
    }
  }, [filters.channel, filters.from, filters.status, filters.to])

  useEffect(() => {
    void load()
  }, [load])

  const visible = useMemo(() => {
    const needle = filters.query.trim().toLowerCase()
    if (!needle) return sales
    return sales.filter(
      (sale) =>
        sale.customer_name.toLowerCase().includes(needle) ||
        sale.product_model.toLowerCase().includes(needle) ||
        (sale.customer_phone ?? '').includes(needle),
    )
  }, [filters.query, sales])

  const summary = useMemo(() => {
    const confirmed = visible.filter((sale) => CONFIRMED_STATUS.includes(sale.status))
    const open = visible.filter((sale) => sale.status === 'negociando')
    return {
      revenue: confirmed.reduce((sum, sale) => sum + Number(sale.total), 0),
      profit: confirmed.reduce((sum, sale) => sum + Number(sale.profit), 0),
      units: confirmed.reduce((sum, sale) => sum + sale.quantity, 0),
      count: confirmed.length,
      open: open.length,
      openValue: open.reduce((sum, sale) => sum + Number(sale.total), 0),
    }
  }, [visible])

  function patchForm(next) {
    setForm((current) => ({ ...current, ...next }))
  }

  function pickProduct(productId) {
    const product = products.find((item) => item.dbId === productId)
    if (!product) {
      patchForm({ productId: '' })
      return
    }
    patchForm({
      productId,
      productModel: product.model,
      productBrand: product.brand,
      unitPrice: String(product.price),
      unitCost: product.cost == null ? '' : String(product.cost),
      color: product.colors[0]?.name ?? '',
    })
  }

  function openNew() {
    setEditingId(null)
    setForm({ ...EMPTY_SALE, soldAt: toDateInput() })
    setFeedback(null)
    setFormOpen(true)
  }

  function openEdit(sale) {
    setEditingId(sale.id)
    setForm({
      productId: sale.product_id ?? '',
      productModel: sale.product_model,
      productBrand: sale.product_brand ?? '',
      customerName: sale.customer_name,
      customerPhone: sale.customer_phone ?? '',
      size: sale.size ?? '',
      color: sale.color ?? '',
      quantity: sale.quantity,
      unitPrice: String(sale.unit_price),
      unitCost: String(sale.unit_cost),
      discount: Number(sale.discount),
      paymentMethod: sale.payment_method ?? 'pix',
      channel: sale.channel,
      status: sale.status,
      soldAt: toDateInput(sale.sold_at),
      notes: sale.notes ?? '',
      reduceStock: false,
    })
    setFeedback(null)
    setFormOpen(true)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const model = form.productModel.trim()
    if (!model) {
      setFeedback({ type: 'error', message: 'Escolha um produto ou escreva o modelo vendido.' })
      return
    }

    const payload = {
      product_id: form.productId || null,
      product_model: model,
      product_brand: form.productBrand.trim() || null,
      customer_name: form.customerName.trim(),
      customer_phone: onlyDigits(form.customerPhone) || null,
      size: form.size ? String(form.size) : null,
      color: form.color.trim() || null,
      quantity: Number(form.quantity) || 1,
      unit_price: Number(form.unitPrice) || 0,
      unit_cost: Number(form.unitCost) || 0,
      discount: Number(form.discount) || 0,
      payment_method: form.paymentMethod,
      channel: form.channel,
      status: form.status,
      notes: form.notes.trim() || null,
      sold_at: `${form.soldAt}T12:00:00`,
    }

    setSaving(true)
    setFeedback(null)
    try {
      if (editingId) {
        await updateSale(editingId, payload)
      } else {
        await createSale({ ...payload, created_by: user?.id ?? null })
        if (form.reduceStock && form.productId) {
          await decrementStock(form.productId, payload.quantity)
          await reloadStorefront()
        }
      }
      setFormOpen(false)
      setEditingId(null)
      await load()
      setFeedback({ type: 'success', message: 'Venda registrada.' })
    } catch (error) {
      setFeedback({ type: 'error', message: error.message })
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusChange(sale, status) {
    try {
      await updateSale(sale.id, { status })
      await load()
    } catch (error) {
      setFeedback({ type: 'error', message: error.message })
    }
  }

  async function handleDelete(sale) {
    if (!window.confirm(`Excluir a venda de ${sale.customer_name}?`)) return
    try {
      await deleteSale(sale.id)
      await load()
    } catch (error) {
      setFeedback({ type: 'error', message: error.message })
    }
  }

  const total = (Number(form.unitPrice) || 0) * (Number(form.quantity) || 1) - (Number(form.discount) || 0)

  return (
    <div className="ad-stack">
      <div className="ad-grid ad-grid--stats">
        <StatCard
          label="Faturamento no filtro"
          value={formatBRL(summary.revenue)}
          hint={`${summary.count} venda(s) · ${summary.units} par(es)`}
          tone="volt"
        />
        <StatCard label="Lucro no filtro" value={formatBRL(summary.profit)} />
        <StatCard
          label="Em negociação"
          value={String(summary.open)}
          hint={formatBRL(summary.openValue)}
          tone="warn"
        />
        <StatCard
          label="Ticket médio"
          value={formatBRL(summary.count > 0 ? summary.revenue / summary.count : 0)}
        />
      </div>

      {formOpen ? (
        <Panel
          title={editingId ? 'Editar venda' : 'Registrar venda'}
          description="Fechou no WhatsApp? Registre aqui para entrar no controle da loja."
          actions={
            <button type="button" className="ad-icon-btn" onClick={() => setFormOpen(false)}>
              <X size={16} />
            </button>
          }
        >
          <form className="ad-stack" onSubmit={handleSubmit}>
            <div className="ad-form-grid">
              <Field label="Produto do catálogo" hint="Preenche preço, custo e cor automaticamente.">
                <select
                  value={form.productId}
                  onChange={(event) => pickProduct(event.target.value)}
                >
                  <option value="">Fora do catálogo</option>
                  {products.map((product) => (
                    <option key={product.dbId} value={product.dbId}>
                      {product.model} — {product.brand}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Modelo vendido">
                <input
                  type="text"
                  value={form.productModel}
                  onChange={(event) => patchForm({ productModel: event.target.value })}
                  required
                />
              </Field>
              <Field label="Cliente">
                <input
                  type="text"
                  value={form.customerName}
                  onChange={(event) => patchForm({ customerName: event.target.value })}
                  required
                />
              </Field>
              <Field label="WhatsApp do cliente">
                <input
                  type="tel"
                  value={form.customerPhone}
                  onChange={(event) => patchForm({ customerPhone: event.target.value })}
                  placeholder="11 90000-0000"
                />
              </Field>
              <Field label="Numeração">
                <input
                  type="text"
                  value={form.size}
                  onChange={(event) => patchForm({ size: event.target.value })}
                  placeholder="41"
                />
              </Field>
              <Field label="Cor">
                <input
                  type="text"
                  value={form.color}
                  onChange={(event) => patchForm({ color: event.target.value })}
                />
              </Field>
              <Field label="Quantidade">
                <input
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(event) => patchForm({ quantity: event.target.value })}
                />
              </Field>
              <Field label="Preço unitário (R$)">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.unitPrice}
                  onChange={(event) => patchForm({ unitPrice: event.target.value })}
                  required
                />
              </Field>
              <Field label="Custo unitário (R$)">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.unitCost}
                  onChange={(event) => patchForm({ unitCost: event.target.value })}
                />
              </Field>
              <Field label="Desconto (R$)">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.discount}
                  onChange={(event) => patchForm({ discount: event.target.value })}
                />
              </Field>
              <Field label="Pagamento">
                <select
                  value={form.paymentMethod}
                  onChange={(event) => patchForm({ paymentMethod: event.target.value })}
                >
                  {PAYMENT_METHODS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Canal">
                <select
                  value={form.channel}
                  onChange={(event) => patchForm({ channel: event.target.value })}
                >
                  {SALE_CHANNELS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Situação">
                <select
                  value={form.status}
                  onChange={(event) => patchForm({ status: event.target.value })}
                >
                  {SALE_STATUS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Data da venda">
                <input
                  type="date"
                  value={form.soldAt}
                  onChange={(event) => patchForm({ soldAt: event.target.value })}
                  required
                />
              </Field>
            </div>

            <Field label="Anotações da conversa" wide>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(event) => patchForm({ notes: event.target.value })}
                placeholder="Combinado no Zap: envio pelo Correios, pagou por Pix, pediu troca de cor se não servir."
              />
            </Field>

            {!editingId && form.productId ? (
              <label className="ad-switch">
                <input
                  type="checkbox"
                  checked={form.reduceStock}
                  onChange={(event) => patchForm({ reduceStock: event.target.checked })}
                />
                <span>Dar baixa no estoque deste produto</span>
              </label>
            ) : null}

            <div className="ad-form-foot">
              <p className="ad-total">
                Total da venda <strong>{formatBRL(total)}</strong>
              </p>
              <Feedback state={feedback} />
              <button type="submit" className="ad-btn ad-btn--primary" disabled={saving}>
                {saving ? 'Salvando…' : editingId ? 'Salvar alterações' : 'Registrar venda'}
              </button>
            </div>
          </form>
        </Panel>
      ) : null}

      <Panel
        title="Histórico de vendas"
        description="Filtre por período, situação e canal para acompanhar o resultado."
        actions={
          <button type="button" className="ad-btn ad-btn--primary" onClick={openNew}>
            <Plus size={16} />
            Registrar venda
          </button>
        }
      >
        <div className="ad-filters">
          <label className="ad-inline-field">
            De
            <input
              type="date"
              value={filters.from}
              onChange={(event) => setFilters({ ...filters, from: event.target.value })}
            />
          </label>
          <label className="ad-inline-field">
            Até
            <input
              type="date"
              value={filters.to}
              onChange={(event) => setFilters({ ...filters, to: event.target.value })}
            />
          </label>
          <select
            value={filters.status}
            onChange={(event) => setFilters({ ...filters, status: event.target.value })}
          >
            <option value="all">Todas as situações</option>
            {SALE_STATUS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <select
            value={filters.channel}
            onChange={(event) => setFilters({ ...filters, channel: event.target.value })}
          >
            <option value="all">Todos os canais</option>
            {SALE_CHANNELS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <div className="ad-input-icon ad-input-icon--grow">
            <Search size={16} />
            <input
              type="search"
              value={filters.query}
              onChange={(event) => setFilters({ ...filters, query: event.target.value })}
              placeholder="Cliente, telefone ou modelo"
            />
          </div>
        </div>

        {!formOpen ? <Feedback state={feedback} /> : null}

        {loading ? (
          <Spinner label="Buscando vendas…" />
        ) : visible.length === 0 ? (
          <EmptyState>Nenhuma venda neste recorte.</EmptyState>
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Cliente</th>
                  <th>Produto</th>
                  <th>Total</th>
                  <th>Lucro</th>
                  <th>Situação</th>
                  <th aria-label="Ações" />
                </tr>
              </thead>
              <tbody>
                {visible.map((sale) => {
                  const whatsappLink = buildDirectWhatsAppLink(sale.customer_phone)
                  return (
                    <tr key={sale.id}>
                      <td>{formatDate(sale.sold_at)}</td>
                      <td>
                        <div className="ad-cell-stack">
                          <strong>{sale.customer_name}</strong>
                          {whatsappLink ? (
                            <a href={whatsappLink} target="_blank" rel="noreferrer">
                              <MessageCircle size={13} />
                              Abrir conversa
                            </a>
                          ) : null}
                        </div>
                      </td>
                      <td>
                        <div className="ad-cell-stack">
                          <strong>{sale.product_model}</strong>
                          <small>
                            {sale.quantity} un
                            {sale.size ? ` · nº ${sale.size}` : ''}
                            {sale.color ? ` · ${sale.color}` : ''}
                          </small>
                        </div>
                      </td>
                      <td>{formatBRL(sale.total)}</td>
                      <td>{formatBRL(sale.profit)}</td>
                      <td>
                        <select
                          className={`ad-status-select ad-status-select--${sale.status}`}
                          value={sale.status}
                          onChange={(event) => handleStatusChange(sale, event.target.value)}
                          aria-label="Alterar situação"
                        >
                          {SALE_STATUS.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div className="ad-row-actions">
                          <button
                            type="button"
                            className="ad-icon-btn"
                            onClick={() => openEdit(sale)}
                            title="Editar"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            className="ad-icon-btn ad-icon-btn--danger"
                            onClick={() => handleDelete(sale)}
                            title="Excluir"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  )
}
