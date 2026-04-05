export interface Product {
  id: string | number
  name: string
  sku: string
  category: string
  quantity: number | string
  minStock?: number | string
  price: number | string
}

export interface ApiListResponse<T> {
  success: boolean
  data?: T
  message?: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address?: string
  createdAt: string
}

export interface OrderRow {
  id: string
  customerName: string
  productName: string
  quantity: string | number
  totalAmount: string | number
  status: string
  date: string
}

export interface WarehouseRow {
  id: string
  name: string
  location: string
  capacity: string | number
  isActive: boolean
}

export interface SupplierRow {
  id: string
  name: string
  email: string
  phone: string
  isActive: boolean
}

export interface MovementRow {
  id: string
  productName: string
  warehouseName: string
  type: 'IN' | 'OUT'
  quantity: string | number
  reason?: string
  date: string
}
