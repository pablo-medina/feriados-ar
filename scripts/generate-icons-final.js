const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Tamaños de íconos necesarios para PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// SVG del ícono del calendario
const calendarSVG = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
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

async function generateIcons() {
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');
  
  // Crear directorio si no existe
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }
  
  console.log('🎨 Generando íconos para la PWA...');
  console.log('📁 Directorio de salida:', iconsDir);
  console.log('');
  
  try {
    for (const size of iconSizes) {
      const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      
      console.log(`🔄 Generando ícono ${size}x${size}...`);
      
      await sharp(Buffer.from(calendarSVG))
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Ícono ${size}x${size} generado: ${path.basename(outputPath)}`);
    }
    
    console.log('');
    console.log('🎉 ¡Todos los íconos han sido generados exitosamente!');
    console.log('');
    console.log('📋 Íconos generados:');
    iconSizes.forEach(size => {
      console.log(`   - icon-${size}x${size}.png`);
    });
    console.log('');
    console.log('🚀 Próximos pasos:');
    console.log('   1. Los íconos ya están listos en public/icons/');
    console.log('   2. Haz un build de la aplicación: npm run build');
    console.log('   3. Prueba la instalación de la PWA');
    console.log('');
    console.log('✨ ¡Tu PWA ahora tendrá un ícono hermoso y profesional!');
    
  } catch (error) {
    console.error('❌ Error al generar los íconos:', error);
    process.exit(1);
  }
}

// Ejecutar el script
generateIcons();
