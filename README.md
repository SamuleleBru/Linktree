# TODOCOR

Tienda estática hecha con HTML, CSS y JavaScript. No usa framework, servidor propio, base de datos ni dependencias de npm. El sitio publicado es [todocor.vercel.app](https://todocor.vercel.app/).

## Publicación

El repositorio de GitHub está conectado a Vercel. Los cambios que se suban a `main` se publican desde esa integración; los workflows de este repositorio no despliegan el sitio. GitHub Pages ya no es el destino de producción.

El workflow **Validate static site** revisa la sintaxis de JavaScript, los catálogos JSON, las referencias locales de las páginas y reporta medios de producto sin referencia para revisión. Se ejecuta en cambios a `main`, pull requests hacia `main` y manualmente desde GitHub Actions. No compila ni necesita instalar paquetes.
Esta validación es independiente del despliegue de Vercel; revisa sus resultados antes de publicar cambios.

Para comprobar los archivos localmente:

```powershell
node --check script.js
node --check products.js
node scripts/validate-site.mjs
```

Para previsualizar el sitio, inicia un servidor estático desde la raíz del proyecto:

```powershell
python -m http.server 8000
```

Luego abre `http://localhost:8000`.

## Estructura

- `index.html`: página principal y productos destacados.
- `products.html`: catálogo con búsqueda y filtros.
- `product.html`: detalle de producto, recibe el identificador en `?id=`.
- `script.js`: nombre, colores, categorías activas, WhatsApp y redes sociales.
- `products.js`: carga y renderiza los catálogos.
- `products.json`: catálogo que utiliza el sitio.
- `products_ocultos.json`: productos archivados; el sitio no lo carga.
- `assets/`: logo e imágenes y otros medios locales.
- `scripts/validate-site.mjs`: comprobaciones locales usadas también por GitHub Actions.
- `.github/workflows/site-check.yml`: validación continua; no despliega a Pages ni a Vercel.

Los archivos `assets/products/producto-1.svg`, `producto-2.svg` y `producto-3.svg` son imágenes de ejemplo que ya no están referenciadas por ningún catálogo. El archivo `assets/products/WhatsApp Video 2026-10-26 at 11.10.00 PM (audio-extractor.net).mp3` tampoco se reproduce ni se enlaza desde la página; ambos tipos de archivos se conservan, pero no forman parte del contenido visible actual.

## Editar productos

Los productos visibles se administran en `products.json`. Para agregar o actualizar uno:

1. Guarda su imagen en `assets/products/`. En las rutas, respeta exactamente mayúsculas, espacios y acentos del nombre del archivo.
2. Edita el objeto correspondiente en `products.json`, manteniendo un `id` entero único dentro de ese catálogo.
3. Usa las propiedades `nombre`, `descripcion`, `categoria`, `imagen`, `destacado` y `disponible`. `precio` puede ser un número, `null` o una cadena vacía; si no hay precio se ofrece consultar por WhatsApp.
4. `precioAnterior` es opcional. Si es mayor que `precio`, se usa como precio anterior; si no, la página calcula el valor anterior automáticamente.
5. `destacado: true` permite que el producto aparezca entre los destacados si también está disponible y pertenece a una categoría activa.
6. Ejecuta las validaciones anteriores, guarda y sube los cambios a GitHub.

Las categorías que el sitio muestra se configuran en `categoriasActivas`, en `script.js`. Actualmente son `Zapatos` y `Pantalones`. `products_ocultos.json` conserva artículos de otras categorías y **no** se muestra en el sitio. Antes de pasar productos de ese archivo al catálogo activo, corrige sus IDs para evitar conflictos y confirma sus precios y disponibilidad.

## Enlaces y marca

- El número principal se configura en `whatsappNumber` dentro de `script.js`; los enlaces de consulta y compra del catálogo usan ese valor.
- `links.whatsappSecondary` contiene la segunda línea de WhatsApp y puede editarse por separado.
- Los enlaces sociales se configuran en `links`. `mostrarRedes` está en `false`, por eso las redes están ocultas; el valor de Facebook sigue siendo un marcador `#FACEBOOK` y debe reemplazarse antes de activar esas redes.
- El nombre, descripción, logo y colores de marca también se editan en `TODOCOR_CONFIG`, en `script.js`.

No hay una página de política de privacidad configurada. No se debe enlazar una hasta tener el contenido o URL correctos.
