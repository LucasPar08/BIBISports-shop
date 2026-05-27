import { useState } from 'react';
import { StoreProvider } from '../context/StoreContext';
import Header from './Header';
import Hero from './Hero';
import Catalog from './Catalog';
import CartDrawer from './CartDrawer';
import Footer from './Footer';
import ToastContainer from './ToastContainer';

function AppContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 font-sans">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCartOpen={() => setCartOpen(true)}
      />

      <main>
        <Hero />
        <Catalog globalSearch={searchQuery} />
      </main>

      <Footer />

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
