import { useState } from 'react';
import { ShoppingCart, Search, Menu, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  onCartOpen: () => void;
}

export default function Header({ searchQuery, onSearchChange, onCartOpen }: HeaderProps) {
  const { cartItemCount } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        <button onClick={() => scrollTo('hero')} className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-black text-sm">
            B
          </div>
          <span className="font-black text-white tracking-tight text-lg">
            BIBI<span className="text-emerald-400">Sports</span>
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-6 ml-6">
          {[{ label: 'Inicio', id: 'hero' }, { label: 'Catálogo', id: 'catalog' }].map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="text-sm text-slate-400 hover:text-white transition-colors font-medium"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 max-w-sm mx-auto relative hidden sm:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar paletas..."
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              scrollTo('catalog');
            }}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={onCartOpen}
            className="relative flex items-center gap-1.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl transition-all active:scale-95"
          >
            <ShoppingCart size={16} />
            <span className="hidden sm:inline">Carrito</span>
            {cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-800 bg-slate-950/95 px-4 py-4 flex flex-col gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar paletas..."
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                scrollTo('catalog');
                setMobileMenuOpen(false);
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button onClick={() => scrollTo('hero')} className="text-left text-sm text-slate-300 hover:text-white py-1">
            Inicio
          </button>
          <button onClick={() => scrollTo('catalog')} className="text-left text-sm text-slate-300 hover:text-white py-1">
            Catálogo
          </button>
        </div>
      )}
    </header>
  );
}
