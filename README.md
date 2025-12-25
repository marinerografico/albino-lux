# Albino Wine Landing - Shopify Theme

Una plantilla de tema de Shopify minimalista y elegante para la marca Albino Wine, diseñada con un enfoque en la experiencia de usuario y el impacto social.

## 🎨 Características

- **Diseño Minimalista**: Interfaz limpia y moderna con tipografía cuidadosamente seleccionada
- **Age Gate**: Verificación de edad integrada antes de acceder al sitio
- **Secciones Modulares**: Componentes reutilizables y personalizables desde el editor de Shopify
- **Responsive Design**: Optimizado para dispositivos móviles y desktop
- **Animaciones Suaves**: Transiciones y efectos de scroll reveal para una experiencia fluida
- **Impacto Social**: Sección dedicada a mostrar el compromiso con causas sociales

## 📁 Estructura del Proyecto

```
landing/
├── assets/              # Archivos CSS, JS e imágenes
│   ├── main.css        # Estilos principales
│   └── main.js         # JavaScript principal
├── config/             # Configuración del tema
│   ├── settings_data.json
│   └── settings_schema.json
├── layout/             # Layouts principales
│   └── theme.liquid    # Layout base del tema
├── sections/           # Secciones reutilizables
│   ├── age-gate.liquid
│   ├── hero.liquid
│   ├── product.liquid
│   ├── impact.liquid
│   ├── manifesto-cards.liquid
│   ├── manifesto-quote.liquid
│   ├── navigation.liquid
│   ├── footer.liquid
│   └── product-modal.liquid
├── snippets/           # Fragmentos reutilizables
│   └── icon.liquid
└── templates/          # Plantillas de página
    └── index.liquid    # Página principal
```

## 🚀 Instalación

### Opción 1: Usando Shopify CLI

1. Instala [Shopify CLI](https://shopify.dev/themes/tools/cli):
```bash
npm install -g @shopify/cli @shopify/theme
```

2. Autentica con tu tienda:
```bash
shopify theme login
```

3. Sube el tema a tu tienda:
```bash
shopify theme push
```

### Opción 2: Subida Manual

1. Comprime toda la carpeta del tema en un archivo ZIP
2. Ve a tu admin de Shopify: **Online Store > Themes**
3. Haz clic en **Upload theme**
4. Selecciona el archivo ZIP

## 🛠️ Configuración

### Personalización desde el Editor de Shopify

Una vez instalado el tema, puedes personalizar todas las secciones desde el editor de temas de Shopify:

- **Hero Section**: Título, subtítulo, descripción y texto del botón CTA
- **Product Section**: Imagen del producto, información de edición, packs disponibles
- **Impact Section**: Métricas de impacto y enlace al reporte de transparencia
- **Manifesto Cards**: Tarjetas con citas y categorías personalizables
- **Footer**: Texto del footer y enlaces del menú

### Configuración de Menús

1. Ve a **Online Store > Navigation**
2. Crea un menú llamado "Footer" con los enlaces deseados
3. El footer mostrará automáticamente estos enlaces

## 📝 Personalización Avanzada

### Colores y Tipografía

Los colores y tipografías se pueden configurar en `config/settings_schema.json` y se aplicarán automáticamente en todo el tema.

### Agregar Nuevas Secciones

1. Crea un nuevo archivo `.liquid` en la carpeta `sections/`
2. Usa el formato de schema de Shopify para hacer la sección editable
3. Agrega la sección a tu template usando `{% section 'nombre-seccion' %}`

### Modificar Estilos

Los estilos principales están en `assets/main.css`. Puedes:
- Modificar los colores de las clases Tailwind
- Ajustar las animaciones y transiciones
- Personalizar los efectos de scroll reveal

## 🎯 Secciones Incluidas

### Age Gate
Verificación de edad antes de acceder al sitio. Se puede desactivar comentando la sección en `layout/theme.liquid`.

### Hero
Sección principal con título, descripción y CTA. Incluye animaciones de fade-in.

### Product
Muestra el producto principal con imagen, información y opciones de packs. Incluye modal con detalles del producto.

### Manifesto Quote
Cita destacada con efecto hover.

### Impact
Métricas de impacto social con diseño oscuro y llamativo.

### Manifesto Cards
Grid de tarjetas con citas del manifiesto, cada una con icono y categoría.

### Footer
Footer minimalista con enlaces y texto de copyright.

## 🔧 Tecnologías Utilizadas

- **Shopify Liquid**: Sistema de plantillas de Shopify
- **Tailwind CSS**: Framework CSS utility-first (CDN)
- **Lucide Icons**: Iconos SVG modernos
- **Google Fonts**: Inter y Newsreader

## 📦 Dependencias Externas

El tema utiliza CDN para las siguientes librerías:
- Tailwind CSS: `https://cdn.tailwindcss.com`
- Lucide Icons: `https://unpkg.com/lucide@latest`
- Google Fonts: Inter y Newsreader

## 🐛 Solución de Problemas

### El Age Gate no desaparece
Asegúrate de que el JavaScript esté cargando correctamente. Verifica la consola del navegador para errores.

### Las animaciones no funcionan
Verifica que el archivo `main.js` esté siendo cargado en `layout/theme.liquid`.

### Los iconos no se muestran
Asegúrate de que Lucide Icons esté cargado y que el script de inicialización se ejecute.

## 📄 Licencia

Este tema es propiedad de Albino Wines. Todos los derechos reservados.

## 🤝 Contribuciones

Este es un tema privado para Albino Wines. Para sugerencias o mejoras, contacta al equipo de desarrollo.

## 📞 Soporte

Para soporte técnico o preguntas sobre la implementación, contacta al equipo de desarrollo.

---

**Desarrollado con ❤️ para Albino Wines**

