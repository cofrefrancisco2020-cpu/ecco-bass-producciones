# Ecco & Bass Producciones — versión 1

Web estática en español de Chile, con la identidad negra y cobre de la empresa. Preparada para GitHub y Vercel, sin dependencias de terceros para ejecutar la interfaz.

## Abrir la web

Abre index.html en Chrome o Edge. Para verla mediante servidor local, instala Node.js 22 o posterior y ejecuta en esta carpeta:

    npm start

Abre http://127.0.0.1:4173/. Para detener el servidor usa Ctrl+C.

## Subir a GitHub y Vercel

1. Sube el contenido de esta carpeta a un repositorio de GitHub. No subas la carpeta work del chat.
2. Importa ese repositorio en Vercel.
3. Selecciona el directorio que contiene index.html y package.json como raíz.
4. El archivo vercel.json configura el comando node build.mjs y la salida dist. No hay paquetes que instalar.
5. Deja activada la exposición automática de variables de sistema de Vercel. El proceso toma VERCEL_PROJECT_PRODUCTION_URL para generar las URL oficiales.
6. Si conectas un dominio personalizado y quieres fijarlo explícitamente, define SITE_URL con el dominio HTTPS completo, sin rutas, y vuelve a desplegar.

La construcción genera canonical, Open Graph, imagen social, robots.txt y sitemap.xml con el dominio correspondiente. Las vistas previas de Vercel llevan noindex. El código local no inventa un dominio de la empresa.

Referencia oficial de las variables de Vercel:
https://vercel.com/docs/environment-variables/system-environment-variables

Después de conectar el dominio, revisa los datos de la empresa, registra la propiedad en Google Search Console y envía /sitemap.xml. La preparación técnica no garantiza una posición en Google.

## Qué incluye

- Diseño adaptable a computador, tablet y celular.
- 22 fichas de servicios con fotografías, precios legibles del catálogo y condiciones.
- Filtros, buscador, detalle ampliado y selección de servicios.
- Consulta por WhatsApp con nombre, celebración, fecha, invitados, lugar y servicios elegidos.
- Secciones de Casa Quinta Liborio, equipo, contacto y preguntas frecuentes.
- Acceso al perfil de Instagram y aviso con cierre, navegación por teclado y frecuencia limitada.
- Fotografía del recinto y enlace a su búsqueda en Google Maps.
- Animaciones suaves y respeto a la preferencia de reducir movimiento.
- SEO local para Copiapó y Atacama, contenido semántico, Organization y FAQPage.

## Materiales y límites

El PDF original se utilizó únicamente para extraer información y fotografías. No forma parte de esta entrega, no se publica y no tiene enlaces en la web. El proceso de construcción rechaza archivos PDF dentro de assets.

No hay videos, reproductores ni enlaces a reels de Instagram, siguiendo la corrección del usuario. Instagram queda como canal de seguimiento mediante su perfil.

Las fotografías de servicios son recortes del catálogo; no se cambiaron personas, equipos ni resultados. Las fotos del recinto y del equipo provienen de las publicaciones registradas en brief-marca.md. La imagen decorativa de cobre y bola disco fue creada con ImageGen. El logo es el aportado por el usuario. Las tipografías Barlow Condensed y DM Sans están alojadas localmente; sus licencias están en FONT-LICENSES.txt.

Los valores son referencias del catálogo 2026, sujetos a disponibilidad y confirmación. El precio del toro mecánico no se publicó porque el documento lo muestra incompleto. La oferta de comida tiene unidades y cantidades específicas, detalladas en su ficha.

El formulario no guarda datos ni envía mensajes automáticamente. Abre WhatsApp con una consulta preparada; el visitante la revisa y envía. No hay servidor de reservas ni pago en línea. Seleccionar una fecha no constituye una reserva.

## Archivos

- index.html: contenido, fichas, SEO básico y datos estructurados.
- styles.css y fonts.css: diseño y tipografías.
- script.js: interacciones y preparación de WhatsApp.
- assets/: imágenes y fuentes finales, sin subcarpetas.
- build.mjs: preparación de la publicación y SEO del dominio.
- preview.mjs: servidor local.
- vercel.json y package.json: configuración de despliegue.
- brief-marca.md: fuentes, inventario y decisiones.
- FONT-LICENSES.txt: licencias de las fuentes.

Edita los textos y las fichas directamente en index.html. Las interacciones leen esas mismas fichas; no hay una segunda lista de precios que mantener.
