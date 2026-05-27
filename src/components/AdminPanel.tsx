import { useState, useEffect, useMemo, useRef, type FormEvent } from 'react';
import {
  X, Plus, Pencil, Trash2, Search, ShieldCheck, Package, CheckCircle, XCircle,
  TrendingUp, Eye, EyeOff, AlertTriangle, Copy, Download, Upload, History,
  LogOut, ArrowUp, ArrowDown, ArrowUpDown, ExternalLink, BarChart3, Home, Lock,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import type { Product, ProductFormData, PaddleType, PaddleLevel, ActivityEntry } from '../types';

const ADMIN_PASSWORD = 'bibi2024';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const LOW_STOCK_THRESHOLD = 3;

// ─── Helper components ───────────────────────────────────────────────────────

function StatCard({
  icon, label, value, color, sublabel,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  sublabel?: string;
}) {
  return (
    <div className={`bg-slate-900 border rounded-2xl p-5 flex items-center gap-4 ${color}`}>
      <div className="p-3 rounded-xl bg-slate-800">{icon}</div>
      <div className="min-w-0">
        <p className="text-2xl font-black text-white truncate">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5">{label}</p>
        {sublabel && <p className="text-[10px] text-slate-500 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
}

function formatTimeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return 'hace instantes';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} día${days > 1 ? 's' : ''}`;
}

const activityColors: Record<string, string> = {
  create: 'text-emerald-400 bg-emerald-950/40',
  update: 'text-blue-400 bg-blue-950/40',
  delete: 'text-red-400 bg-red-950/40',
  stock: 'text-amber-400 bg-amber-950/40',
  login: 'text-purple-400 bg-purple-950/40',
  logout: 'text-slate-400 bg-slate-800/60',
  import: 'text-cyan-400 bg-cyan-950/40',
  export: 'text-cyan-400 bg-cyan-950/40',
  'bulk-delete': 'text-red-400 bg-red-950/40',
  'bulk-stock': 'text-amber-400 bg-amber-950/40',
  duplicate: 'text-indigo-400 bg-indigo-950/40',
};

// ─── ProductForm modal ───────────────────────────────────────────────────────

const emptyForm: ProductFormData = {
  name: '', brand: '', year: 2026, price: 0,
  type: 'diamante', level: 'intermedio', stock: 0, image: '', description: '',
};

function ProductForm({
  initial, onSave, onCancel,
}: {
  initial?: Product;
  onSave: (data: ProductFormData) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<ProductFormData>(
    initial
      ? { name: initial.name, brand: initial.brand, year: initial.year, price: initial.price, type: initial.type, level: initial.level, stock: initial.stock, image: initial.image, description: initial.description }
      : emptyForm
  );
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});

  const set = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim() || form.name.length < 3) e.name = 'Mínimo 3 caracteres';
    if (!form.brand.trim()) e.brand = 'La marca es requerida';
    if (form.price <= 0) e.price = 'El precio debe ser mayor a 0';
    if (form.stock < 0) e.stock = 'No puede ser negativo';
    if (form.year < 2020 || form.year > 2030) e.year = 'Entre 2020 y 2030';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    if (validate()) onSave(form);
  };

  return (
    <div className="fixed inset-0 z-30 bg-black/70 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <h3 className="font-bold text-white text-lg">{initial ? 'Editar paleta' : 'Nueva paleta'}</h3>
          <button onClick={onCancel} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Nombre del modelo *</label>
            <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="ej. AT10 Luxury Genius 12K"
              className={`w-full bg-slate-800 border rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors ${errors.name ? 'border-red-500' : 'border-slate-700'}`} />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Marca *</label>
            <input type="text" value={form.brand} onChange={(e) => set('brand', e.target.value)} placeholder="ej. Nox, Bullpadel, Adidas…"
              className={`w-full bg-slate-800 border rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors ${errors.brand ? 'border-red-500' : 'border-slate-700'}`} />
            {errors.brand && <p className="text-red-400 text-xs mt-1">{errors.brand}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Año *</label>
            <input type="number" min={2020} max={2030} value={form.year} onChange={(e) => set('year', Number(e.target.value))}
              className={`w-full bg-slate-800 border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors ${errors.year ? 'border-red-500' : 'border-slate-700'}`} />
            {errors.year && <p className="text-red-400 text-xs mt-1">{errors.year}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Precio (USD) *</label>
            <input type="number" min={1} value={form.price} onChange={(e) => set('price', Number(e.target.value))}
              className={`w-full bg-slate-800 border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors ${errors.price ? 'border-red-500' : 'border-slate-700'}`} />
            {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Tipo *</label>
            <select value={form.type} onChange={(e) => set('type', e.target.value as PaddleType)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500">
              <option value="diamante">Diamante</option>
              <option value="lágrima">Lágrima</option>
              <option value="redonda">Redonda</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Nivel *</label>
            <select value={form.level} onChange={(e) => set('level', e.target.value as PaddleLevel)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500">
              <option value="principiante">Principiante</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Stock *</label>
            <input type="number" min={0} value={form.stock} onChange={(e) => set('stock', Number(e.target.value))}
              className={`w-full bg-slate-800 border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors ${errors.stock ? 'border-red-500' : 'border-slate-700'}`} />
            {errors.stock && <p className="text-red-400 text-xs mt-1">{errors.stock}</p>}
            <p className="text-xs text-slate-500 mt-1">0 = Sin stock automáticamente</p>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">URL de imagen</label>
            <input type="url" value={form.image} onChange={(e) => set('image', e.target.value)} placeholder="https://... (opcional)" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500" />
            {form.image && (
              <img src={form.image} alt="preview" className="mt-2 w-24 h-24 rounded-lg object-cover bg-slate-800 border border-slate-700" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            )}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Descripción</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} placeholder="Descripción breve del producto..." className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none" />
          </div>
          <div className="sm:col-span-2 flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl transition-all active:scale-95">
              {initial ? 'Guardar cambios' : 'Agregar paleta'}
            </button>
            <button type="button" onClick={onCancel} className="px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 rounded-xl transition-all">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Confirm dialog ──────────────────────────────────────────────────────────

function ConfirmDialog({
  title, message, confirmLabel, onConfirm, onCancel, danger = false,
}: {
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-30 bg-black/70 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className={`flex items-center justify-center w-12 h-12 rounded-2xl mx-auto mb-4 ${danger ? 'bg-red-950/50 border border-red-800' : 'bg-amber-950/50 border border-amber-800'}`}>
          {danger ? <Trash2 size={22} className="text-red-400" /> : <AlertTriangle size={22} className="text-amber-400" />}
        </div>
        <h3 className="text-lg font-bold text-white text-center mb-2">{title}</h3>
        <div className="text-slate-400 text-sm text-center mb-6">{message}</div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl transition-all">
            Cancelar
          </button>
          <button onClick={onConfirm} className={`flex-1 ${danger ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500'} text-white font-bold py-2.5 rounded-xl transition-all active:scale-95`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Activity feed sidebar ───────────────────────────────────────────────────

function ActivityFeed({ activities, onClear }: { activities: ActivityEntry[]; onClear: () => void }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden flex flex-col max-h-[600px]">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <History size={16} className="text-slate-400" />
          <h3 className="font-bold text-white text-sm">Actividad reciente</h3>
        </div>
        {activities.length > 0 && (
          <button onClick={() => setConfirmOpen(true)} className="text-xs text-slate-500 hover:text-red-400 transition-colors">
            Limpiar
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-center py-12 px-5 text-sm text-slate-500">
            <History size={28} className="mx-auto mb-2 text-slate-700" />
            Sin actividad registrada todavía.
          </div>
        ) : (
          <ul className="divide-y divide-slate-800/50">
            {activities.slice(0, 30).map((a) => (
              <li key={a.id} className="px-5 py-3 hover:bg-slate-800/30 transition-colors">
                <div className="flex items-start gap-2.5">
                  <span className={`shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${activityColors[a.action] ?? 'text-slate-400 bg-slate-800'}`}>
                    {a.action}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-200 leading-snug">{a.message}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{formatTimeAgo(a.timestamp)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {confirmOpen && (
        <ConfirmDialog
          title="¿Limpiar actividad?"
          message="Se eliminarán todos los registros de actividad. Esta acción no se puede deshacer."
          confirmLabel="Limpiar"
          danger
          onConfirm={() => { onClear(); setConfirmOpen(false); }}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
}

// ─── Brand chart ─────────────────────────────────────────────────────────────

function BrandChart({ products }: { products: Product[] }) {
  const brands = useMemo(() => {
    const map = new Map<string, { total: number; inStock: number }>();
    products.forEach((p) => {
      const entry = map.get(p.brand) ?? { total: 0, inStock: 0 };
      entry.total++;
      if (p.stock > 0) entry.inStock++;
      map.set(p.brand, entry);
    });
    return [...map.entries()].sort((a, b) => b[1].total - a[1].total);
  }, [products]);

  const max = Math.max(...brands.map((b) => b[1].total), 1);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={16} className="text-slate-400" />
        <h3 className="font-bold text-white text-sm">Distribución por marca</h3>
      </div>
      <div className="flex flex-col gap-3">
        {brands.map(([brand, data]) => (
          <div key={brand} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">{brand}</span>
              <span className="text-slate-500">
                {data.total} <span className="text-emerald-400">({data.inStock} en stock)</span>
              </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 transition-all"
                style={{ width: `${(data.inStock / max) * 100}%` }}
              />
              <div
                className="bg-red-500/60 transition-all"
                style={{ width: `${((data.total - data.inStock) / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main AdminPanel ─────────────────────────────────────────────────────────

type SortField = 'name' | 'brand' | 'price' | 'stock' | 'year';
type SortDir = 'asc' | 'desc';

export default function AdminPanel() {
  const {
    products, addProduct, updateProduct, deleteProduct,
    bulkDelete, bulkUpdateStock, duplicateProduct, replaceAllProducts,
    showToast, activities, logActivity, clearActivity,
  } = useStore();

  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [authError, setAuthError] = useState('');

  const [search, setSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [filterStock, setFilterStock] = useState<'all' | 'in' | 'out' | 'low'>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const [formTarget, setFormTarget] = useState<Product | null | 'new'>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkConfirm, setBulkConfirm] = useState<'delete' | 'restock' | 'oos' | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Auth init & session timeout ────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const session = sessionStorage.getItem('bibi_admin_session');
    if (session) {
      const expiresAt = Number(session);
      if (expiresAt > Date.now()) {
        setAuthenticated(true);
      } else {
        sessionStorage.removeItem('bibi_admin_session');
      }
    }
  }, []);

  const refreshSession = () => {
    if (!authenticated) return;
    const expiresAt = Date.now() + SESSION_TIMEOUT_MS;
    sessionStorage.setItem('bibi_admin_session', String(expiresAt));
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      handleLogout(true);
    }, SESSION_TIMEOUT_MS);
  };

  useEffect(() => {
    if (!authenticated) return;
    refreshSession();
    const events = ['mousemove', 'keydown', 'click'];
    const handler = () => refreshSession();
    events.forEach((ev) => window.addEventListener(ev, handler));
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handler));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated]);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setPassword('');
      sessionStorage.setItem('bibi_admin_session', String(Date.now() + SESSION_TIMEOUT_MS));
      logActivity('login', 'Inicio de sesión correcto');
    } else {
      setAuthError('Contraseña incorrecta.');
    }
  };

  const handleLogout = (auto = false) => {
    setAuthenticated(false);
    sessionStorage.removeItem('bibi_admin_session');
    logActivity('logout', auto ? 'Sesión cerrada por inactividad' : 'Sesión cerrada manualmente');
  };

  // ── CRUD handlers ──────────────────────────────────────────────────────────
  const handleSave = (data: ProductFormData) => {
    const image = data.image || `https://placehold.co/400x400/1e293b/94a3b8?text=${encodeURIComponent(data.brand)}`;
    if (formTarget === 'new') {
      const created = addProduct({ ...data, image });
      logActivity('create', `Creada paleta "${created.name}" (${created.brand})`, created.id);
      showToast(`"${data.name}" agregada correctamente`, 'success');
    } else if (formTarget) {
      const updated = { ...(formTarget as Product), ...data, image };
      updateProduct(updated);
      logActivity('update', `Editada paleta "${updated.name}"`, updated.id);
      showToast(`"${data.name}" actualizada correctamente`, 'info');
    }
    setFormTarget(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteProduct(deleteTarget.id);
    logActivity('delete', `Eliminada paleta "${deleteTarget.name}"`, deleteTarget.id);
    showToast(`"${deleteTarget.name}" eliminada`, 'error');
    setDeleteTarget(null);
  };

  const handleDuplicate = (id: number) => {
    const copy = duplicateProduct(id);
    if (copy) {
      logActivity('duplicate', `Duplicada paleta "${copy.name}"`, copy.id);
      showToast(`"${copy.name}" creada`, 'success');
    }
  };

  // ── Bulk actions ───────────────────────────────────────────────────────────
  const performBulk = () => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    if (bulkConfirm === 'delete') {
      bulkDelete(ids);
      logActivity('bulk-delete', `Eliminadas ${ids.length} paletas`);
      showToast(`${ids.length} paletas eliminadas`, 'error');
    } else if (bulkConfirm === 'oos') {
      bulkUpdateStock(ids, 0);
      logActivity('bulk-stock', `${ids.length} paletas marcadas como sin stock`);
      showToast(`${ids.length} paletas marcadas como sin stock`, 'info');
    } else if (bulkConfirm === 'restock') {
      bulkUpdateStock(ids, 10);
      logActivity('bulk-stock', `${ids.length} paletas restockeadas a 10 unidades`);
      showToast(`${ids.length} paletas restockeadas`, 'success');
    }
    setSelectedIds(new Set());
    setBulkConfirm(null);
  };

  // ── Export / Import ────────────────────────────────────────────────────────
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(products, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bibi-products-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    logActivity('export', `Exportadas ${products.length} paletas a JSON`);
    showToast('Catálogo exportado correctamente', 'success');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(data)) throw new Error('Formato inválido');
        replaceAllProducts(data as Product[]);
        logActivity('import', `Importadas ${data.length} paletas desde JSON`);
        showToast(`${data.length} paletas importadas`, 'success');
      } catch (err) {
        showToast('Archivo JSON inválido', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ── Filtering & sorting ────────────────────────────────────────────────────
  const displayed = useMemo(() => {
    let r = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
    }
    if (filterBrand !== 'all') r = r.filter((p) => p.brand === filterBrand);
    if (filterStock === 'in') r = r.filter((p) => p.stock > LOW_STOCK_THRESHOLD);
    else if (filterStock === 'low') r = r.filter((p) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD);
    else if (filterStock === 'out') r = r.filter((p) => p.stock === 0);

    r.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name' || sortField === 'brand') cmp = a[sortField].localeCompare(b[sortField]);
      else cmp = a[sortField] - b[sortField];
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return r;
  }, [products, search, filterBrand, filterStock, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const sortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown size={11} className="text-slate-600" />;
    return sortDir === 'asc' ? <ArrowUp size={11} className="text-emerald-400" /> : <ArrowDown size={11} className="text-emerald-400" />;
  };

  // ── Aggregates ─────────────────────────────────────────────────────────────
  const inStockCount = products.filter((p) => p.stock > 0).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD);
  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);
  const totalUnits = products.reduce((s, p) => s + p.stock, 0);
  const avgPrice = products.length > 0 ? Math.round(products.reduce((s, p) => s + p.price, 0) / products.length) : 0;
  const allBrands = useMemo(() => [...new Set(products.map((p) => p.brand))].sort(), [products]);

  const allDisplayedSelected = displayed.length > 0 && displayed.every((p) => selectedIds.has(p.id));
  const toggleSelectAll = () => {
    if (allDisplayedSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(displayed.map((p) => p.id)));
  };
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── LOGIN SCREEN ───────────────────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="absolute top-4 left-4">
          <a href="/" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
            <Home size={14} /> Volver a la tienda
          </a>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-emerald-600/20 border border-emerald-700 p-4 rounded-2xl mb-4">
              <Lock size={28} className="text-emerald-400" />
            </div>
            <h2 className="text-xl font-black text-white">Acceso restringido</h2>
            <p className="text-slate-400 text-sm text-center mt-1">
              Esta área es solo para administradores autorizados.
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setAuthError(''); }}
                placeholder="Contraseña"
                className={`w-full bg-slate-800 border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 pr-10 ${authError ? 'border-red-500' : 'border-slate-700'}`}
                autoFocus
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {authError && <p className="text-red-400 text-xs text-center">{authError}</p>}
            <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl transition-all active:scale-95">
              Ingresar
            </button>
          </form>

          <p className="text-[10px] text-slate-600 text-center mt-6">
            Si no sos administrador, volvé a la página principal.
          </p>
        </div>
      </div>
    );
  }

  // ── DASHBOARD ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600/20 border border-emerald-700 p-2 rounded-xl">
            <ShieldCheck size={18} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="font-black text-white text-lg">Panel Administrador</h1>
            <p className="text-xs text-slate-400">BIBI Sports · Gestión de inventario</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href="/" className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-3 py-2 rounded-xl transition-all">
            <Home size={13} /> Ver tienda
          </a>
          <button onClick={() => handleLogout(false)} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-3 py-2 rounded-xl transition-all">
            <LogOut size={13} /> Cerrar sesión
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard icon={<Package size={20} className="text-blue-400" />} label="Total productos" value={products.length} color="border-blue-900/40" />
          <StatCard icon={<CheckCircle size={20} className="text-emerald-400" />} label="En stock" value={inStockCount} color="border-emerald-900/40" />
          <StatCard icon={<XCircle size={20} className="text-red-400" />} label="Sin stock" value={outOfStockCount} color="border-red-900/40" />
          <StatCard icon={<TrendingUp size={20} className="text-amber-400" />} label="Valor inventario" value={`USD ${totalValue.toLocaleString()}`} color="border-amber-900/40" sublabel={`${totalUnits} unidades`} />
          <StatCard icon={<BarChart3 size={20} className="text-purple-400" />} label="Precio promedio" value={`USD ${avgPrice}`} color="border-purple-900/40" sublabel={`${allBrands.length} marcas`} />
        </div>

        {/* Low stock alert */}
        {lowStockProducts.length > 0 && (
          <div className="bg-amber-950/30 border border-amber-800/50 rounded-2xl p-5 flex items-start gap-4">
            <AlertTriangle size={22} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-amber-200 text-sm mb-1">
                Stock bajo: {lowStockProducts.length} producto{lowStockProducts.length === 1 ? '' : 's'} con menos de {LOW_STOCK_THRESHOLD + 1} unidades
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {lowStockProducts.slice(0, 6).map((p) => (
                  <span key={p.id} className="text-xs bg-amber-900/40 text-amber-200 border border-amber-800/60 px-2.5 py-1 rounded-full">
                    {p.brand} {p.name} <span className="text-amber-400 font-bold">({p.stock})</span>
                  </span>
                ))}
                {lowStockProducts.length > 6 && (
                  <button onClick={() => setFilterStock('low')} className="text-xs text-amber-300 hover:text-amber-100 underline">
                    Ver todos →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Top actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" placeholder="Buscar producto..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500" />
          </div>

          <select value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500">
            <option value="all">Todas las marcas</option>
            {allBrands.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>

          <select value={filterStock} onChange={(e) => setFilterStock(e.target.value as typeof filterStock)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500">
            <option value="all">Todo el stock</option>
            <option value="in">En stock</option>
            <option value="low">Stock bajo (1–{LOW_STOCK_THRESHOLD})</option>
            <option value="out">Sin stock</option>
          </select>

          <button onClick={() => setFormTarget('new')} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-5 py-2.5 rounded-xl transition-all active:scale-95 text-sm">
            <Plus size={16} /> Nueva
          </button>

          <button onClick={handleExport} className="flex items-center gap-1.5 text-sm font-semibold border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white px-3 py-2.5 rounded-xl transition-all">
            <Download size={14} /> Exportar
          </button>

          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 text-sm font-semibold border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white px-3 py-2.5 rounded-xl transition-all">
            <Upload size={14} /> Importar
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
        </div>

        {/* Bulk action bar */}
        {selectedIds.size > 0 && (
          <div className="bg-emerald-950/40 border border-emerald-800 rounded-2xl px-5 py-3 flex flex-wrap items-center justify-between gap-3 animate-slide-in-up">
            <p className="text-sm text-emerald-200">
              <span className="font-bold">{selectedIds.size}</span> {selectedIds.size === 1 ? 'paleta seleccionada' : 'paletas seleccionadas'}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => setBulkConfirm('restock')} className="text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg transition-colors">
                Restockear (10)
              </button>
              <button onClick={() => setBulkConfirm('oos')} className="text-xs font-semibold bg-amber-700 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg transition-colors">
                Marcar sin stock
              </button>
              <button onClick={() => setBulkConfirm('delete')} className="text-xs font-semibold bg-red-700 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-colors">
                Eliminar
              </button>
              <button onClick={() => setSelectedIds(new Set())} className="text-xs text-emerald-200 hover:text-white">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Products table */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="hidden lg:grid grid-cols-[40px_2fr_1fr_100px_120px_100px_110px] gap-3 px-5 py-3 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <input type="checkbox" checked={allDisplayedSelected} onChange={toggleSelectAll} className="accent-emerald-500" />
              <button onClick={() => toggleSort('name')} className="flex items-center gap-1 text-left hover:text-white transition-colors">
                Producto {sortIcon('name')}
              </button>
              <button onClick={() => toggleSort('brand')} className="flex items-center gap-1 text-left hover:text-white transition-colors">
                Marca {sortIcon('brand')}
              </button>
              <button onClick={() => toggleSort('price')} className="flex items-center gap-1 text-left hover:text-white transition-colors">
                Precio {sortIcon('price')}
              </button>
              <button onClick={() => toggleSort('stock')} className="flex items-center gap-1 text-left hover:text-white transition-colors">
                Stock {sortIcon('stock')}
              </button>
              <span>Estado</span>
              <span>Acciones</span>
            </div>

            {displayed.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-sm">
                <Package size={32} className="mx-auto mb-3 text-slate-700" />
                No se encontraron productos con esos filtros.
              </div>
            ) : (
              <div className="max-h-[600px] overflow-y-auto">
                {displayed.map((p, i) => {
                  const isLow = p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD;
                  return (
                    <div key={p.id} className={`flex flex-col lg:grid lg:grid-cols-[40px_2fr_1fr_100px_120px_100px_110px] gap-3 px-5 py-3 items-start lg:items-center ${i !== displayed.length - 1 ? 'border-b border-slate-800/50' : ''} hover:bg-slate-800/30 transition-colors ${selectedIds.has(p.id) ? 'bg-emerald-950/20' : ''}`}>
                      <input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => toggleSelect(p.id)} className="accent-emerald-500" />
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover bg-slate-800 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-slate-400">{p.year} · {p.type} · {p.level}</p>
                          <p className="text-sm font-semibold text-white leading-snug truncate">{p.name}</p>
                        </div>
                      </div>
                      <span className="text-sm text-slate-300">{p.brand}</span>
                      <span className="text-sm font-bold text-emerald-400">USD {p.price}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateProduct({ ...p, stock: Math.max(0, p.stock - 1) })} className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white">−</button>
                        <input type="number" min={0} value={p.stock}
                          onChange={(e) => updateProduct({ ...p, stock: Math.max(0, Number(e.target.value)) })}
                          className="w-14 bg-slate-800 border border-slate-700 rounded-md px-1 py-1 text-sm text-white text-center focus:outline-none focus:border-emerald-500" />
                        <button onClick={() => updateProduct({ ...p, stock: p.stock + 1 })} className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white">+</button>
                      </div>
                      <div>
                        {p.stock === 0 ? (
                          <span className="flex items-center gap-1 text-xs text-red-400 bg-red-950/50 border border-red-800 px-2 py-1 rounded-full w-fit">
                            <XCircle size={11} /> Sin stock
                          </span>
                        ) : isLow ? (
                          <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-950/50 border border-amber-800 px-2 py-1 rounded-full w-fit">
                            <AlertTriangle size={11} /> Bajo
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-800 px-2 py-1 rounded-full w-fit">
                            <CheckCircle size={11} /> En stock
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setFormTarget(p)} title="Editar" className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/30 rounded-lg transition-all">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleDuplicate(p.id)} title="Duplicar" className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-950/30 rounded-lg transition-all">
                          <Copy size={13} />
                        </button>
                        <a href={`/#catalog`} title="Ver en tienda" className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-950/30 rounded-lg transition-all">
                          <ExternalLink size={13} />
                        </a>
                        <button onClick={() => setDeleteTarget(p)} title="Eliminar" className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer count */}
            <div className="border-t border-slate-800 px-5 py-3 text-xs text-slate-500 flex items-center justify-between">
              <span>Mostrando {displayed.length} de {products.length} productos</span>
            </div>
          </div>

          {/* Side panel: Brand chart + Activity */}
          <div className="flex flex-col gap-6">
            <BrandChart products={products} />
            <ActivityFeed activities={activities} onClear={clearActivity} />
          </div>
        </div>
      </div>

      {/* Modals */}
      {formTarget && (
        <ProductForm
          initial={formTarget === 'new' ? undefined : formTarget}
          onSave={handleSave}
          onCancel={() => setFormTarget(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="¿Eliminar paleta?"
          message={<>Se eliminará <span className="text-white font-semibold">"{deleteTarget.name}"</span>. Esta acción no se puede deshacer.</>}
          confirmLabel="Eliminar"
          danger
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {bulkConfirm && (
        <ConfirmDialog
          title={
            bulkConfirm === 'delete' ? '¿Eliminar paletas?' :
            bulkConfirm === 'oos' ? '¿Marcar sin stock?' :
            '¿Restockear paletas?'
          }
          message={
            bulkConfirm === 'delete'
              ? <>Se eliminarán <span className="text-white font-semibold">{selectedIds.size}</span> paletas. Esta acción no se puede deshacer.</>
              : bulkConfirm === 'oos'
                ? <>Se marcarán <span className="text-white font-semibold">{selectedIds.size}</span> paletas como sin stock (stock = 0).</>
                : <>Se restockearán <span className="text-white font-semibold">{selectedIds.size}</span> paletas a 10 unidades.</>
          }
          confirmLabel="Confirmar"
          danger={bulkConfirm === 'delete'}
          onConfirm={performBulk}
          onCancel={() => setBulkConfirm(null)}
        />
      )}
    </div>
  );
}
