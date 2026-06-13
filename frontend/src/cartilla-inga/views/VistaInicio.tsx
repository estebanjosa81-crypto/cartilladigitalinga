import React from 'react';
import {
  BannerCarrusel,
  TopAprendices,
  HeroSection,
  StatsSection,
  ModulosDestacados,
  SobreLengua,
  SeccionesContenido,
} from '../components/home';

export const VistaInicio: React.FC = () => {
  return (
    <div className="space-y-6 pb-8">
      <BannerCarrusel />

      <HeroSection />

      <SeccionesContenido />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ModulosDestacados />
        </div>
        <div className="space-y-6">
          <StatsSection />
          <TopAprendices />
        </div>
      </div>

      <SobreLengua />
    </div>
  );
};
