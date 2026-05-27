import { X, Plus, Minus, Trash2, ShoppingCart, CreditCard } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, cartTotal, cartItemCount, removeFromCart, updateCartQty, clearCart, showToast } = useStore();

  const handleCheckout = () => {
    showToast('¡Gracias por tu compra! Te contactaremos pronto.', 'success');
    clearCart();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-slate-900 border-l border-slate-800 flex flex-col animate-slide-in-right shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-emerald-400" />
            <h2 className="font-bold text-white text-lg">Carrito</h2>
            {cartItemCount > 0 && (
              <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {cartItemCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4 px-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <ShoppingCart size={48} className="text-slate-700 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Tu carrito está vacío</h3>
              <p className="text-slate-400 text-sm">Agregá paletas desde el catálogo.</p>
              <button
                onClick={onClose}
                className="mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all"
              >
                Ver catálogo
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-3 bg-slate-800/60 rounded-xl p-3 border border-slate-700/50"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-lg object-cover shrink-0 bg-slate-800"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400">{item.product.brand}</p>
                    <p className="text-sm font-semibold text-white truncate">{item.product.name}</p>
                    <p className="text-emerald-400 font-bold text-sm mt-0.5">
                      USD {(item.product.price * item.quantity).toLocaleString()}
                    </p>
                    {/* Qty controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-colors"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="text-sm font-semibold text-white w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-colors"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors p-1 self-start"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-slate-800 px-6 py-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Subtotal ({cartItemCount} {cartItemCount === 1 ? 'artículo' : 'artículos'})</span>
              <span className="text-2xl font-black text-white">USD {cartTotal.toLocaleString()}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 text-sm"
            >
              <CreditCard size={16} />
              Proceder al pago
            </button>
            <button
              onClick={clearCart}
              className="text-xs text-slate-500 hover:text-red-400 transition-colors text-center"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </>
  );
}
