# Generador Comercial — v1.3.0

Generador de **cotizaciones** y **notas de venta** en un sitio web estático. Basado en HTML, CSS y JavaScript, sin frameworks ni servidor.

## Funcionalidades

- Cotización y nota de venta con vista previa A4 en tiempo real.
- Conceptos, cantidades, precios, descuento e IGV con cálculos automáticos.
- Logo, colores corporativos y selección de tipografía.
- Medios de pago, condiciones comerciales, notas y recomendaciones.
- Imprimir / Guardar como PDF desde el navegador.
- Guardado local (`localStorage`) y respaldo/importación en JSON.
- Diseño adaptable a teléfonos y computadoras.

## Ejecutar localmente

Abre `index.html` en Chrome, Edge o Firefox. No se requieren instalaciones ni servicios externos.

## Publicación en GitHub Pages

1. Crea un repositorio, por ejemplo `generador-comercial`, en tu cuenta GitHub.
2. Sube **el contenido de esta carpeta** a la raíz de la rama `main` (`index.html`, `css/`, `js/`, `.github/`, `.nojekyll`).
3. En GitHub, entra a **Settings → Pages → Build and deployment** y selecciona **GitHub Actions**.
4. El workflow `.github/workflows/pages.yml` publicará el sitio al hacer `push` a `main`.
5. Una vez desplegado, el sitio normalmente tendrá una URL como `https://<usuario>.github.io/generador-comercial/`.

**Nota:** la URL solamente funcionará una vez que el repositorio exista, la publicación de Pages esté habilitada y la acción termine correctamente.

## Privacidad y límites

El sitio se ejecuta en el navegador. Los datos de documentos, los logos y los medios de pago se guardan **solo en el navegador local**; no hay cuentas de usuario ni base de datos ni sincronización entre dispositivos. **No subas al repositorio documentos reales, exportaciones JSON de clientes, logos privados ni datos bancarios**. Se han eliminado del código base los datos de clientes y cuentas bancarias de los ejemplos.

Una **nota de venta no sustituye** un comprobante de pago electrónico autorizado por SUNAT cuando corresponda.

## Arquitectura

```text
index.html                 Interfaz y vista previa del documento
css/styles.css             Estilos, tipografías y reglas de impresión A4
js/app.js                  Estado, cálculos, edición e importación/exportación JSON
.github/workflows/pages.yml   Publicación automática en GitHub Pages
.nojekyll                  Habilita la entrega de archivos sin procesamiento Jekyll
```

Versión 1.3.0 · 2026-11-01