import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { seccionesPublicAPI, BannerSlideAPI } from '../../services/api';

const FADE_MS = 250;

export const BannerCarrusel: React.FC = () => {
  const [slides, setSlides] = useState<BannerSlideAPI[]>([]);
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number | null>(null);
  const changingRef = useRef(false);

  useEffect(() => {
    seccionesPublicAPI.getBanner().then(setSlides).catch(() => {});
  }, []);

  const fadeTo = (idx: number) => {
    if (changingRef.current) return;
    changingRef.current = true;
    setVisible(false);
    setTimeout(() => {
      setCurrent(idx);
      setVisible(true);
      changingRef.current = false;
    }, FADE_MS);
  };

  const startTimer = (len: number, currentRef: React.MutableRefObject<number>) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (len <= 1) return;
    timerRef.current = setInterval(() => {
      const next = (currentRef.current + 1) % len;
      fadeTo(next);
    }, 5000);
  };

  // Use a ref to track current for the timer closure
  const currentRef = useRef(current);
  useEffect(() => { currentRef.current = current; }, [current]);

  useEffect(() => {
    startTimer(slides.length, currentRef);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slides.length]);

  if (slides.length === 0) return null;

  const go = (idx: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    fadeTo(idx);
    startTimer(slides.length, currentRef);
  };

  const prev = () => go((current - 1 + slides.length) % slides.length);
  const next = () => go((current + 1) % slides.length);

  const handleClick = (slide: BannerSlideAPI) => {
    if (!slide.link_url) return;
    if (slide.link_url.startsWith('http')) {
      window.open(slide.link_url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.hash = slide.link_url;
    }
  };

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); }
    touchStartX.current = null;
  };

  const slide = slides[current];

  return (
    <div
      className="relative w-full rounded-2xl shadow-lg overflow-hidden select-none bg-black"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Imagen */}
      <div
        className="w-full transition-opacity ease-in-out"
        style={{ opacity: visible ? 1 : 0, transitionDuration: `${FADE_MS}ms` }}
      >
        {slide.imagen_url ? (
          <img
            src={slide.imagen_url}
            alt={slide.imagen_alt || slide.titulo}
            className="w-full h-auto block"
            draggable={false}
          />
        ) : (
          <div className="w-full bg-gradient-to-r from-emerald-800 to-emerald-600" style={{ minHeight: 260 }} />
        )}
      </div>

      {/* Overlay texto */}
      {(slide.titulo || slide.subtitulo) && (
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent px-5 pb-5 pt-12 md:px-8 md:pb-7 transition-opacity ease-in-out"
          style={{ opacity: visible ? 1 : 0, transitionDuration: `${FADE_MS}ms` }}
        >
          {slide.titulo && (
            <h2 className="text-white font-bold text-xl md:text-3xl drop-shadow leading-tight">
              {slide.titulo}
            </h2>
          )}
          {slide.subtitulo && (
            <p className="text-white/80 text-sm md:text-base mt-1 drop-shadow">
              {slide.subtitulo}
            </p>
          )}
        </div>
      )}

      {/* Enlace */}
      {slide.link_url && (
        <button
          className="absolute inset-0 w-full h-full cursor-pointer focus:outline-none"
          onClick={() => handleClick(slide)}
          aria-label={`Ver más: ${slide.titulo}`}
        />
      )}

      {/* Controles */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/65 text-white rounded-full p-2 transition z-10"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/65 text-white rounded-full p-2 transition z-10"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
