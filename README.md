# Portfolio de Tomás Boquite · Versión 2

Portada centrada con encendido CRT, texto animado, barra de editor y seis accesos. El panel inferior Filesystem reúne las secciones. Sobre mí y Experiencia tienen pestañas internas. La primera propuesta está en la carpeta hermana `portfolio-tomas`.

Los accesos abren una sección por vez. El scroll pertenece a la vista abierta y el logo vuelve a la portada. Los enlaces a secciones y el historial del navegador también funcionan.

HTML, CSS y JavaScript, sin dependencias ni compilación. Las fuentes también son locales.

## Abrir

Abrir `index.html` directamente en el navegador. También se puede iniciar un servidor local desde esta carpeta:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Luego visitar http://127.0.0.1:4173.

## Archivos

- `index.html`: estructura y textos en español; las traducciones están en atributos `data-en`.
- `styles.css`: diseño, paleta, CRT y adaptación móvil.
- `script.js`: selector ES/EN, navegación Filesystem, pestañas internas y control de efectos CRT.
- `assets/`: símbolo original y fuentes.

La estética se inspira en Kimu's Underground. La paleta, el símbolo y los enlaces provienen del sitio actual de Tomás. Los datos profesionales provienen de sus respuestas y del CV proporcionado.

Los proyectos se presentan sin identificar clientes. No se incorporaron métricas, testimonios, artículos ni detalles de hardware que no hayan sido proporcionados. Las secciones de homelab y artículos quedan preparadas para ampliar con información real.

El botón CRT activa o desactiva las animaciones y la página respeta la preferencia de movimiento reducido del sistema. El panel Filesystem se puede cerrar con Escape. Las pestañas internas se navegan con las flechas del teclado.

## Fuentes

- [Departure Mono](https://github.com/rektdeckard/departure-mono), de Helena Zhang. SIL Open Font License 1.1; copia en `assets/fonts/OFL-DepartureMono.txt`.
- [Vergilia](https://fontstruct.com/fontstructions/show/2073919/vergilia), de Echo Heo. SIL Open Font License 1.1; copia en `assets/fonts/OFL-Vergilia.txt`.

Las fuentes se conservan sin modificaciones. No se reutilizan fotografías, avatares ni el código del sitio de referencia.
