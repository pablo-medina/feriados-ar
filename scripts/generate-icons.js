const fs = require('fs');
const path = require('path');

// Tamaños de íconos necesarios para PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Función para generar el SVG con el tamaño especificado
function generateSVG(size) {
  const viewBox = 512;
  const scale = size / viewBox;
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${viewBox} ${viewBox}" xmlns="http://www.w3.org/2000/svg">
  <!-- Fondo circular -->
  <circle cx="256" cy="256" r="256" fill="#667eea"/>
  
  <!-- Header del calendario (rectángulo azul claro) -->
  <rect x="120" y="120" width="272" height="80" rx="12" fill="#87CEEB"/>
  
  <!-- Agujeros del calendario (círculos blancos) -->
  <circle cx="160" cy="160" r="8" fill="white"/>
  <circle cx="352" cy="160" r="8" fill="white"/>
  
  <!-- Cuerpo del calendario (rectángulo blanco con esquinas redondeadas) -->
  <rect x="120" y="200" width="272" height="272" rx="12" fill="white"/>
  
  <!-- Líneas de la grilla del calendario -->
  <!-- Líneas verticales -->
  <line x1="157" y1="200" x2="157" y2="472" stroke="#E0E0E0" stroke-width="2"/>
  <line x1="194" y1="200" x2="194" y2="472" stroke="#E0E0E0" stroke-width="2"/>
  <line x1="231" y1="200" x2="231" y2="472" stroke="#E0E0E0" stroke-width="2"/>
  <line x1="268" y1="200" x2="268" y2="472" stroke="#E0E0E0" stroke-width="2"/>
  <line x1="305" y1="200" x2="305" y2="472" stroke="#E0E0E0" stroke-width="2"/>
  <line x1="342" y1="200" x2="342" y2="472" stroke="#E0E0E0" stroke-width="2"/>
  <line x1="379" y1="200" x2="379" y2="472" stroke="#E0E0E0" stroke-width="2"/>
  
  <!-- Líneas horizontales -->
  <line x1="120" y1="237" x2="392" y2="237" stroke="#E0E0E0" stroke-width="2"/>
  <line x1="120" y1="274" x2="392" y2="274" stroke="#E0E0E0" stroke-width="2"/>
  <line x1="120" y1="311" x2="392" y2="311" stroke="#E0E0E0" stroke-width="2"/>
  <line x1="120" y1="348" x2="392" y2="348" stroke="#E0E0E0" stroke-width="2"/>
  <line x1="120" y1="385" x2="392" y2="385" stroke="#E0E0E0" stroke-width="2"/>
  <line x1="120" y1="422" x2="392" y2="422" stroke="#E0E0E0" stroke-width="2"/>
  <line x1="120" y1="459" x2="392" y2="459" stroke="#E0E0E0" stroke-width="2"/>
  
  <!-- Punto rojo en el centro (cuarta columna, tercera fila) -->
  <circle cx="268" cy="311" r="12" fill="#FF4444"/>
</svg>`;
}

// Función para convertir SVG a PNG usando una herramienta externa
async function convertSVGToPNG(svgContent, outputPath, size) {
  // Para este ejemplo, vamos a crear un archivo SVG temporal y luego usar una herramienta
  // En un entorno real, usarías sharp, svg2png, o similar
  
  const tempSVGPath = path.join(__dirname, 'temp-icon.svg');
  fs.writeFileSync(tempSVGPath, svgContent);
  
  console.log(`Generando ícono ${size}x${size}...`);
  
  // Aquí normalmente usarías una librería como sharp para convertir SVG a PNG
  // Por ahora, vamos a crear un placeholder que indique que se necesita conversión
  
  const placeholderContent = `# Placeholder para ícono ${size}x${size}
# Este archivo debe ser reemplazado con el PNG real generado desde el SVG
# Usar: npx svg2png temp-icon.svg -o ${outputPath} -w ${size} -h ${size}`;
  
  fs.writeFileSync(outputPath.replace('.png', '.txt'), placeholderContent);
  console.log(`Placeholder creado para ${outputPath}`);
}

// Función principal
async function generateIcons() {
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');
  
  // Crear directorio si no existe
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }
  
  console.log('Generando íconos para la PWA...');
  
  for (const size of iconSizes) {
    const svgContent = generateSVG(size);
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    
    await convertSVGToPNG(svgContent, outputPath, size);
  }
  
  console.log('¡Íconos generados!');
  console.log('');
  console.log('Para convertir los SVGs a PNGs, instala y usa una herramienta como:');
  console.log('npm install -g svg2png');
  console.log('O usa una herramienta online como: https://convertio.co/svg-png/');
  console.log('');
  console.log('También puedes usar herramientas como:');
  console.log('- Inkscape (gratuito)');
  console.log('- Adobe Illustrator');
  console.log('- Figma');
  console.log('- GIMP');
}

// Ejecutar el script
generateIcons().catch(console.error);
