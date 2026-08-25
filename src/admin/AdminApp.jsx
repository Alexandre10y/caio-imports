import { Navigate, Route, Routes } from 'react-router-dom'
import './admin.css'
import AdminLayout from './AdminLayout'
import RequireAdmin from './components/RequireAdmin'
import ContentPage from './pages/ContentPage'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import ProductEditorPage from './pages/ProductEditorPage'
import ProductsPage from './pages/ProductsPage'
import SalesPage from './pages/SalesPage'

export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route element={<RequireAdmin />}>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="produtos" element={<ProductsPage />} />
          <Route path="produtos/novo" element={<ProductEditorPage />} />
          <Route path="produtos/:id" element={<ProductEditorPage />} />
          <Route path="vendas" element={<SalesPage />} />
          <Route path="conteudo" element={<ContentPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}
