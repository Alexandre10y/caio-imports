import { AlertTriangle, Eye, MessageCircle, Package, TrendingUp } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatBRL, formatDate } from '../../lib/format'
import { CONFIRMED_STATUS, fetchAllProducts, fetchInterestEvents, fetchSales } from '../api'
import { EmptyState, Panel, Spinner, StatCard, StatusBadge } from '../components/ui'

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(key) {
  const [year, month] = key.split('-')
  return new Date(Number(year), Number(month) - 1, 1)
    .toLocaleDateString('pt-BR', { month: 'short' })
    .replace('.', '')
}

export default function DashboardPage() {
  const [data, setData] = useState({ sales: [], products: [], events: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [sales, products, events] = await Promise.all([
        fetchSales(),
        fetchAllProducts(),
        fetchInterestEvents(30),
      ])
      setData({ sales, products, events })
      setError(null)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const metrics = useMemo(() => {
    const { sales, products, events } = data
    const now = new Date()
    const currentMonth = monthKey(now)
    const confirmed = sales.filter((sale) => CONFIRMED_STATUS.includes(sale.status))

    const inMonth = confirmed.filter((sale) => monthKey(new Date(sale.sold_at)) === currentMonth)
    const revenueMonth = inMonth.reduce((sum, sale) => sum + Number(sale.total), 0)
    const profitMonth = inMonth.reduce((sum, sale) => sum + Number(sale.profit), 0)

    const open = sales.filter((sale) => sale.status === 'negociando')
    const openValue = open.reduce((sum, sale) => sum + Number(sale.total), 0)

    const clicks = events.filter((item) => item.type === 'whatsapp_click')
    const views = events.filter((item) => item.type === 'view')

    const byMonth = new Map()
    for (let index = 5; index >= 0; index -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - index, 1)
      byMonth.set(monthKey(date), 0)
    }
    confirmed.forEach((sale) => {
      const key = monthKey(new Date(sale.sold_at))
      if (byMonth.has(key)) byMonth.set(key, byMonth.get(key) + Number(sale.total))
    })
    const history = [...byMonth.entries()].map(([key, value]) => ({ key, value }))
    const peak = Math.max(1, ...history.map((item) => item.value))

    const ranking = new Map()
    confirmed.forEach((sale) => {
      const key = sale.product_model
      const current = ranking.get(key) ?? { model: key, units: 0, revenue: 0 }
      current.units += sale.quantity
      current.revenue += Number(sale.total)
      ranking.set(key, current)
    })

    const interest = new Map()
    clicks.forEach((item) => {
      if (!item.product_id) return
      interest.set(item.product_id, (interest.get(item.product_id) ?? 0) + 1)
    })
    const desired = [...interest.entries()]
      .map(([productId, count]) => ({
        model: products.find((product) => product.dbId === productId)?.model ?? 'Produto removido',
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      revenueMonth,
      profitMonth,
      salesMonth: inMonth.length,
      ticket: inMonth.length > 0 ? revenueMonth / inMonth.length : 0,
      openCount: open.length,
      openValue,
      clicks: clicks.length,
      views: views.length,
      conversion: clicks.length > 0 ? (inMonth.length / clicks.length) * 100 : 0,
      activeProducts: products.filter((product) => product.active).length,
      totalProducts: products.length,
      stockUnits: products.reduce((sum, product) => sum + product.stock, 0),
      lowStock: products.filter((product) => product.active && product.stock <= 2),
      history,
      peak,
      top: [...ranking.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
      desired,
      recent: sales.slice(0, 6),
    }
  }, [data])

  if (loading) return <Spinner label="Levantando os números da loja…" />
  if (error) return <EmptyState>Não foi possível carregar os dados: {error}</EmptyState>

  return (
    <div className="ad-stack">
      <div className="ad-grid ad-grid--stats">
        <StatCard
          label="Faturamento do mês"
          value={formatBRL(metrics.revenueMonth)}
          hint={`${metrics.salesMonth} venda(s) confirmada(s)`}
          tone="volt"
        />
        <StatCard
          label="Lucro do mês"
          value={formatBRL(metrics.profitMonth)}
          hint="Receita menos custo dos pares"
        />
        <StatCard
          label="Ticket médio"
          value={formatBRL(metrics.ticket)}
          hint="Média por venda no mês"
        />
        <StatCard
          label="Em negociação"
          value={String(metrics.openCount)}
          hint={`${formatBRL(metrics.openValue)} em jogo`}
          tone="warn"
        />
      </div>

      <div className="ad-grid ad-grid--two">
        <Panel
          title="Faturamento nos últimos 6 meses"
          description="Somente vendas pagas, enviadas ou entregues."
        >
          <div className="ad-chart">
            {metrics.history.map((item) => (
              <div key={item.key} className="ad-chart__col">
                <div
                  className="ad-chart__bar"
                  style={{ height: `${Math.max(4, (item.value / metrics.peak) * 100)}%` }}
                  title={formatBRL(item.value)}
                />
                <span>{monthLabel(item.key)}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Interesse na vitrine" description="Movimento real do site nos últimos 30 dias.">
          <ul className="ad-list">
            <li>
              <span>
                <MessageCircle size={16} /> Cliques no WhatsApp
              </span>
              <strong>{metrics.clicks}</strong>
            </li>
            <li>
              <span>
                <Eye size={16} /> Páginas de produto abertas
              </span>
              <strong>{metrics.views}</strong>
            </li>
            <li>
              <span>
                <TrendingUp size={16} /> Conversão estimada
              </span>
              <strong>{metrics.conversion.toFixed(1)}%</strong>
            </li>
            <li>
              <span>
                <Package size={16} /> Catálogo ativo
              </span>
              <strong>
                {metrics.activeProducts}/{metrics.totalProducts}
              </strong>
            </li>
          </ul>
        </Panel>
      </div>

      <div className="ad-grid ad-grid--two">
        <Panel title="Mais vendidas" description="Ranking por faturamento confirmado.">
          {metrics.top.length === 0 ? (
            <EmptyState>Nenhuma venda registrada ainda.</EmptyState>
          ) : (
            <ul className="ad-list">
              {metrics.top.map((item) => (
                <li key={item.model}>
                  <span>{item.model}</span>
                  <strong>
                    {item.units} un · {formatBRL(item.revenue)}
                  </strong>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Mais desejadas" description="Modelos que mais puxaram conversa no WhatsApp.">
          {metrics.desired.length === 0 ? (
            <EmptyState>Ainda sem cliques registrados neste período.</EmptyState>
          ) : (
            <ul className="ad-list">
              {metrics.desired.map((item) => (
                <li key={item.model}>
                  <span>{item.model}</span>
                  <strong>{item.count} clique(s)</strong>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {metrics.lowStock.length > 0 ? (
        <Panel
          title="Estoque no limite"
          description="Produtos ativos com 2 pares ou menos."
          actions={
            <Link to="/admin/produtos" className="ad-btn">
              Ajustar estoque
            </Link>
          }
        >
          <ul className="ad-list">
            {metrics.lowStock.map((product) => (
              <li key={product.dbId}>
                <span>
                  <AlertTriangle size={16} /> {product.model}
                </span>
                <strong>{product.stock} par(es)</strong>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      <Panel
        title="Últimos lançamentos de venda"
        actions={
          <Link to="/admin/vendas" className="ad-btn ad-btn--primary">
            Registrar venda
          </Link>
        }
      >
        {metrics.recent.length === 0 ? (
          <EmptyState>
            Nenhuma venda registrada. Fechou no WhatsApp? Lance aqui para acompanhar o resultado.
          </EmptyState>
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Cliente</th>
                  <th>Modelo</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recent.map((sale) => (
                  <tr key={sale.id}>
                    <td>{formatDate(sale.sold_at)}</td>
                    <td>{sale.customer_name}</td>
                    <td>{sale.product_model}</td>
                    <td>{formatBRL(sale.total)}</td>
                    <td>
                      <StatusBadge status={sale.status} />
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
