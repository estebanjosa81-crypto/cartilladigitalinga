import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppProvider } from './context/AppContext';
import { Header, SideMenu, StatsModal } from './components/layout';
import { VistaInicio, VistaModulo, VistaComunidad, VistaAuth, VistaAdmin, VistaTraductor } from './views';
import { useNavigation } from './hooks/useNavigation';
import { useAuth } from './hooks/useAuth';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const AppContent: React.FC = () => {
  const { vistaActual } = useNavigation();
  const { mostrarModalStats, setMostrarModalStats } = useAuth();

  if (vistaActual === 'auth') return <VistaAuth />;
  if (vistaActual === 'admin') return <VistaAdmin />;

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Header />
      <SideMenu />
      <StatsModal
        isOpen={mostrarModalStats}
        onClose={() => setMostrarModalStats(false)}
      />

      {/* VistaInicio: sin container — controla su propio layout full-width */}
      {vistaActual === 'inicio' && <VistaInicio />}

      {/* Otras vistas: con container estándar */}
      {vistaActual !== 'inicio' && (
        <div className="container mx-auto px-4 py-6">
          {vistaActual === 'modulo'    && <VistaModulo />}
          {vistaActual === 'comunidad' && <VistaComunidad />}
          {vistaActual === 'traductor' && <VistaTraductor />}
        </div>
      )}
    </div>
  );
};

const CartillaIngaDigital: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </GoogleOAuthProvider>
  );
};

export default CartillaIngaDigital;
