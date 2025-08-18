# Feriados Argentina

Aplicación web moderna y responsive para consultar los feriados de Argentina, desarrollada con Angular 20 y Material Design 3.

## Características

- **Diseño responsive** - Optimizada para móviles, tablets y escritorio
- **Material Design 3** - Interfaz moderna siguiendo las últimas guías de Material Design
- **Pull-to-refresh** - Deslizar hacia abajo para actualizar los datos
- **Funcionalidad offline** - Los datos se cachean para uso sin conexión
- **PWA (Progressive Web App)** - Instalable como aplicación nativa
- **API oficial** - Utiliza datos del gobierno argentino

## Funcionalidades

- **Vista por año**: Cambiar entre diferentes años para ver feriados pasados y futuros
- **Vista por mes**: Organizar los feriados por mes para una mejor visualización
- **Próximo feriado destacado**: Mostrar el próximo feriado con cuenta regresiva
- **Estadísticas**: Resumen de feriados inamovibles y trasladables
- **Búsqueda inteligente**: Encontrar feriados específicos rápidamente
- **Notificaciones offline**: Avisar cuando se están usando datos cacheados

## Tecnologías

- **Angular 20** - Framework principal
- **Angular Material** - Componentes UI
- **RxJS** - Programación reactiva
- **Service Workers** - Cache y funcionalidad offline
- **TypeScript** - Tipado estático
- **SCSS** - Estilos avanzados

## Instalación

1. Clona el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd feriados-ar
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm start
   ```

4. Abre tu navegador en `http://localhost:4200`

## Build para producción

```bash
npm run build
```

Los archivos de build se generarán en el directorio `dist/`.

## Instalación como PWA

1. Abrir la aplicación en el navegador móvil
2. En Chrome: Menú → "Instalar aplicación"
3. En Safari: Compartir → "Agregar a pantalla de inicio"

## Configuración

La aplicación usa la API pública de Argentina Datos para obtener los feriados:
- **Endpoint**: `https://api.argentinadatos.com/v1/feriados/{año}`
- **Cache**: 365 días de duración (todo el año)
- **Actualización**: Semanal automática en background
- **Offline**: Funciona sin conexión usando datos cacheados
- **Manejo de errores**: Usa caché silenciosamente si falla la actualización automática

## Personalización

### Colores del tema
Se puede modificar el esquema de colores en `src/styles.scss`:

```scss
@use '@angular/material' as mat;

html {
  @include mat.theme((
    color: (
      primary: mat.$azure-palette,
      tertiary: mat.$blue-palette,
    ),
    typography: Roboto,
    density: 0,
  ));
}
```

### Configuración del Service Worker
Se puede ajustar la configuración de cache en `ngsw-config.json` para modificar el comportamiento offline.

## Contribuir

1. Fork del proyecto
2. Crear una rama para la feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de los cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Agradecimientos

- **[Argentina Datos](https://argentinadatos.com)** - Por proporcionar la API de feriados
- **[Angular Team](https://angular.io)** - Por el desarrollo del framework
- **[Material Design](https://m3.material.io)** - Por las guías de diseño

