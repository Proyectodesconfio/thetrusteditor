# News Viewer - The Trust Editor

Una aplicación React diseñada para visualizar, analizar y editar noticias, proporcionando métricas detalladas e insights para mejorar la calidad del contenido periodístico. Esta herramienta utiliza inteligencia artificial (implícita en los datos de entrada) para ayudar a las redacciones.

## Características Principales (Implementadas y Planeadas)

*   Visualización de artículos de noticias.
*   Filtrado de artículos (actualmente por últimas 48 horas, autor, sección).
*   Ordenación de artículos (fecha, autor, sección).
*   Scroll infinito para la carga de artículos en la página principal.
*   Dashboard en la página principal con métricas agregadas:
    *   Entidades (conteo total y desglose por tipo).
    *   Adjetivos (conteo total, porcentaje, histograma de distribución y mediana).
    *   Fuentes (conteo total de citas - métricas detalladas son placeholder).
    *   Estadísticas generales de artículos (total artículos, autores, estados de revisión).
*   Vista de detalle del artículo con:
    *   Resumen rápido (Entidades, Adjetivos, Fuentes, Sentimiento Global).
    *   Contenido completo del artículo.
    *   Resaltado dinámico en el texto de Entidades, Adjetivos, Frases con Sentimiento y Citas de Fuentes.
    *   Barra lateral con análisis detallados (Sentimiento, Entidades, Adjetivos, Fuentes).
*   (Planeado/Futuro) Funcionalidades de edición y mejora de noticias.

## Primeros Pasos

### Prerrequisitos

*   Node.js (v18 o superior recomendado)
*   npm (generalmente viene con Node.js) o yarn

### Instalación y Ejecución

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/rusosnith/news-viewer.git
    ```
2.  **Navega al directorio del proyecto:**
    ```bash
    cd news-viewer
    ```
3.  **Instala las dependencias:**
    ```bash
    npm install
    ```
    o si usas yarn:
    ```bash
    yarn install
    ```
4.  **Inicia el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    o
    ```bash
    yarn dev
    ```
    La aplicación estará disponible en `http://localhost:5173` (o el puerto que indique Vite).

## Scripts Disponibles

En el archivo `package.json`, encontrarás los siguientes scripts:

*   `npm run dev`: Inicia el servidor de desarrollo con Vite, con recarga en caliente (HMR).
*   `npm run build`: Compila la aplicación para producción. Los archivos optimizados se generan en la carpeta `dist/`.
*   `npm run lint`: Ejecuta ESLint para analizar el código en busca de problemas.
*   `npm run preview`: Sirve localmente la compilación de producción (después de ejecutar `npm run build`).
*   `npm run deploy`: Despliega la aplicación en GitHub Pages (usando el contenido de la carpeta `dist/`).

## Estructura del Proyecto (Simplificada)

NEWS-VIEWER/
├── public/ # Archivos estáticos (ej: favicon, index.html base)

├── src/

│ ├── components/ # Componentes React reutilizables (UI y lógica)

│ │ ├── AdjectiveCharts.tsx

│ │ ├── AdjectivesMetrics.tsx

│ │ ├── ArticleContent.tsx

│ │ ├── ... (otros componentes)

│ ├── data/ # Archivos JSON de datos de entrada

│ │ ├── lavoz_input_04FEB2025.json

│ │ └── lavoz_output_04FEB2025_cleaned.json

│ ├── hooks/ # Hooks personalizados de React

│ ├── pages/ # Componentes de página (corresponden a rutas)

│ │ ├── Home.tsx

│ │ ├── ArticleDetail.tsx

│ │ └── LoadedArticlesPage.tsx

│ ├── services/ # Lógica de servicios, adaptadores de datos

│ │ └── adapters/

│ │ ├── loadArticles.ts

│ │ ├── inputAdapter.ts

│ │ └── outputAdapter.ts

│ ├── types/ # Definiciones de tipos e interfaces de TypeScript

│ │ └── index.ts

│ ├── App.tsx # Componente raíz de la aplicación y configuración de rutas

│ ├── main.tsx # Punto de entrada de la aplicación React

│ └── index.css # Estilos globales y configuración de Tailwind CSS

├── .eslintrc.cjs # Configuración de ESLint

├── .gitignore # Archivos y carpetas ignorados por Git

├── index.html # Plantilla HTML principal

├── package.json # Metadatos del proyecto y dependencias

├── postcss.config.js # Configuración de PostCSS (usado por Tailwind)

├── tailwind.config.js # Configuración de Tailwind CSS

├── tsconfig.json # Configuración general de TypeScript

├── tsconfig.node.json # Configuración de TypeScript para el entorno Node (Vite config, etc.)

└── vite.config.ts # Configuración de Vite


## Tecnologías Utilizadas

*   **Framework Frontend:** [React](https://reactjs.org/) (v18+)
*   **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
*   **Herramienta de Construcción y Servidor de Desarrollo:** [Vite](https://vitejs.dev/)
*   **Estilos CSS:** [Tailwind CSS](https://tailwindcss.com/)
*   **Enrutamiento:** [React Router DOM](https://reactrouter.com/) (v6)
*   **Iconos:**
    *   [Lucide React](https://lucide.dev/) (para Header y Sidebar)
    *   [FontAwesome](https://fontawesome.com/) (para iconos dentro de componentes de análisis)
*   **Visualización de Datos (Gráficos):** [D3.js](https://d3js.org/) (específicamente `d3-array` y `d3-scale`, `d3-selection` para los gráficos de adjetivos)
*   **Manejo de Fechas:** [date-fns](https://date-fns.org/)
*   **Linting:** [ESLint](https://eslint.org/)
*   **Gestión de Paquetes:** [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)
*   **Despliegue:** [GitHub Pages](https://maurosebastian.github.io/news-viewer/) (a través del paquete `gh-pages`)

## Contribuciones

*  Creación: **andres Snitcofsky**[GitHub Pages](https://github.com/rusosnith)
*  Aporte: **Nulo**[GitHub Pages](https://github.com/catdevnull)
*  Corrección y optimización: **Mauro Decker Díaz** [GitHub Pages](https://github.com/MauroSebastian)
