// src/ScrollToTop.tsx (o src/components/ScrollToTop.tsx)
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente que escucha los cambios de ruta y automáticamente
 * hace scroll al principio de la página (0, 0) en cada navegación.
 */
function ScrollToTop() {
  // Obtiene la información de la ubicación actual (incluyendo el pathname)
  const { pathname } = useLocation();

  // Ejecuta este efecto cada vez que el 'pathname' (la ruta) cambia
  useEffect(() => {
    // Realiza el scroll al principio de la ventana
    window.scrollTo(0, 0);
  }, [pathname]); // El efecto depende solo del pathname

  // Este componente no renderiza nada visualmente
  return null;
}

export default ScrollToTop;