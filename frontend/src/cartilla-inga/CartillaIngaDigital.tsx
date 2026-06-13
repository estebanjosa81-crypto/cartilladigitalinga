import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppProvider } from './context/AppContext';
import { Header, SideMenu, StatsModal } from './components/layout';
import { VistaInicio, VistaModulo, VistaComunidad, VistaAuth, VistaAdmin, VistaTraductor } from './views';
import { useNavigation } from './hooks/useNavigation';
import { useAuth } from './hooks/useAuth';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

/**
 * Componente interno que renderiza las vistas según el estado de navegación.
 * Separado del componente principal para poder usar el hook useNavigation.
 */
const AppContent: React.FC = () => {
  const { vistaActual } = useNavigation();
  const { mostrarModalStats, setMostrarModalStats } = useAuth();

  if (vistaActual === 'auth') return <VistaAuth />;
  if (vistaActual === 'admin') return <VistaAdmin />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-amber-50">
      <Header />
      <SideMenu />
      <StatsModal
        isOpen={mostrarModalStats}
        onClose={() => setMostrarModalStats(false)}
      />
      <div className="container mx-auto px-4 py-6">
        {vistaActual === 'inicio'     && <VistaInicio />}
        {vistaActual === 'modulo'     && <VistaModulo />}
        {vistaActual === 'comunidad'  && <VistaComunidad />}
        {vistaActual === 'traductor'  && <VistaTraductor />}
      </div>
    </div>
  );
};

/**
 * Componente principal de la Cartilla Digital Inga.
 *
 * Este componente actúa como el punto de entrada de la aplicación,
 * envolviendo todo en el AppProvider para proporcionar el contexto global.
 *
 * La arquitectura sigue el patrón de:
 * - AppProvider: Manejo centralizado del estado
 * - Hooks personalizados: Acceso segmentado al estado (useAuth, useNavigation, useActividad)
 * - Componentes modulares: UI dividida por responsabilidad
 * - Vistas: Composición de componentes para cada pantalla
 */
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
