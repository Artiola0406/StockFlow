import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { DashboardPage } from './pages/DashboardPage'
import { ProductsPage } from './pages/ProductsPage'
import { WarehousesPage } from './pages/WarehousesPage'
import { StockMovementsPage } from './pages/StockMovementsPage'
import { SuppliersPage } from './pages/SuppliersPage'
import { OrdersPage } from './pages/OrdersPage'
import { CustomersPage } from './pages/CustomersPage'
import { ReportsPage } from './pages/ReportsPage'
import { LoginPage } from './pages/LoginPage'
import { UnauthorizedPage } from './pages/UnauthorizedPage'
import { UsersPage } from './pages/UsersPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route
              index
              element={
                <ProtectedRoute requiredPage="dashboard">
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="products"
              element={
                <ProtectedRoute requiredPage="products">
                  <ProductsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="warehouses"
              element={
                <ProtectedRoute requiredPage="warehouses">
                  <WarehousesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="stockmovements"
              element={
                <ProtectedRoute requiredPage="stockmovements">
                  <StockMovementsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="suppliers"
              element={
                <ProtectedRoute requiredPage="suppliers">
                  <SuppliersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="orders"
              element={
                <ProtectedRoute requiredPage="orders">
                  <OrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="customers"
              element={
                <ProtectedRoute requiredPage="customers">
                  <CustomersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="reports"
              element={
                <ProtectedRoute requiredPage="reports">
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="users"
              element={
                <ProtectedRoute requiredPage="users">
                  <UsersPage />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
