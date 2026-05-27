export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-slate-800/50 bg-slate-950 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-black text-sm">B</div>
            <span className="font-black text-white text-lg">BIBI<span className="text-emerald-400">Sports</span></span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Tu tienda especializada en paletas de pádel de alta gama. Los mejores modelos de las mejores marcas.
          </p>
        </div>

        {/* Marcas */}
        <div>
          <h3 className="font-bold text-white text-sm mb-4 uppercase tracking-wider">Marcas</h3>
          <ul className="flex flex-col gap-2 text-sm text-slate-400">
            {['NOX', 'Bullpadel', 'Adidas', 'Siux', 'Head'].map((b) => (
              <li key={b} className="hover:text-emerald-400 transition-colors cursor-pointer">{b}</li>
            ))}
          </ul>
        </div>

        {/* Info */}
        <div>
          <h3 className="font-bold text-white text-sm mb-4 uppercase tracking-wider">Información</h3>
          <ul className="flex flex-col gap-2 text-sm text-slate-400">
            {['Catálogo 2026', 'Envíos', 'Devoluciones', 'Contacto', 'Sobre nosotros'].map((l) => (
              <li key={l} className="hover:text-emerald-400 transition-colors cursor-pointer">{l}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800/50 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-slate-500">© {year} BIBI Sports. Todos los derechos reservados.</p>
        <p className="text-xs text-slate-600">Hecho con ❤️ para los amantes del pádel.</p>
      </div>
    </footer>
  );
}
