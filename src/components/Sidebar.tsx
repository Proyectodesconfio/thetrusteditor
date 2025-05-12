// src/components/Sidebar.tsx
import { Home, Users, BarChart2, Mail, Settings, HelpCircle } from 'lucide-react'; // Re-importados todos los iconos
import { Link, useLocation } from 'react-router-dom';

/**
 * Componente que renderiza la barra lateral de navegación principal.
 * Se adapta para mostrarse en la parte inferior en pantallas pequeñas y en el lateral izquierdo en pantallas más grandes.
 */
export default function Sidebar() {
  // Hook para obtener la información de la ruta actual y determinar el enlace activo.
  const location = useLocation();

  // Definición de los enlaces de navegación con su icono, ruta y etiqueta (para accesibilidad).
  const navLinks = [
    { icon: Home,       path: '/',                 label: 'Inicio' },
    { icon: Users,      path: '#users-placeholder', label: 'Usuarios (Próximamente)' }, // Ruta placeholder
    { icon: BarChart2,  path: '#stats-placeholder', label: 'Estadísticas (Próximamente)' }, // Ruta placeholder
    { icon: Mail,       path: '#messages-placeholder', label: 'Mensajes (Próximamente)' }, // Ruta placeholder
    { icon: Settings,   path: '#settings-placeholder', label: 'Configuración (Próximamente)' }, // Ruta placeholder
    { icon: HelpCircle, path: '/loaded-articles',  label: 'Artículos Cargados' },
  ];

  return (
    // Contenedor principal del sidebar.
    // Fijo, con estilos responsivos para cambiar de posición y dimensiones.
    // `print:hidden` para evitar que se imprima.
    <aside className="fixed bottom-0 left-0 right-0 md:right-auto md:top-0 md:w-16 bg-white border-t md:border-t-0 md:border-r border-gray-200 md:pt-16 z-40 print:hidden">
      {/*
        Nota sobre md:pt-16:
        Asegura que los iconos del sidebar comiencen justo debajo de una cabecera (Header) de altura h-16.
      */}
      <nav className="flex md:flex-col items-center justify-around md:justify-start md:gap-y-4 md:py-4 h-16 md:h-auto">
        {/* Mapeo de los enlaces para renderizar cada ítem de navegación. */}
        {navLinks.map(({ icon: Icon, path, label }) => {
          // Para los enlaces placeholder, no queremos que se marquen como activos a menos que
          // específicamente quieras un comportamiento de "activo" incluso para placeholders.
          // Aquí, solo los enlaces con rutas reales se marcarán como activos.
          const isActive = path.startsWith('/') && location.pathname === path;

          // Si el path es un placeholder (no empieza con '/'), no usar Link sino un div o button estilizado
          if (!path.startsWith('/')) {
            return (
              <div
                key={path} // Usar path (que será único para placeholders) como key
                title={label}
                aria-label={label}
                className={`
                  w-10 h-10 rounded-lg flex items-center justify-center cursor-not-allowed
                  text-gray-300  // Estilo para enlace deshabilitado/placeholder
                `}
              >
                <Icon className="w-5 h-5" strokeWidth={2} />
              </div>
            );
          }

          // Para rutas reales, usar Link
          return (
            <Link
              key={path}
              to={path}
              title={label} // Tooltip al pasar el mouse
              aria-label={label} // Para lectores de pantalla
              aria-current={isActive ? 'page' : undefined} // Indica la página actual para accesibilidad
              className={`
                w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-150 ease-in-out
                focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500
                ${isActive
                  ? 'bg-blue-100 text-blue-600' // Estilo para enlace activo
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700' // Estilo para enlace inactivo y hover
                }
              `}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} /> {/* Icono con stroke más grueso si está activo */}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}