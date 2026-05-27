export type PaddleType = 'diamante' | 'lágrima' | 'redonda';
export type PaddleLevel = 'principiante' | 'intermedio' | 'avanzado';

export interface Product {
  id: number;
  name: string;
  brand: string;
  year: number;
  price: number;
  type: PaddleType;
  level: PaddleLevel;
  stock: number;
  image: string;
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface ProductFormData {
  name: string;
  brand: string;
  year: number;
  price: number;
  type: PaddleType;
  level: PaddleLevel;
  stock: number;
  image: string;
  description: string;
}

export type ActivityAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'stock'
  | 'login'
  | 'logout'
  | 'import'
  | 'export'
  | 'bulk-delete'
  | 'bulk-stock'
  | 'duplicate';

export interface ActivityEntry {
  id: number;
  timestamp: number;
  action: ActivityAction;
  message: string;
  productId?: number;
}
