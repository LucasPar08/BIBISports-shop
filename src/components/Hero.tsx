import { useStore } from '../context/StoreContext';

export default function Hero() {
  const { products } = useStore();
  const inStock = products.filter((p) => p.stock > 0).length;
  const brands = [...new Set(products.map((p) => p.brand))].length;

  const scrollToCatalog = () =>
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section
      id="hero"
      className="relative min-h-[92vh] flex items-center overflow-hidden pt-16"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="max-w-3xl">
          {/* Label */}
          <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-semibold px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Stock disponible · Temporada 2026
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-none tracking-tight mb-6">
            Tu próxima<br />
            <span className="text-emerald-400">paleta</span> te<br />
            está esperando.
          </h1>

          <p className="text-slate-400 text-lg sm:text-xl mb-10 max-w-xl leading-relaxed">
            Las mejores marcas del mundo del pádel: NOX, Bullpadel, Adidas y más.
            Modelos 2025–2026 en stock, listos para que lleves tu juego al siguiente nivel.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={scrollToCatalog}
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-emerald-950/50 text-base"
            >
              Ver catálogo completo
            </button>
            <button
              onClick={scrollToCatalog}
              className="border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold px-8 py-4 rounded-2xl transition-all text-base"
            >
              Ver novedades 2026
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 mt-14 pt-8 border-t border-slate-800/60">
            {[
              { value: products.length.toString(), label: 'Paletas en catálogo' },
              { value: inStock.toString(), label: 'En stock ahora' },
              { value: brands.toString(), label: 'Marcas top' },
              { value: '2026', label: 'Temporada actual' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-black text-white">{stat.value}</p>
                <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
    </section>
  );
}
