// src/components/Header.tsx
import { Search, Plus } from 'lucide-react'; 

/**
 * Componente que renderiza la barra de encabezado superior de la aplicación.
 * Incluye un campo de búsqueda y, en pantallas más grandes, avatares de usuario y un botón de acción.
 */
export default function Header() {
  // URLs de ejemplo para avatares. En una aplicación real, estos vendrían de datos de usuario.
  const userAvatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80", // q=80 para calidad
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80",
  ];

  return (
    // Contenedor principal de la cabecera: fijo en la parte superior, con fondo y borde.
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 h-16 print:hidden"> {/* print:hidden para no imprimirlo */}
      {/* Contenedor interno para centrar y limitar el ancho, con padding y altura fija. */}
      <div className="max-w-screen-xl mx-auto px-4 h-full flex items-center justify-between gap-4"> {/* max-w-screen-xl para ancho máximo */}

        {/* Sección de Búsqueda */}
        <div className="flex items-center bg-gray-100 hover:bg-gray-200 focus-within:ring-2 focus-within:ring-blue-500 rounded-lg px-3 py-2 w-full sm:w-auto md:w-72 transition-colors"> {/* Mejorado :hover y :focus-within */}
          <Search className="w-4 h-4 text-gray-500 flex-shrink-0" /> {/* Icono no se encoge */}
          <input
            type="search" // Tipo 'search' para mejor semántica y posible funcionalidad de navegador
            placeholder="Buscar..." // Placeholder en español
            className="bg-transparent border-none focus:outline-none ml-2 w-full text-sm text-gray-700 placeholder-gray-500" // Mejorado placeholder color
            aria-label="Campo de búsqueda" // Para accesibilidad
          />
        </div>

        {/* Sección de Usuario (visible en pantallas medianas y más grandes) */}
        <div className="hidden md:flex items-center space-x-3"> {/* Ajustado space-x */}
          {/* Grupo de avatares superpuestos */}
          <div className="flex -space-x-3 hover:space-x-0 transition-all duration-200 group-avatars"> {/* Efecto hover para separar */}
            {userAvatars.map((src, index) => (
              <img
                key={`avatar-${index}`}
                src={src}
                // Aplicar un borde de color ligeramente diferente para cada uno o un efecto al pasar el mouse
                className="w-8 h-8 rounded-full border-2 border-white shadow-sm object-cover hover:z-10 transform hover:scale-110 transition-transform"
                alt={`Usuario ${index + 1}`}
                title={`Usuario ${index + 1}`} // Tooltip
              />
            ))}
          </div>
          {/* Botón de Acción (ej: Añadir nuevo) */}
          <button
            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800 flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
            title="Añadir nuevo" // Tooltip
            aria-label="Añadir nuevo" // Para accesibilidad
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}