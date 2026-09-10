import { EspecieFotografia } from '../types';

export interface CanvasRenderOptions {
  width?: number;
  height?: number;
}

// Loads an image from URL or data URL and returns an HTMLImageElement
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Draws rounded rectangle path
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Wraps text into multiple lines given a maxWidth
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

/**
 * Renders the high-resolution A5 framed image onto an HTML5 Canvas
 */
export async function renderA5FramedCanvas(
  especie: EspecieFotografia,
  options?: CanvasRenderOptions
): Promise<HTMLCanvasElement> {
  const isVertical = especie.orientacion === 'vertical';
  
  // Standard A5 at ~300 DPI
  const width = options?.width || (isVertical ? 1748 : 2480);
  const height = options?.height || (isVertical ? 2480 : 1748);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo inicializar el contexto de Canvas 2D');

  // 1. Draw base photo
  try {
    const photoImg = await loadImage(especie.imageUrl);
    // Draw image covering canvas (object-fit: cover)
    const imgRatio = photoImg.width / photoImg.height;
    const canvasRatio = width / height;
    let renderW = width;
    let renderH = height;
    let offsetX = 0;
    let offsetY = 0;

    if (imgRatio > canvasRatio) {
      renderW = height * imgRatio;
      offsetX = (width - renderW) / 2;
    } else {
      renderH = width / imgRatio;
      offsetY = (height - renderH) / 2;
    }

    ctx.drawImage(photoImg, offsetX, offsetY, renderW, renderH);
  } catch {
    // Fallback gradient if image fails
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#2d5a3c');
    grad.addColorStop(1, '#1b3824');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Draw subtle vignette / dark overlay to ensure readability
  const vignette = ctx.createLinearGradient(0, height * 0.7, 0, height);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, height * 0.7, width, height * 0.3);

  // 3. Bottom Institutional Banner (Matches the PDF model!)
  const bannerH = isVertical ? 170 : 150;
  const bannerY = height - bannerH;

  // Banner background
  ctx.fillStyle = '#0f6b39'; // Deep official CASD emerald green
  ctx.fillRect(0, bannerY, width, bannerH);

  // Banner accent line
  ctx.fillStyle = '#fbf8df';
  ctx.fillRect(0, bannerY, width, 4);

  // Load CASD Shield
  try {
    const shieldUrl = (typeof window !== 'undefined' && localStorage.getItem('huellas_verdes_custom_shield')) || '/escudo-casd.png';
    const shieldImg = await loadImage(shieldUrl);
    const shieldSize = bannerH * 0.82;
    const shieldX = isVertical ? 40 : 60;
    const shieldY = bannerY + (bannerH - shieldSize) / 2;
    ctx.drawImage(shieldImg, shieldX, shieldY, shieldSize, shieldSize);
  } catch (e) {
    console.warn('Shield image failed to load for canvas', e);
  }

  // Banner Institutional Text
  ctx.textAlign = 'center';
  const textCenterX = width * 0.53;
  
  // Line 1: Title
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${isVertical ? 34 : 36}px 'Plus Jakarta Sans', Arial, sans-serif`;
  ctx.fillText('Proyecto Álbum Digital Huellas Verdes de Barrancabermeja', textCenterX, bannerY + (bannerH * 0.34));

  // Line 2: Specialty
  ctx.font = `500 ${isVertical ? 27 : 29}px 'Plus Jakarta Sans', Arial, sans-serif`;
  ctx.fillStyle = '#fbf8df';
  ctx.fillText('Especialidad de Análisis Químico', textCenterX, bannerY + (bannerH * 0.60));

  // Line 3: Institutional alliance
  ctx.font = `400 ${isVertical ? 23 : 25}px 'Plus Jakarta Sans', Arial, sans-serif`;
  ctx.fillStyle = '#e2f0e6';
  ctx.fillText('En alianzas de las Instituciones Educativas CASD JPP - BDP', textCenterX, bannerY + (bannerH * 0.84));

  // 4. Draw Badges & Information Blocks (translucent overlay so photo is prominent)
  const badgeBg = 'rgba(8, 35, 20, 0.45)';
  const badgeStroke = 'rgba(255, 255, 255, 0.28)';
  const cornerRadius = 16;

  const drawPill = (
    label: string,
    value: string,
    x: number,
    y: number,
    w: number,
    isItalicValue: boolean = false
  ): number => {
    ctx.font = "bold 28px 'Plus Jakarta Sans', Arial, sans-serif";
    const labelMeasure = ctx.measureText(label + ' ');
    
    // Calculate total wrapped text
    const paddingX = 24;
    const contentW = w - paddingX * 2;
    
    // We can measure lines of the combined text or value
    const fullText = `${label} ${value}`;
    ctx.font = "500 28px 'Plus Jakarta Sans', Arial, sans-serif";
    const lines = wrapText(ctx, fullText, contentW);
    const lineHeight = 38;
    const h = Math.max(68, lines.length * lineHeight + 30);

    // Draw card background
    ctx.save();
    ctx.fillStyle = badgeBg;
    ctx.strokeStyle = badgeStroke;
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, w, h, cornerRadius);
    ctx.fill();
    ctx.stroke();

    // Draw text inside pill
    ctx.textAlign = 'left';
    lines.forEach((line, idx) => {
      const lineY = y + 42 + idx * lineHeight;
      if (idx === 0) {
        ctx.font = "bold 28px 'Plus Jakarta Sans', Arial, sans-serif";
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, x + paddingX, lineY);

        ctx.font = `${isItalicValue ? 'italic ' : ''}500 28px 'Plus Jakarta Sans', Arial, sans-serif`;
        ctx.fillStyle = '#ffffff';
        const valFirstLine = line.replace(label, '').trim();
        ctx.fillText(valFirstLine, x + paddingX + labelMeasure.width, lineY);
      } else {
        ctx.font = `${isItalicValue ? 'italic ' : ''}500 28px 'Plus Jakarta Sans', Arial, sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(line, x + paddingX, lineY);
      }
    });
    ctx.restore();

    return h;
  };

  const drawCardBox = (
    title: string,
    body: string,
    x: number,
    y: number,
    w: number,
    maxH?: number
  ): number => {
    const paddingX = 24;
    const contentW = w - paddingX * 2;
    ctx.font = "400 26px 'Plus Jakarta Sans', Arial, sans-serif";
    const lines = wrapText(ctx, body, contentW);
    const lineHeight = 36;
    const computedH = maxH || (lines.length * lineHeight + 85);

    ctx.save();
    ctx.fillStyle = badgeBg;
    ctx.strokeStyle = badgeStroke;
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, w, computedH, cornerRadius);
    ctx.fill();
    ctx.stroke();

    // Title
    ctx.textAlign = 'left';
    ctx.font = "bold 30px 'Plus Jakarta Sans', Arial, sans-serif";
    ctx.fillStyle = '#ffffff';
    ctx.fillText(title, x + paddingX, y + 44);

    // Body lines
    ctx.font = "400 25px 'Plus Jakarta Sans', Arial, sans-serif";
    ctx.fillStyle = '#f8faf8';
    lines.forEach((line, idx) => {
      const lineY = y + 84 + idx * lineHeight;
      if (lineY < y + computedH - 15) {
        ctx.fillText(line, x + paddingX, lineY);
      }
    });
    ctx.restore();

    return computedH;
  };

  if (isVertical) {
    // VERTICAL LAYOUT (Matches PDF Page 1)
    // -------------------------------------------------------------
    // Top Right Badges:
    const rightColW = 760;
    const rightColX = width - rightColW - 50;
    let rightY = 90;
    const gap = 18;

    rightY += drawPill('Origen:', especie.origen, rightColX, rightY, rightColW) + gap;
    rightY += drawPill('Habitat:', especie.habitat, rightColX, rightY, rightColW) + gap;
    rightY += drawPill('¿Es nativa de Barrancabermeja?:', especie.esNativa ? 'Sí' : 'No', rightColX, rightY, rightColW) + gap;
    rightY += drawPill('Importancia Ecologica:', especie.importanciaEcologica, rightColX, rightY, rightColW) + gap + 15;

    // Characteristics big box on bottom right
    const caracBoxH = bannerY - rightY - 50;
    drawCardBox('Características:', especie.caracteristicas, rightColX, rightY, rightColW, Math.max(280, caracBoxH));

    // Bottom Left Badges:
    const leftColW = 680;
    const leftColX = 50;
    let leftY = bannerY - 330;

    leftY += drawPill('Nombre Común:', especie.nombreComun, leftColX, leftY, leftColW) + gap;
    leftY += drawPill('Nombre Cientifico:', especie.nombreCientifico, leftColX, leftY, leftColW, true) + gap;
    drawPill('Especie:', especie.especie, leftColX, leftY, leftColW);

  } else {
    // HORIZONTAL LAYOUT (Matches PDF Page 2)
    // -------------------------------------------------------------
    const gap = 16;
    
    // Right column
    const rightColW = 860;
    const rightColX = width - rightColW - 60;
    let rightY = 50;

    rightY += drawPill('Origen:', especie.origen, rightColX, rightY, rightColW) + gap;
    rightY += drawPill('Habitat:', especie.habitat, rightColX, rightY, rightColW) + gap;
    rightY += drawPill('¿Es nativa de Barrancabermeja?:', especie.esNativa ? 'Sí' : 'No', rightColX, rightY, rightColW) + gap;
    rightY += drawPill('Importancia Ecologica:', especie.importanciaEcologica, rightColX, rightY, rightColW) + gap + 10;

    // Characteristics box below
    const caracBoxH = bannerY - rightY - 35;
    drawCardBox('Características:', especie.caracteristicas, rightColX, rightY, rightColW, Math.max(220, caracBoxH));

    // Bottom Left Badges:
    const leftColW = 760;
    const leftColX = 60;
    let leftY = bannerY - 320;

    leftY += drawPill('Nombre Común:', especie.nombreComun, leftColX, leftY, leftColW) + gap;
    leftY += drawPill('Nombre Cientifico:', especie.nombreCientifico, leftColX, leftY, leftColW, true) + gap;
    drawPill('Especie:', especie.especie, leftColX, leftY, leftColW);
  }

  return canvas;
}

/**
 * Downloads the framed A5 canvas as a high-resolution PNG
 */
export async function downloadA5FramedImage(especie: EspecieFotografia): Promise<void> {
  const canvas = await renderA5FramedCanvas(especie);
  const dataUrl = canvas.toDataURL('image/png', 0.95);
  const link = document.createElement('a');
  const safeName = especie.nombreComun.toLowerCase().replace(/[^a-z0-9]/gi, '_');
  link.download = `Huellas_Verdes_A5_${safeName}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
