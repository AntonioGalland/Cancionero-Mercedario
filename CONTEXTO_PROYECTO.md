# 📖 Cancionero Mercedario Argentino - Documento de Contexto del Proyecto

## 1. Visión y Propósito
El **Cancionero Mercedario Argentino** es una plataforma web digital, moderna, accesible y gratuita creada para servir a la alabanza, la catequesis, la liturgia y la vida comunitaria de la **Familia Mercedaria de la República Argentina** (parroquias, capillas, colegios, coros y casas de retiro).

El proyecto fue concebido a partir de la digitalización del cancionero en PDF compilado y custodiado por las **Hermanas Mercedarias del Niño Jesús**, a quienes se les rinde homenaje y agradecimiento institucional en el pie de página.

---

## 2. Repositorio y Despliegue
* **Repositorio GitHub:** [https://github.com/AntonioGalland/Cancionero-Mercedario](https://github.com/AntonioGalland/Cancionero-Mercedario)
* **Plataforma de Hosting:** Vercel (conectado en integración continua a la rama `master`). Cada *Push* actualiza la web pública en ~15 segundos.
* **Costo de mantenimiento:** **$0 / mes** (alojamiento gratuito e indefinido).

---

## 3. Arquitectura Técnica y Archivos
El proyecto está construido sin dependencias complejas ni servidores backend pesados, asegurando velocidad máxima, compatibilidad universal (computadoras, tablets y teléfonos móviles) y funcionamiento sin internet:

* **`index.html`**: Estructura semántica, accesibilidad y diseño estilizado con Tailwind CSS. Contiene las vistas modales para visor de cantos, buscador, índice general, galería y buzón de sugerencias.
* **`app.js`**: Lógica de la aplicación:
  * Motor de búsqueda y filtrado en memoria (responde en menos de 10 milisegundos).
  * Control del visor litúrgico (modo atril, ajuste de fuentes `A+` / `A-`, modo oscuro/sepia/claro).
  * Gestor del "Repertorio de Misa Dominical" con exportación para WhatsApp.
  * Módulo de Administración con clave y formulario de sugerencias integrado.
* **`canciones.json` & `canciones_data.js`**: Base de datos de 530 cantos catalogados con identificación correlativa litúrgica y letras completas.
* **`manifest.json` & `sw.js`**: Configuración como **PWA (Progressive Web App)**, permitiendo instalar la web como una aplicación en celulares Android e iOS con soporte 100% offline (sin señal en capillas o retiros).
* **`extract_cancionero.py`**: Script en Python utilizado para procesar y extraer automáticamente las 530 canciones del archivo `cancionero-mercedario.pdf`.

---

## 4. Estructura de Secciones Litúrgicas y Códigos
Para evitar el desfasaje histórico de los números de libros impresos al agregar nuevos cantos, se implementó un **código mnemotécnico por momento litúrgico**:

| Prefijo | Momento Litúrgico | Rango Inicial | Color Litúrgico / Acento |
|:---:|:---|:---:|:---|
| **ENT** | Entrada | ENT-01 a ENT-66 | Rojo oscuro / Granate |
| **PER** | Perdón | PER-01 a PER-13 | Morado |
| **GLO** | Gloria | GLO-01 a GLO-05 | Dorado |
| **SAL** | Salmos | SAL-01 a SAL-26 | Verde |
| **OFE** | Ofertorio | OFE-01 a OFE-53 | Naranja cálido |
| **COM** | Comunión | COM-01 a COM-51 | Burdeos / Vino |
| **MED** | Meditación | MED-01 a MED-92 | Azul acero |
| **ADO** | Adoración Eucarística | ADO-01 a ADO-41 | Ámbar / Oro |
| **ADV** | Adviento | ADV-01 a ADV-09 | Índigo |
| **NAV** | Navidad | NAV-01 a NAV-22 | Rosa / Carmín |
| **CUA** | Cuaresma | CUA-01 a CUA-10 | Púrpura |
| **PAS** | Pascua | PAS-01 a PAS-10 | Blanco / Oro vivo |
| **ESP** | Espíritu Santo | ESP-01 a ESP-19 | Rojo fuego |
| **MAR** | María | MAR-01 a MAR-64 | Azul mariano |
| **MER** | Mercedarias (Nolasco, León Torres, Redención) | MER-01 a MER-13 | Vino Mercedario & Dorado |
| **ANI** | Animación / Jóvenes | ANI-01 a ANI-36 | Turquesa pastoral |

---

## 5. Funcionalidades Destacadas

### A. Buscador Inteligente
Permite buscar por:
1. Código exacto (ej.: `MER-01`, `ENT-12`).
2. Título de la canción.
3. Palabras o frases internas de las letras (ej.: *"pescador de hombres"*, *"pan partido"*).

### B. Modo Atril y Accesibilidad
* Controles rápidos para agrandar o disminuir el tamaño de letra (`A+`, `A-`, `100%`).
* Conmutador de temas: **Modo Claro**, **Modo Oscuro** (para vigilias sin encandilar) y **Modo Sepia** (descanso visual).
* Copiado de la letra completa al portapapeles con un toque.

### C. Repertorio de Misa Dominical
* Los músicos y directores de coro pueden ir tocando el botón `+` en las canciones deseadas para armar la misa del domingo.
* Incluye un botón para **"Copiar Programa para el Coro"**, listo para enviar el orden de la misa por WhatsApp al grupo musical.

### D. Índice General de Secciones
* Acceso directo mediante el botón **`Índice`** en la cabecera.
* Menú desplegable tipo acordeón con buscador propio, permitiendo explorar todas las canciones agrupadas por momento litúrgico.

### E. Sistema de Sugerencias y Curaduría Pastoral
* Botón **`Sugerir Canto`** en la barra superior.
* Botón **`Sugerir corrección`** al pie de cada canto en el visor, precargando el título y la letra actual.
* Permite enviar propuestas para:
  1. Nuevos cantos.
  2. Correcciones de letras/estrofas.
  3. Bajas o retiros de cantos en desuso.
* **Integración real con Google Apps Script:** Al enviar, el formulario hace un `fetch` silencioso (sin salir de la página, con `mode: 'no-cors'`) al webhook de Google Apps Script, que:
  - Registra la sugerencia en la **Google Sheet "Sugerencias Cancionero Mercedario"** (cuenta `antonio.galland@gmail.com`).
  - Envía un **correo de aviso automático** al administrador.
* **URL del webhook:** `https://script.google.com/macros/s/AKfycbx9H8YJftIfxtugcHONYMRnoUoV3-EFFB3yp5P-cnko6rpDQqOVeyXDEimXkDffbx_5/exec`
* **Google Sheet de sugerencias:** `https://docs.google.com/spreadsheets/d/1osRLgdYVMREM_Q_v5mWmrtAuwYGpa9mC5j5UcsBJNvk/`
* **Respaldo local:** Cada sugerencia también se guarda en `localStorage` bajo la clave `buzon_sugerencias_mercedario` por si falla la red.

### F. Flujo de Aprobación de Sugerencias (Manual)
El proceso de aprobación de cantos sugeridos es deliberadamente manual, porque el administrador es quien tiene la potestad pastoral de decidir qué entra al cancionero.

**Para aprobar un canto nuevo sugerido:**
1. Revisar la sugerencia en la Google Sheet.
2. Abrir el archivo `canciones_data.js` en el editor.
3. Agregar el objeto del canto en la sección correspondiente con el formato:
   ```js
   { "id": "...", "codigo": "ENT-XX", "titulo": "...", "seccion": "...", "seccion_codigo": "ENT", "letra": "..." }
   ```
4. Guardar y hacer `git push` → Vercel despliega en ~15 segundos.

### G. Panel de Administración
* El botón de candado y el modal de contraseña fueron **eliminados de la interfaz** para simplificarla (noviembre 2026).
* La carga directa de cantos (`modal-nueva-cancion`) sigue disponible en el HTML pero ya no es accesible desde la barra de navegación; se usa directamente desde el código si es necesario.
* La aprobación de sugerencias se realiza editando `canciones_data.js` y haciendo push a GitHub.

---

## 6. Identidad Visual y Material Gráfico
* **Escudo Mercedario (`Escudo Mercedario.png`):** Insignia heráldica universal de la Orden, usada como logo, favicon, app icon y marca de agua sutil en las letras.
* **Galería de Comunidades:** Incorpora fotografías y vitrales de templos mercedarios representativos:
  * Basílica de La Merced (Mendoza).
  * Santuario Ntra. Señora de la Merced (Corrientes).
  * Ntra. Señora de la Merced - Generala del Ejército (Tucumán).
  * Parroquia San Pedro Nolasco (Tucumán).
  * Parroquia de Palmares (Mendoza).
  * Vitrales históricos y fotos de procesiones.

---

## 7. Próximas Líneas de Desarrollo Recomendadas
1. Incorporación progresiva de acordes para guitarra (cifrado) en canciones litúrgicas clave.
2. Inclusión de enlaces a audios oficiales en YouTube o Spotify para coros juveniles.
3. Posibilidad de descargar el programa de misa en formato PDF listo para imprimir.

---

## 8. Estado del Proyecto (actualizado octubre/noviembre 2026)

| Funcionalidad | Estado |
|---|---|
| Catálogo de 530+ cantos con buscador | ✅ Funcionando |
| PWA instalable offline | ✅ Funcionando |
| Repertorio de Misa + exportar a WhatsApp | ✅ Funcionando |
| Índice General por secciones litúrgicas | ✅ Funcionando |
| Temas Claro / Oscuro / Sepia | ✅ Funcionando |
| Formulario "Sugerir Canto" con envío a Google Sheet | ✅ Funcionando |
| Aviso por correo al administrador vía Apps Script | ✅ Activo |
| Galería de templos mercedarios | ✅ Funcionando |
| Aprobación y publicación de cantos sugeridos | 🔧 Manual (editar canciones_data.js + git push) |

