import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { Product, CartItem, Toast, ActivityEntry, ActivityAction } from '../types';
import { initialProducts } from '../data/products';

// ─── State & Actions ─────────────────────────────────────────────────────────

interface State {
  products: Product[];
  cart: CartItem[];
  toasts: Toast[];
  activities: ActivityEntry[];
}

type Action =
  | { type: 'SET_PRODUCTS'; products: Product[] }
  | { type: 'ADD_PRODUCT'; product: Product }
  | { type: 'UPDATE_PRODUCT'; product: Product }
  | { type: 'DELETE_PRODUCT'; id: number }
  | { type: 'BULK_DELETE'; ids: number[] }
  | { type: 'BULK_UPDATE_STOCK'; ids: number[]; stock: number }
  | { type: 'ADD_TO_CART'; product: Product }
  | { type: 'REMOVE_FROM_CART'; productId: number }
  | { type: 'UPDATE_CART_QTY'; productId: number; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'ADD_TOAST'; toast: Toast }
  | { type: 'REMOVE_TOAST'; id: number }
  | { type: 'LOG_ACTIVITY'; entry: ActivityEntry }
  | { type: 'CLEAR_ACTIVITY' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, products: action.products };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.product] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map((p) => (p.id === action.product.id ? action.product : p)),
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.id),
        cart: state.cart.filter((item) => item.product.id !== action.id),
      };
    case 'BULK_DELETE':
      return {
        ...state,
        products: state.products.filter((p) => !action.ids.includes(p.id)),
        cart: state.cart.filter((item) => !action.ids.includes(item.product.id)),
      };
    case 'BULK_UPDATE_STOCK':
      return {
        ...state,
        products: state.products.map((p) =>
          action.ids.includes(p.id) ? { ...p, stock: action.stock } : p
        ),
      };
    case 'ADD_TO_CART': {
      const existing = state.cart.find((i) => i.product.id === action.product.id);
      if (existing) {
        return {
          ...state,
          cart: state.cart.map((i) =>
            i.product.id === action.product.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { ...state, cart: [...state.cart, { product: action.product, quantity: 1 }] };
    }
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter((i) => i.product.id !== action.productId) };
    case 'UPDATE_CART_QTY':
      if (action.quantity <= 0) {
        return { ...state, cart: state.cart.filter((i) => i.product.id !== action.productId) };
      }
      return {
        ...state,
        cart: state.cart.map((i) =>
          i.product.id === action.productId ? { ...i, quantity: action.quantity } : i
        ),
      };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.toast] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    case 'LOG_ACTIVITY':
      return { ...state, activities: [action.entry, ...state.activities].slice(0, 100) };
    case 'CLEAR_ACTIVITY':
      return { ...state, activities: [] };
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  toasts: Toast[];
  activities: ActivityEntry[];
  cartItemCount: number;
  cartTotal: number;
  addProduct: (data: Omit<Product, 'id'>) => Product;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: number) => void;
  bulkDelete: (ids: number[]) => void;
  bulkUpdateStock: (ids: number[], stock: number) => void;
  duplicateProduct: (id: number) => Product | null;
  replaceAllProducts: (products: Product[]) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateCartQty: (productId: number, quantity: number) => void;
  clearCart: () => void;
  showToast: (message: string, type: Toast['type']) => void;
  dismissToast: (id: number) => void;
  logActivity: (action: ActivityAction, message: string, productId?: number) => void;
  clearActivity: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    products: loadFromStorage('bibi_products', initialProducts),
    cart: loadFromStorage('bibi_cart', []),
    toasts: [],
    activities: loadFromStorage<ActivityEntry[]>('bibi_activities', []),
  }));

  useEffect(() => {
    localStorage.setItem('bibi_products', JSON.stringify(state.products));
  }, [state.products]);

  useEffect(() => {
    localStorage.setItem('bibi_cart', JSON.stringify(state.cart));
  }, [state.cart]);

  useEffect(() => {
    localStorage.setItem('bibi_activities', JSON.stringify(state.activities));
  }, [state.activities]);

  const logActivity = useCallback((action: ActivityAction, message: string, productId?: number) => {
    const entry: ActivityEntry = {
      id: Date.now() + Math.random(),
      timestamp: Date.now(),
      action,
      message,
      productId,
    };
    dispatch({ type: 'LOG_ACTIVITY', entry });
  }, []);

  const clearActivity = useCallback(() => {
    dispatch({ type: 'CLEAR_ACTIVITY' });
  }, []);

  const addProduct = useCallback(
    (data: Omit<Product, 'id'>) => {
      const id = state.products.length > 0 ? Math.max(...state.products.map((p) => p.id)) + 1 : 1;
      const product = { ...data, id };
      dispatch({ type: 'ADD_PRODUCT', product });
      return product;
    },
    [state.products]
  );

  const updateProduct = useCallback((product: Product) => {
    dispatch({ type: 'UPDATE_PRODUCT', product });
  }, []);

  const deleteProduct = useCallback((id: number) => {
    dispatch({ type: 'DELETE_PRODUCT', id });
  }, []);

  const bulkDelete = useCallback((ids: number[]) => {
    dispatch({ type: 'BULK_DELETE', ids });
  }, []);

  const bulkUpdateStock = useCallback((ids: number[], stock: number) => {
    dispatch({ type: 'BULK_UPDATE_STOCK', ids, stock });
  }, []);

  const duplicateProduct = useCallback(
    (id: number) => {
      const source = state.products.find((p) => p.id === id);
      if (!source) return null;
      const newId =
        state.products.length > 0 ? Math.max(...state.products.map((p) => p.id)) + 1 : 1;
      const copy: Product = { ...source, id: newId, name: `${source.name} (copia)` };
      dispatch({ type: 'ADD_PRODUCT', product: copy });
      return copy;
    },
    [state.products]
  );

  const replaceAllProducts = useCallback((products: Product[]) => {
    dispatch({ type: 'SET_PRODUCTS', products });
  }, []);

  const addToCart = useCallback((product: Product) => {
    dispatch({ type: 'ADD_TO_CART', product });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    dispatch({ type: 'REMOVE_FROM_CART', productId });
  }, []);

  const updateCartQty = useCallback((productId: number, quantity: number) => {
    dispatch({ type: 'UPDATE_CART_QTY', productId, quantity });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const showToast = useCallback((message: string, type: Toast['type']) => {
    const id = Date.now() + Math.random();
    dispatch({ type: 'ADD_TOAST', toast: { id, message, type } });
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', id }), 3500);
  }, []);

  const dismissToast = useCallback((id: number) => {
    dispatch({ type: 'REMOVE_TOAST', id });
  }, []);

  const cartItemCount = state.cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = state.cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        products: state.products,
        cart: state.cart,
        toasts: state.toasts,
        activities: state.activities,
        cartItemCount,
        cartTotal,
        addProduct,
        updateProduct,
        deleteProduct,
        bulkDelete,
        bulkUpdateStock,
        duplicateProduct,
        replaceAllProducts,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        showToast,
        dismissToast,
        logActivity,
        clearActivity,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
