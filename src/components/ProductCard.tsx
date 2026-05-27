import { ShoppingCart, CheckCircle, XCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import type { Product } from '../types';

const typeLabel: Record<string, string> = {
  diamante: '♦ Diamante',
  lágrima: '💧 Lágrima',
  redonda: '⭕ Redonda',
};

const levelColors: Record<string, string> = {
  principiante: 'bg-green-900/50 text-green-400 border-green-700',
  intermedio: 'bg-yellow-900/50 text-yellow-400 border-yellow-700',
  avanzado: 'bg-red-900/50 text-red-400 border-red-700',
};

const brandColors: Record<string, string> = {
  Nox: 'bg-amber-900/40 text-amber-400',
  Bullpadel: 'bg-blue-900/40 text-blue-400',
  Adidas: 'bg-slate-700/60 text-slate-300',
  Siux: 'bg-red-900/40 text-red-400',
  Head: 'bg-orange-900/40 text-orange-400',
};

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, showToast } = useStore();
  const inStock = product.stock > 0;

  const handleAddToCart = () => {
    addToCart(product);
    showToast(`${product.brand} ${product.name} agregada al carrito`, 'success');
  };

  return (
    <div className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-950/50 transition-all duration-300 animate-slide-in-up">
      {/* Image */}
      <div className="relative overflow-hidden bg-slate-800 aspect-square">
        <img
          src={product.image}
          alt={`${product.brand} ${product.name}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Stock badge */}
        <div className={`absolute top-3 right-3 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${inStock ? 'bg-emerald-950/90 text-emerald-400 border border-emerald-700' : 'bg-red-950/90 text-red-400 border border-red-800'}`}>
          {inStock
            ? <><CheckCircle size={11} /> En stock</>
            : <><XCircle size={11} /> Sin stock</>
          }
        </div>
        {/* Brand badge */}
        <div className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${brandColors[product.brand] ?? 'bg-slate-700 text-slate-300'}`}>
          {product.brand.toUpperCase()}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <p className="text-xs text-slate-500 mb-0.5">{product.year}</p>
          <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2">
            {product.name}
          </h3>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
            {typeLabel[product.type]}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-md border capitalize ${levelColors[product.level]}`}>
            {product.level}
          </span>
        </div>

        {/* Stock qty */}
        {inStock && (
          <p className="text-xs text-slate-500">
            {product.stock} {product.stock === 1 ? 'unidad' : 'unidades'} disponibles
          </p>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-800">
          <span className="text-lg font-bold text-emerald-400">
            USD {product.price.toLocaleString()}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-md hover:shadow-emerald-900/50"
          >
            <ShoppingCart size={13} />
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
