import React from 'react';
import { BookOpen, Award, Menu, X, LogIn, ShieldCheck, Home, Users, BookMarked, Languages } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '../../hooks/useNavigation';

const NAV_ITEMS = [
  { label: 'Inicio',     icon: Home,       action: 'inicio'    },
  { label: 'Módulos',    icon: BookMarked, action: 'modulos'   },
  { label: 'Traductor',  icon: Languages,  action: 'traductor' },
  { label: 'Comunidad',  icon: Users,      action: 'comunidad' },
] as const;

export const Header: React.FC = () => {
  const { usuarioAutenticado, userRole, puntos, solicitarAutenticacion, setMostrarModalStats } = useAuth();
  const { menuAbierto, setMenuAbierto, vistaActual, volverAInicio, irAComunidad, irAAdmin, irATraductor } = useNavigation();

  const handleNav = (action: typeof NAV_ITEMS[number]['action']) => {
    if      (action === 'inicio'    ) volverAInicio();
    else if (action === 'comunidad' ) irAComunidad();
    else if (action === 'modulos'   ) setMenuAbierto(true);
    else if (action === 'traductor' ) irATraductor();
  };

  const activeFor = (action: string) => {
    if (action === 'inicio'    ) return vistaActual === 'inicio';
    if (action === 'comunidad' ) return vistaActual === 'comunidad';
    if (action === 'modulos'   ) return vistaActual === 'modulo';
    if (action === 'traductor' ) return vistaActual === 'traductor';
    return false;
  };

  return (
    <header className="bg-emerald-900 text-white shadow-md sticky top-0 z-40 border-b border-emerald-800/60">
      <div className="container mx-auto px-3 md:px-6 h-14 flex items-center gap-3">

        {/* Hamburguesa — izquierda */}
        <button
          onClick={() => setMenuAbierto(!menuAbierto)}
          className="flex-shrink-0 p-1.5 hover:bg-white/10 rounded-lg transition"
          aria-label="Menú"
        >
          {menuAbierto
            ? <X className="w-5 h-5" />
            : <Menu className="w-5 h-5" />}
        </button>

        {/* Logo */}
        <button
          onClick={volverAInicio}
          className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition"
        >
          <BookOpen className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-base tracking-tight">Cartilla Inga</span>
        </button>

        {/* Nav central — solo desktop */}
        <nav className="hidden md:flex items-center gap-1 ml-6">
          {NAV_ITEMS.map(({ label, icon: Icon, action }) => (
            <button
              key={action}
              onClick={() => handleNav(action)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                activeFor(action)
                  ? 'bg-white/15 text-white'
                  : 'text-emerald-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Acciones — derecha */}
        <div className="flex items-center gap-2">
          {usuarioAutenticado ? (
            <>
              {userRole === 'admin' && (
                <button
                  onClick={irAAdmin}
                  className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 px-3 py-1.5 rounded-full text-xs font-semibold transition"
                  title="Panel de Administración"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              )}
              <button
                onClick={() => setMostrarModalStats(true)}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full text-sm font-semibold transition"
              >
                <Award className="w-4 h-4 text-amber-300" />
                <span>{puntos}</span>
                <span className="hidden sm:inline text-emerald-300 font-normal text-xs">pts</span>
              </button>
            </>
          ) : (
            <button
              onClick={solicitarAutenticacion}
              className="group flex items-center gap-2 bg-white text-emerald-800 hover:bg-emerald-50 border border-white/30 hover:border-emerald-200 px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200"
            >
              <LogIn className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              <span>Iniciar sesión</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
