import { useState, useMemo } from 'react';
import { Filter, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductCard from './ProductCard';

interface Filters {
  brands: string[];
  types: string[];
  levels: string[];
  priceMin: string;
  priceMax: string;
  availability: 'all' | 'in-stock' | 'out-of-stock';
  sortBy: 'name' | 'price-asc' | 'price-desc' | 'brand';
}

const defaultFilters: Filters = {
  brands: [],
  types: [],
  levels: [],
  priceMin: '',
  priceMax: '',
  availability: 'all',
  sortBy: 'name',
};

interface CatalogProps {
  globalSearch: string;
}

export default function Catalog({ globalSearch }: CatalogProps) {
  const { products } = useStore();
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const allBrands = [...new Set(products.map((p) => p.brand))].sort();
  const allTypes = ['diamante', 'lágrima', 'redonda'];
  const allLevels = ['principiante', 'intermedio', 'avanzado'];

  const toggle = <K extends keyof Filters>(key: K, value: string) => {
    setFilters((prev) => {
      const arr = prev[key] as string[];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  const filtered = useMemo(() => {
    let result = [...products];

    if (globalSearch.trim()) {
      const q = globalSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (filters.brands.length > 0) result = result.filter((p) => filters.brands.includes(p.brand));
    if (filters.types.length > 0) result = result.filter((p) => filters.types.includes(p.type));
    if (filters.levels.length > 0) result = result.filter((p) => filters.levels.includes(p.level));
    if (filters.priceMin) result = result.filter((p) => p.price >= Number(filters.priceMin));
    if (filters.priceMax) result = result.filter((p) => p.price <= Number(filters.priceMax));
    if (filters.availability === 'in-stock') result = result.filter((p) => p.stock > 0);
    if (filters.availability === 'out-of-stock') result = result.filter((p) => p.stock === 0);

    result.sort((a, b) => {
      if (filters.sortBy === 'price-asc') return a.price - b.price;
      if (filters.sortBy === 'price-desc') return b.price - a.price;
      if (filters.sortBy === 'brand') return a.brand.localeCompare(b.brand);
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [products, globalSearch, filters]);

  const activeCount =
    filters.brands.length +
    filters.types.length +
    filters.levels.length +
    (filters.priceMin ? 1 : 0) +
    (filters.priceMax ? 1 : 0) +
    (filters.availability !== 'all' ? 1 : 0);

  const resetFilters = () => setFilters(defaultFilters);

  return (
    <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      {/* Section header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Catálogo</h2>
          <p className="text-slate-400 mt-1">
            {filtered.length} {filtered.length === 1 ? 'paleta encontrada' : 'paletas encontradas'}
            {globalSearch && <> para <span className="text-emerald-400">"{globalSearch}"</span></>}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort */}
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value as Filters['sortBy'] }))}
            className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="name">Nombre A–Z</option>
            <option value="brand">Marca</option>
            <option value="price-asc">Precio ↑</option>
            <option value="price-desc">Precio ↓</option>
          </select>

          {/* Filter toggle */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border transition-all ${
              filtersOpen || activeCount > 0
                ? 'bg-emerald-600/20 border-emerald-600 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
          >
            <Filter size={14} />
            Filtros
            {activeCount > 0 && (
              <span className="bg-emerald-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {activeCount}
              </span>
            )}
            {filtersOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {activeCount > 0 && (
            <button onClick={resetFilters} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
              <RotateCcw size={13} /> Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Filter panel */}
      {filtersOpen && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 mb-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 animate-slide-in-up">
          {/* Brand */}
          <FilterGroup label="Marca">
            {allBrands.map((b) => (
              <CheckChip
                key={b}
                label={b}
                checked={filters.brands.includes(b)}
                onChange={() => toggle('brands', b)}
              />
            ))}
          </FilterGroup>

          {/* Type */}
          <FilterGroup label="Tipo">
            {allTypes.map((t) => (
              <CheckChip
                key={t}
                label={t}
                checked={filters.types.includes(t)}
                onChange={() => toggle('types', t)}
              />
            ))}
          </FilterGroup>

          {/* Level */}
          <FilterGroup label="Nivel">
            {allLevels.map((l) => (
              <CheckChip
                key={l}
                label={l}
                checked={filters.levels.includes(l)}
                onChange={() => toggle('levels', l)}
              />
            ))}
          </FilterGroup>

          {/* Price */}
          <FilterGroup label="Precio (USD)">
            <input
              type="number"
              placeholder="Mín"
              value={filters.priceMin}
              onChange={(e) => setFilters((f) => ({ ...f, priceMin: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <input
              type="number"
              placeholder="Máx"
              value={filters.priceMax}
              onChange={(e) => setFilters((f) => ({ ...f, priceMax: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 mt-1.5"
            />
          </FilterGroup>

          {/* Availability */}
          <FilterGroup label="Disponibilidad">
            {[
              { value: 'all', label: 'Todos' },
              { value: 'in-stock', label: 'En stock' },
              { value: 'out-of-stock', label: 'Sin stock' },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="availability"
                  value={opt.value}
                  checked={filters.availability === opt.value}
                  onChange={() => setFilters((f) => ({ ...f, availability: opt.value as Filters['availability'] }))}
                  className="accent-emerald-500"
                />
                <span className="text-xs text-slate-300">{opt.label}</span>
              </label>
            ))}
          </FilterGroup>
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-4xl mb-4">🏓</p>
          <h3 className="text-xl font-bold text-white mb-2">No hay paletas con esos filtros</h3>
          <p className="text-slate-400 mb-6">Probá ajustando los filtros o limpiando la búsqueda.</p>
          <button onClick={resetFilters} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-xl transition-all">
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      {children}
    </div>
  );
}

function CheckChip({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} className="accent-emerald-500 w-3.5 h-3.5" />
      <span className="text-xs text-slate-300 capitalize">{label}</span>
    </label>
  );
}
