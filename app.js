// Creador de Perfil Soberano - Lógica de la Aplicación
// Utiliza HTML5 Canvas para renderizar, manipular y exportar imágenes con marcos vectoriales.

// Precargar el diseño oficial png 1 aportado por el usuario
const officialFrameImg = new Image();
officialFrameImg.src = '/profile-desing-1.png';
officialFrameImg.onerror = () => {
  if (officialFrameImg.src !== window.location.origin + '/img-profile/profile-desing-1.png') {
    officialFrameImg.src = '/img-profile/profile-desing-1.png';
  }
};
officialFrameImg.onload = () => {
  if (typeof renderFramesGrid === 'function') {
    renderFramesGrid();
  }
  if (typeof drawCanvas === 'function') {
    drawCanvas();
  }
};

// Precargar el diseño oficial png 2 aportado por el usuario (Opción 3)
const officialFrame2Img = new Image();
officialFrame2Img.src = '/profile-desing-2.png';
officialFrame2Img.onerror = () => {
  if (officialFrame2Img.src !== window.location.origin + '/img-profile/profile-desing-2.png') {
    officialFrame2Img.src = '/img-profile/profile-desing-2.png';
  }
};
officialFrame2Img.onload = () => {
  if (typeof renderFramesGrid === 'function') {
    renderFramesGrid();
  }
  if (typeof drawCanvas === 'function') {
    drawCanvas();
  }
};

// --- CONFIGURACIÓN DE LOS MARCOS (Renders vectoriales en Canvas) ---

// Offscreen canvas para efectos de capa (desenfoque retrato)
const offscreenCanvas = document.createElement('canvas');
offscreenCanvas.width = 1080;
offscreenCanvas.height = 1080;
const offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });
// --- FUNCIÓN AUXILIAR: DIBUJAR TEXTO CURVADO EN EL ARCO INFERIOR ---
function drawCurvedText(ctx, str, centerX, centerY, radius, angleCenter, baseLetterSpacing, color, font) {
  ctx.save();
  ctx.fillStyle = color || '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Adaptar tamaño de la tipografía dinámicamente según longitud
  let fontSize = 42;
  if (str.length > 30) {
    fontSize = 28;
  } else if (str.length > 24) {
    fontSize = 32;
  } else if (str.length > 18) {
    fontSize = 36;
  }
  
  ctx.font = font ? font.replace(/\d+px/, `${fontSize}px`) : `bold ${fontSize}px Outfit, sans-serif`;
  
  // Medir cada letra y calcular su ángulo de giro en la circunferencia
  const charAngles = [];
  let totalAngle = 0;
  // Separación en píxeles (letra a letra)
  const letterSpacingPixels = str.length > 30 ? 3 : (str.length > 20 ? 5 : 8);
  
  for (let i = 0; i < str.length; i++) {
    const charWidth = ctx.measureText(str[i]).width;
    const charAngle = (charWidth + letterSpacingPixels) / radius;
    charAngles.push(charAngle);
    totalAngle += charAngle;
  }
  
  // Limitar el arco máximo para evitar que suba de las mitades (máximo 2.0 radianes / 115 grados)
  const maxSpanAngle = 2.0;
  if (totalAngle > maxSpanAngle) {
    const scaleFactor = maxSpanAngle / totalAngle;
    fontSize = Math.floor(fontSize * scaleFactor);
    ctx.font = font ? font.replace(/\d+px/, `${fontSize}px`) : `bold ${fontSize}px Outfit, sans-serif`;
    
    // Recalcular
    totalAngle = 0;
    for (let i = 0; i < str.length; i++) {
      const charWidth = ctx.measureText(str[i]).width;
      const charAngle = (charWidth + (letterSpacingPixels * scaleFactor)) / radius;
      charAngles[i] = charAngle;
      totalAngle += charAngle;
    }
  }
  
  // Dibujar desde la izquierda (mayor ángulo) hacia la derecha
  let currentAngle = angleCenter + totalAngle / 2;
  
  for (let i = 0; i < str.length; i++) {
    const charAngle = charAngles[i];
    currentAngle -= charAngle / 2;
    
    ctx.save();
    ctx.translate(centerX + Math.cos(currentAngle) * radius, centerY + Math.sin(currentAngle) * radius);
    ctx.rotate(currentAngle - Math.PI / 2);
    ctx.fillText(str[i], 0, 0);
    ctx.restore();
    
    currentAngle -= charAngle / 2;
  }
  
  ctx.restore();
}

// --- FUNCIÓN AUXILIAR: DIBUJAR TEXTO CURVADO EN EL ARCO SUPERIOR ---
function drawCurvedTextTop(ctx, str, centerX, centerY, radius, angleCenter, letterSpacing, color, font) {
  ctx.save();
  ctx.fillStyle = color || '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  let fontSize = 28;
  if (str.length > 24) {
    fontSize = 24;
  }
  
  ctx.font = font ? font.replace(/\d+px/, `${fontSize}px`) : `bold ${fontSize}px Outfit, sans-serif`;
  
  const charAngles = [];
  let totalAngle = 0;
  const letterSpacingPixels = str.length > 20 ? 5 : 8;
  
  for (let i = 0; i < str.length; i++) {
    const charWidth = ctx.measureText(str[i]).width;
    const charAngle = (charWidth + letterSpacingPixels) / radius;
    charAngles.push(charAngle);
    totalAngle += charAngle;
  }
  
  // Limitar arco superior a 2.0 radianes
  const maxSpanAngle = 2.0;
  if (totalAngle > maxSpanAngle) {
    const scaleFactor = maxSpanAngle / totalAngle;
    fontSize = Math.floor(fontSize * scaleFactor);
    ctx.font = font ? font.replace(/\d+px/, `${fontSize}px`) : `bold ${fontSize}px Outfit, sans-serif`;
    
    totalAngle = 0;
    for (let i = 0; i < str.length; i++) {
      const charWidth = ctx.measureText(str[i]).width;
      const charAngle = (charWidth + (letterSpacingPixels * scaleFactor)) / radius;
      charAngles[i] = charAngle;
      totalAngle += charAngle;
    }
  }
  
  // Dibujar desde la izquierda (menor ángulo) hacia la derecha
  let currentAngle = angleCenter - totalAngle / 2;
  
  for (let i = 0; i < str.length; i++) {
    const charAngle = charAngles[i];
    currentAngle += charAngle / 2;
    
    ctx.save();
    ctx.translate(centerX + Math.cos(currentAngle) * radius, centerY + Math.sin(currentAngle) * radius);
    ctx.rotate(currentAngle + Math.PI / 2);
    ctx.fillText(str[i], 0, 0);
    ctx.restore();
    
    currentAngle += charAngle / 2;
  }
  
  ctx.restore();
}

// --- CONFIGURACIÓN DE LOS MARCOS (Renders vectoriales en Canvas) ---
const FRAMES = [
  {
    id: 'frame-ciudadano',
    name: 'Ciudadano Colombiano',
    description: 'Borde tricolor con lema superior y banner inferior de alta visibilidad.',
    draw: (ctx, w, h, slogan) => {
      const centerX = w / 2;
      const centerY = h / 2;
      const radius = w / 2 - 20;

      // 1. Dibujar anillo exterior tricolor
      // Franja Amarilla (Exterior, mitad superior/izquierda)
      ctx.lineWidth = 24;
      ctx.strokeStyle = '#FCD116'; // Oro cálido
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 1.0 * Math.PI, 2.0 * Math.PI);
      ctx.stroke();

      // Franja Azul (Centro)
      ctx.lineWidth = 14;
      ctx.strokeStyle = '#003893'; // Azul profundo
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 10, 1.0 * Math.PI, 2.0 * Math.PI);
      ctx.stroke();

      // Franja Roja (Inferior/derecha)
      ctx.lineWidth = 24;
      ctx.strokeStyle = '#CE1126'; // Rojo carmesí
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 1.0 * Math.PI);
      ctx.stroke();

      // Anillo dorado de separación
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#D4AF37'; // Dorado metálico
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 20, 0, 2 * Math.PI);
      ctx.stroke();

      // 2. Banner inferior CURVADO para el lema principal (Garantiza caber en el círculo)
      ctx.save();
      // Dibujar arco relleno oscuro
      ctx.lineWidth = 85;
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.96)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 435, 0.20 * Math.PI, 0.80 * Math.PI);
      ctx.stroke();

      // Borde dorado superior del arco
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#FCD116';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 477, 0.20 * Math.PI, 0.80 * Math.PI);
      ctx.stroke();

      // Borde dorado inferior del arco
      ctx.beginPath();
      ctx.arc(centerX, centerY, 393, 0.20 * Math.PI, 0.80 * Math.PI);
      ctx.stroke();
      ctx.restore();

      // 3. Escribir texto curvado del lema
      drawCurvedText(ctx, slogan, centerX, centerY, 435, Math.PI / 2, 0.045, '#FFFFFF');

      // 4. Banner superior CURVADO para "SOBERANÍA NACIONAL" con estilo idéntico al lema inferior
      ctx.save();
      // Dibujar arco relleno oscuro
      ctx.lineWidth = 85; // Espesor unificado
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.96)';
      ctx.beginPath();
      // Arco superior de 1.30 * Math.PI a 1.70 * Math.PI (centrado en -Math.PI / 2)
      ctx.arc(centerX, centerY, 435, 1.30 * Math.PI, 1.70 * Math.PI);
      ctx.stroke();

      // Borde dorado superior del arco superior
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#FCD116';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 477, 1.30 * Math.PI, 1.70 * Math.PI);
      ctx.stroke();

      // Borde dorado inferior del arco superior
      ctx.beginPath();
      ctx.arc(centerX, centerY, 393, 1.30 * Math.PI, 1.70 * Math.PI);
      ctx.stroke();
      ctx.restore();

      // Escribir texto superior "YO ELIJO LA VIDA" curvado con el mismo estilo y tamaño proporcional
      drawCurvedTextTop(ctx, 'YO ELIJO LA VIDA', centerX, centerY, 435, -Math.PI / 2, 0.046, '#FFFFFF', 'bold 34px Outfit, sans-serif');
    }
  },
  {
    id: 'frame-ondeante',
    name: 'Tricolor Ondeante',
    description: 'Diseño premium con la textura de la bandera ondeante real y banners de texto.',
    draw: (ctx, w, h, slogan) => {
      const centerX = w / 2;
      const centerY = h / 2;

      // 1. Dibujar la bandera tricolor circular (imagen png)
      if (officialFrameImg.complete && officialFrameImg.naturalWidth !== 0) {
        ctx.drawImage(officialFrameImg, 0, 0, w, h);
      } else {
        // Fallback si la imagen no ha cargado aún
        ctx.lineWidth = 24;
        ctx.strokeStyle = '#FCD116';
        ctx.beginPath();
        ctx.arc(centerX, centerY, w / 2 - 20, 1.0 * Math.PI, 2.0 * Math.PI);
        ctx.stroke();
        ctx.lineWidth = 24;
        ctx.strokeStyle = '#CE1126';
        ctx.beginPath();
        ctx.arc(centerX, centerY, w / 2 - 20, 0, 1.0 * Math.PI);
        ctx.stroke();
      }

      // 2. Banner inferior CURVADO para el lema principal
      ctx.save();
      ctx.lineWidth = 85;
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.96)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 435, 0.20 * Math.PI, 0.80 * Math.PI);
      ctx.stroke();

      // Borde dorado superior del arco
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#FCD116';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 477, 0.20 * Math.PI, 0.80 * Math.PI);
      ctx.stroke();

      // Borde dorado inferior del arco
      ctx.beginPath();
      ctx.arc(centerX, centerY, 393, 0.20 * Math.PI, 0.80 * Math.PI);
      ctx.stroke();
      ctx.restore();

      // Escribir texto curvado del lema
      drawCurvedText(ctx, slogan, centerX, centerY, 435, Math.PI / 2, 0.045, '#FFFFFF');

      // 3. Banner superior CURVADO para "CIUDADANO COLOMBIANO"
      ctx.save();
      ctx.lineWidth = 85;
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.96)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 435, 1.30 * Math.PI, 1.70 * Math.PI);
      ctx.stroke();

      // Borde dorado superior del arco superior
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#FCD116';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 477, 1.30 * Math.PI, 1.70 * Math.PI);
      ctx.stroke();

      // Borde dorado inferior del arco superior
      ctx.beginPath();
      ctx.arc(centerX, centerY, 393, 1.30 * Math.PI, 1.70 * Math.PI);
      ctx.stroke();
      ctx.restore();

      // Escribir texto superior "CIUDADANO COLOMBIANO" curvado
      drawCurvedTextTop(ctx, 'CIUDADANO COLOMBIANO', centerX, centerY, 435, -Math.PI / 2, 0.046, '#FFFFFF', 'bold 34px Outfit, sans-serif');
    }
  },
  {
    id: 'frame-constitucion',
    name: 'Soberanía Patria',
    description: 'Segundo diseño oficial con la bandera de fondo y lema en el banner superior.',
    draw: (ctx, w, h, slogan) => {
      const centerX = w / 2;
      const centerY = h / 2;

      // 1. Dibujar la bandera tricolor circular (imagen png)
      if (officialFrame2Img.complete && officialFrame2Img.naturalWidth !== 0) {
        ctx.drawImage(officialFrame2Img, 0, 0, w, h);
      } else {
        // Fallback si la imagen no ha cargado aún
        ctx.lineWidth = 24;
        ctx.strokeStyle = '#003893';
        ctx.beginPath();
        ctx.arc(centerX, centerY, w / 2 - 20, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // 2. Banner superior CURVADO para el lema personalizable (Evita desbordes)
      ctx.save();
      ctx.lineWidth = 85;
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.96)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 435, 1.20 * Math.PI, 1.80 * Math.PI);
      ctx.stroke();

      // Borde dorado superior del arco superior
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#FCD116';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 477, 1.20 * Math.PI, 1.80 * Math.PI);
      ctx.stroke();

      // Borde dorado inferior del arco superior
      ctx.beginPath();
      ctx.arc(centerX, centerY, 393, 1.20 * Math.PI, 1.80 * Math.PI);
      ctx.stroke();
      ctx.restore();

      // Escribir el lema curvado arriba
      drawCurvedTextTop(ctx, slogan, centerX, centerY, 435, -Math.PI / 2, 0.046, '#FFFFFF', 'bold 34px Outfit, sans-serif');
    }
  }
];

// --- ESTADO DE LA APLICACIÓN ---
const state = {
  image: null,           // Objeto Image de HTML
  frameId: 'frame-ciudadano', // ID del marco seleccionado
  slogan: 'LA PATRIA SE DEFIENDE, NO SE VENDE', // Texto del lema
  
  // Transformaciones
  scale: 1.0,
  rotation: 0,           // en grados (-180 a 180)
  translateX: 0,
  translateY: 0,
  portraitBlur: 0,
  activeFilter: 'normal', // 'normal', 'watercolor', 'halftone', 'sketch', 'comic'
  
  // Filtros de color
  brightness: 100,
  contrast: 100,
  saturation: 100,
  
  // Interacción táctil / ratón
  isDragging: false,
  startX: 0,
  startY: 0,
  origTranslateX: 0,
  origTranslateY: 0
};

// --- ELEMENTOS DEL DOM ---
const canvas = document.getElementById('profileCanvas');
const ctx = canvas.getContext('2d');
const fileInput = document.getElementById('fileInput');
const uploadZone = document.getElementById('uploadZone');
const dragOverlay = document.getElementById('dragOverlay');
const framesGrid = document.getElementById('framesGrid');
const sliderZoom = document.getElementById('sliderZoom');
const sliderRotate = document.getElementById('sliderRotate');
const sliderBlur = document.getElementById('sliderBlur');
const sliderBrightness = document.getElementById('sliderBrightness');
const sliderContrast = document.getElementById('sliderContrast');
const sliderSaturation = document.getElementById('sliderSaturation');
const selectSlogan = document.getElementById('selectSlogan');
const btnDownload = document.getElementById('btnDownload');
const btnReset = document.getElementById('btnReset');
const btnAutoAdjust = document.getElementById('btnAutoAdjust');
const btnRotateCcw = document.getElementById('btnRotateCcw');
const btnRotateCw = document.getElementById('btnRotateCw');
const canvasHint = document.getElementById('canvasHint');

const toggleAdvancedAdjustments = document.getElementById('toggleAdvancedAdjustments');
const advancedAdjustments = document.getElementById('advancedAdjustments');
const btnFilterNormal = document.getElementById('btnFilterNormal');
const btnFilterComic = document.getElementById('btnFilterComic');

// Mockups
const mockupWhatsApp = document.getElementById('mockupWhatsApp');
const mockupInstagram = document.getElementById('mockupInstagram');
const mockupFacebook = document.getElementById('mockupFacebook');

// Elementos de Cámara Web
const btnOpenCamera = document.getElementById('btnOpenCamera');
const cameraModal = document.getElementById('cameraModal');
const btnCloseCamera = document.getElementById('btnCloseCamera');
const webcamVideo = document.getElementById('webcamVideo');
const btnCapturePhoto = document.getElementById('btnCapturePhoto');
const btnCancelCapture = document.getElementById('btnCancelCapture');
let webcamStream = null;

// --- INICIALIZACIÓN ---
function init() {
  setupEventListeners();
  renderFramesGrid();
  drawCanvas(); // Dibuja la pantalla inicial sin foto
  initChromaKeying(); // Iniciar superposición de croma a la izquierda
}

// --- RENDERIZAR MENÚ DE SELECCIÓN DE MARCOS ---
function renderFramesGrid() {
  framesGrid.innerHTML = '';
  FRAMES.forEach(frame => {
    const item = document.createElement('div');
    item.className = `frame-item ${frame.id === state.frameId ? 'active' : ''}`;
    item.dataset.id = frame.id;
    
    // Crear una miniatura dinámica del marco usando un mini-canvas
    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = 150;
    thumbCanvas.height = 150;
    thumbCanvas.className = 'frame-preview-thumb';
    const thumbCtx = thumbCanvas.getContext('2d');
    
    // Dibujar un fondo neutral en la miniatura
    thumbCtx.fillStyle = '#1e293b';
    thumbCtx.fillRect(0, 0, 150, 150);
    
    // Dibujar un avatar genérico en el fondo
    thumbCtx.fillStyle = '#475569';
    thumbCtx.beginPath();
    thumbCtx.arc(75, 55, 25, 0, 2 * Math.PI);
    thumbCtx.fill();
    thumbCtx.beginPath();
    thumbCtx.arc(75, 120, 40, 0, 2 * Math.PI);
    thumbCtx.fill();
    
    // Dibujar el marco a escala
    frame.draw(thumbCtx, 150, 150, 'LEMA');
    
    item.appendChild(thumbCanvas);
    
    const name = document.createElement('span');
    name.className = 'frame-name';
    name.textContent = frame.name;
    item.appendChild(name);
    
    item.addEventListener('click', () => {
      document.querySelectorAll('.frame-item').forEach(el => el.classList.remove('active'));
      item.classList.add('active');
      state.frameId = frame.id;
      drawCanvas();
    });
    
    framesGrid.appendChild(item);
  });
}

// --- CONTROLADOR DE EVENTOS ---
function setupEventListeners() {
  // Subida de archivos
  fileInput.addEventListener('change', handleFileSelect);
  uploadZone.addEventListener('click', () => fileInput.click());
  
  // Drag & Drop
  window.addEventListener('dragover', (e) => {
    e.preventDefault();
    dragOverlay.classList.add('active');
  });
  
  dragOverlay.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dragOverlay.classList.remove('active');
  });
  
  window.addEventListener('drop', (e) => {
    e.preventDefault();
    dragOverlay.classList.remove('active');
    if (e.dataTransfer.files.length > 0) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  });

  // Eventos de ratón sobre el canvas para arrastrar
  canvas.addEventListener('mousedown', startDrag);
  window.addEventListener('mousemove', drag);
  window.addEventListener('mouseup', endDrag);

  // Eventos táctiles para móviles
  canvas.addEventListener('touchstart', startDragTouch, { passive: false });
  window.addEventListener('touchmove', dragTouch, { passive: false });
  window.addEventListener('touchend', endDrag);

  // Controles de ajuste
  sliderZoom.addEventListener('input', (e) => {
    state.scale = parseFloat(e.target.value);
    drawCanvas();
  });
  
  sliderRotate.addEventListener('input', (e) => {
    state.rotation = parseInt(e.target.value);
    drawCanvas();
  });

  sliderBlur.addEventListener('input', (e) => {
    state.portraitBlur = parseInt(e.target.value);
    drawCanvas();
  });

  // Filtros
  sliderBrightness.addEventListener('input', (e) => {
    state.brightness = parseInt(e.target.value);
    drawCanvas();
  });
  sliderContrast.addEventListener('input', (e) => {
    state.contrast = parseInt(e.target.value);
    drawCanvas();
  });
  sliderSaturation.addEventListener('input', (e) => {
    state.saturation = parseInt(e.target.value);
    drawCanvas();
  });

  // Rotaciones rápidas
  btnRotateCcw.addEventListener('click', () => {
    state.rotation = (state.rotation - 90) % 360;
    if (state.rotation < -180) state.rotation += 360;
    sliderRotate.value = state.rotation;
    drawCanvas();
  });

  btnRotateCw.addEventListener('click', () => {
    state.rotation = (state.rotation + 90) % 360;
    if (state.rotation > 180) state.rotation -= 360;
    sliderRotate.value = state.rotation;
    drawCanvas();
  });

  // Restablecer ajustes
  btnReset.addEventListener('click', resetTransforms);

  // Auto-Ajustar
  if (btnAutoAdjust) {
    btnAutoAdjust.addEventListener('click', () => {
      state.contrast = 125;
      state.saturation = 150;
      state.brightness = 105;
      
      // Sincronizar sliders del DOM
      sliderContrast.value = 125;
      sliderSaturation.value = 150;
      sliderBrightness.value = 105;
      
      drawCanvas();
    });
  }

  // Selección de Lema
  selectSlogan.addEventListener('change', (e) => {
    state.slogan = e.target.value;
    drawCanvas();
  });

  // Filtros de efecto de estilo
  const filterButtons = {
    'normal': btnFilterNormal,
    'comic': btnFilterComic
  };

  Object.entries(filterButtons).forEach(([filterName, button]) => {
    if (button) {
      button.addEventListener('click', () => {
        // Remover clase activa de todos los botones de filtro
        Object.values(filterButtons).forEach(btn => {
          if (btn) btn.classList.remove('active');
        });
        // Agregar clase activa al presionado
        button.classList.add('active');
        state.activeFilter = filterName;

        // Abrir panel avanzado de luz/color automáticamente para filtros artísticos
        if (filterName !== 'normal') {
          advancedAdjustments.classList.remove('collapsed');
          toggleAdvancedAdjustments.classList.add('expanded');
        }
        
        drawCanvas();
      });
    }
  });

  // Descarga
  btnDownload.addEventListener('click', downloadProfileImage);

  // Acordeón de ajustes avanzados
  toggleAdvancedAdjustments.addEventListener('click', () => {
    const isExpanded = advancedAdjustments.classList.toggle('collapsed');
    toggleAdvancedAdjustments.classList.toggle('expanded', !isExpanded);
  });

  // Eventos de Cámara Web
  btnOpenCamera.addEventListener('click', openWebcam);
  btnCloseCamera.addEventListener('click', closeWebcam);
  btnCancelCapture.addEventListener('click', closeWebcam);
  btnCapturePhoto.addEventListener('click', captureWebcamPhoto);
}

// --- FUNCIONES DE CÁMARA WEB ---
async function openWebcam() {
  // Mostrar el modal inmediatamente para dar feedback de carga al usuario
  cameraModal.classList.remove('hidden');

  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('La API de cámara no está disponible o tu navegador no es compatible (requiere HTTPS o localhost).');
    }

    webcamStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1080 },
        height: { ideal: 1080 },
        facingMode: 'user'
      },
      audio: false
    });
    webcamVideo.srcObject = webcamStream;
  } catch (err) {
    console.error('Error al acceder a la cámara:', err);
    alert('No se pudo iniciar la cámara: ' + (err.name === 'NotAllowedError' ? 'Permiso denegado por el usuario.' : err.message));
    closeWebcam(); // Cerrar el modal si falla la carga
  }
}

function closeWebcam() {
  if (webcamStream) {
    webcamStream.getTracks().forEach(track => track.stop());
    webcamStream = null;
  }
  webcamVideo.srcObject = null;
  cameraModal.classList.add('hidden');
}

function captureWebcamPhoto() {
  if (!webcamStream) return;

  const tempCanvas = document.createElement('canvas');
  const videoW = webcamVideo.videoWidth || 720;
  const videoH = webcamVideo.videoHeight || 720;
  
  // Recorte cuadrado proporcional
  const size = Math.min(videoW, videoH);
  tempCanvas.width = 1080;
  tempCanvas.height = 1080;
  
  const tempCtx = tempCanvas.getContext('2d');
  
  // Dibujar y reflejar imagen de cámara en espejo
  tempCtx.save();
  tempCtx.translate(1080, 0);
  tempCtx.scale(-1, 1);
  
  const sx = (videoW - size) / 2;
  const sy = (videoH - size) / 2;
  tempCtx.drawImage(webcamVideo, sx, sy, size, size, 0, 0, 1080, 1080);
  tempCtx.restore();

  const capturedImg = new Image();
  capturedImg.onload = () => {
    state.image = capturedImg;
    resetTransforms();
    
    btnDownload.classList.remove('disabled');
    canvasHint.style.opacity = '1';
    
    uploadZone.innerHTML = `
      <i class="fa-solid fa-circle-check" style="color: var(--patria-gold); font-size: 2rem; margin-bottom: 0.5rem;"></i>
      <p class="upload-text" style="color: var(--patria-gold)">¡Foto capturada con éxito!</p>
      <span class="upload-sub">Haz clic para cambiar la foto</span>
    `;
    
    closeWebcam();
    drawCanvas();
  };
  capturedImg.src = tempCanvas.toDataURL('image/png');
}


// --- GESTIÓN DE SUBIDA DE IMAGEN ---
function handleFileSelect(e) {
  if (e.target.files.length > 0) {
    handleImageFile(e.target.files[0]);
  }
}

function handleImageFile(file) {
  if (!file.type.startsWith('image/')) {
    alert('Por favor sube solo archivos de imagen válidos.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      state.image = img;
      resetTransforms();
      
      // Activar botón de descarga
      btnDownload.classList.remove('disabled');
      canvasHint.style.opacity = '1';
      
      // Animación de subida en la zona de arrastre
      uploadZone.innerHTML = `
        <i class="fa-solid fa-circle-check" style="color: var(--patria-gold); font-size: 2rem; margin-bottom: 0.5rem;"></i>
        <p class="upload-text" style="color: var(--patria-gold)">¡Foto subida con éxito!</p>
        <span class="upload-sub">Haz clic para cambiar la foto</span>
      `;
      
      drawCanvas();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// --- RESETEAR PARÁMETROS DE POSICIÓN ---
function resetTransforms() {
  state.scale = 1.0;
  state.rotation = 0;
  state.translateX = 0;
  state.translateY = 0;
  state.brightness = 100;
  state.contrast = 100;
  state.saturation = 100;
  state.portraitBlur = 0;
  state.activeFilter = 'normal';
  
  // Sincronizar sliders del DOM
  sliderZoom.value = 1;
  sliderRotate.value = 0;
  sliderBrightness.value = 100;
  sliderContrast.value = 100;
  sliderSaturation.value = 100;
  sliderBlur.value = 0;

  // Restaurar botones de filtro
  const filterBtns = [btnFilterNormal, btnFilterComic];
  filterBtns.forEach(btn => {
    if (btn) btn.classList.remove('active');
  });
  if (btnFilterNormal) btnFilterNormal.classList.add('active');
  
  drawCanvas();
}

// --- FILTRO DE EFECTO CÓMIC VECTORIAL (Pop Art Duotone) ---
function applyComicFilter(cContext, w, h) {
  const imgData = cContext.getImageData(0, 0, w, h);
  const data = imgData.data;
  
  // 1. Crear un búfer de escala de grises
  const grayscale = new Uint8Array(w * h);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i+1];
    const b = data[i+2];
    // Luminancia estándar NTSC
    grayscale[i / 4] = 0.299 * r + 0.587 * g + 0.114 * b;
  }
  
  // 2. Aplicar un filtro de suavizado de caja de 3x3 para reducir el ruido
  const smoothed = new Uint8Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let sum = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          sum += grayscale[(y + ky) * w + (x + kx)];
        }
      }
      smoothed[y * w + x] = sum / 9;
    }
  }
  
  // Rellenar bordes extremos del búfer suavizado
  for (let x = 0; x < w; x++) {
    smoothed[x] = grayscale[x];
    smoothed[(h - 1) * w + x] = grayscale[(h - 1) * w + x];
  }
  for (let y = 0; y < h; y++) {
    smoothed[y * w] = grayscale[y * w];
    smoothed[y * w + (w - 1)] = grayscale[y * w + (w - 1)];
  }

  // Helper de color tricolor patriótico (interpolado)
  const rgbTemp = [0, 0, 0];
  function getPopArtColor(grayVal, outRgb) {
    // Paleta Pop-Art retro con transiciones de color para dar volumen 3D:
    // gray < 50 (Sombras profundas): Morado/azul muy oscuro (#110b22) -> RGB: 17, 11, 34
    // 50 <= gray < 85 (Sombras de piel/cabello): Morado/marrón oscuro (#3e1e47) -> RGB: 62, 30, 71
    // 85 <= gray < 125 (Sombras cálidas): Rojo terracota vibrante (#c8384d) -> RGB: 200, 56, 77
    // 125 <= gray < 170 (Tonos medios): Naranja cálido / melocotón (#e2783f) -> RGB: 226, 120, 63
    // 170 <= gray < 215 (Luces altas): Amarillo cálido brillante (#ffd53d) -> RGB: 255, 213, 61
    // gray >= 215 (Reflejos/Brillos especulares): Celeste cian eléctrico (#74d6fe) -> RGB: 116, 214, 254
    if (grayVal < 50) {
      outRgb[0] = 17;  outRgb[1] = 11;  outRgb[2] = 34;
    } else if (grayVal < 85) {
      outRgb[0] = 62;  outRgb[1] = 30;  outRgb[2] = 71;
    } else if (grayVal < 125) {
      outRgb[0] = 200; outRgb[1] = 56;  outRgb[2] = 77;
    } else if (grayVal < 170) {
      outRgb[0] = 226; outRgb[1] = 120; outRgb[2] = 63;
    } else if (grayVal < 215) {
      outRgb[0] = 255; outRgb[1] = 213; outRgb[2] = 61;
    } else {
      outRgb[0] = 116; outRgb[1] = 214; outRgb[2] = 254;
    }
  }

  // 3. Procesar píxel a píxel e inyectar líneas de contorno oscuras (Entintado)
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      const sGray = smoothed[y * w + x];
      
      // Sobel simplificado sobre el búfer suavizado (genera bordes lisos, sin ruido)
      const gx = smoothed[y * w + (x + 1)] - smoothed[y * w + (x - 1)];
      const gy = smoothed[(y + 1) * w + x] - smoothed[(y - 1) * w + x];
      const edge = Math.sqrt(gx * gx + gy * gy);
      
      if (edge > 20) {
        // Tinta negra azulada profunda (#110b22)
        data[idx] = 17;
        data[idx+1] = 11;
        data[idx+2] = 34;
      } else {
        // Posterizar el gris suavizado a 10 niveles
        const posterized = Math.round(sGray / 25) * 25;
        getPopArtColor(posterized, rgbTemp);
        
        data[idx] = rgbTemp[0];
        data[idx+1] = rgbTemp[1];
        data[idx+2] = rgbTemp[2];
      }
    }
  }
  cContext.putImageData(imgData, 0, 0);
}

// --- LÓGICA DE DIBUJO EN CANVAS ---
function drawCanvas() {
  const w = canvas.width;
  const h = canvas.height;

  // 1. Limpiar lienzo
  ctx.clearRect(0, 0, w, h);

  // Dibujar un fondo neutro oscuro si no hay imagen
  if (!state.image) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);
    
    // Dibujar silueta de perfil placeholder
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2 - 40, 160, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(w / 2, h + 150, 320, 0, 2 * Math.PI);
    ctx.fill();
    
    // Mensaje informativo inicial en el lienzo
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = 'bold 36px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SUBE TU FOTO PARA EMPEZAR', w / 2, h / 2 + 180);
    
    // Dibujar el marco seleccionado de todas formas en la parte superior para mostrar vista previa
    const activeFrame = FRAMES.find(f => f.id === state.frameId) || FRAMES[0];
    activeFrame.draw(ctx, w, h, state.slogan);
    
    // Actualizar mockups vacíos
    updateMockups();
    return;
  }

  // 2. Dibujar la fotografía del usuario con transformaciones y Filtros
  const imgRatio = state.image.width / state.image.height;
  let drawW = w;
  let drawH = h;

  if (imgRatio > 1) {
    drawW = h * imgRatio;
  } else {
    drawH = w / imgRatio;
  }

  // A. Preparar la imagen principal transformada en el offscreenCanvas
  offscreenCtx.clearRect(0, 0, w, h);
  offscreenCtx.save();
  offscreenCtx.filter = `brightness(${state.brightness}%) contrast(${state.contrast}%) saturate(${state.saturation}%)`;
  offscreenCtx.translate(w / 2 + state.translateX, h / 2 + state.translateY);
  offscreenCtx.rotate((state.rotation * Math.PI) / 180);
  offscreenCtx.scale(state.scale, state.scale);
  offscreenCtx.drawImage(state.image, -drawW / 2, -drawH / 2, drawW, drawH);
  offscreenCtx.restore();

  // B. Aplicar el filtro artístico seleccionado en el offscreenCanvas
  if (state.activeFilter === 'comic') {
    applyComicFilter(offscreenCtx, w, h);
  }

  // C. Renderizar al lienzo principal (con o sin desenfoque retrato)
  if (state.portraitBlur > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w / 2 - 20, 0, 2 * Math.PI);
    ctx.clip();

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);

    // Dibujar fondo desenfocado (del mismo offscreenCanvas procesado)
    ctx.save();
    ctx.filter = `blur(${state.portraitBlur}px)`;
    ctx.drawImage(offscreenCanvas, 0, 0);
    ctx.restore();

    // Dibujar la capa nítida enmascarada con degradado radial
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = w;
    maskCanvas.height = h;
    const maskCtx = maskCanvas.getContext('2d');
    maskCtx.drawImage(offscreenCanvas, 0, 0);

    maskCtx.save();
    maskCtx.globalCompositeOperation = 'destination-in';
    const maskGrad = maskCtx.createRadialGradient(w / 2, h / 2, 220, w / 2, h / 2, 500);
    maskGrad.addColorStop(0, 'rgba(0, 0, 0, 1.0)');
    maskGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.7)');
    maskGrad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
    maskCtx.fillStyle = maskGrad;
    maskCtx.fillRect(0, 0, w, h);
    maskCtx.restore();

    ctx.drawImage(maskCanvas, 0, 0);
    ctx.restore();
  } else {
    // Dibujo normal sin desenfoque (nitidez completa)
    ctx.save();
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w / 2 - 20, 0, 2 * Math.PI);
    ctx.clip();

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);

    ctx.drawImage(offscreenCanvas, 0, 0);
    ctx.restore();
  }

  // 3. Dibujar el marco seleccionado en la parte superior
  const activeFrame = FRAMES.find(f => f.id === state.frameId) || FRAMES[0];
  activeFrame.draw(ctx, w, h, state.slogan);

  // 4. Actualizar previsualizaciones de redes sociales
  updateMockups();
}

// --- ARRASTRAR Y POSICIONAR LA FOTO EN EL CANVAS ---
function startDrag(e) {
  if (!state.image) return;

  // Evitar arrastre si el click está fuera del círculo del marco
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const activeRadius = (rect.width / 2) * 0.96; // 96% del radio del canvas
  const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
  
  if (distance > activeRadius) return;

  state.isDragging = true;
  state.startX = e.clientX;
  state.startY = e.clientY;
  state.origTranslateX = state.translateX;
  state.origTranslateY = state.translateY;
}

function startDragTouch(e) {
  if (!state.image || e.touches.length === 0) return;

  // Evitar arrastre y permitir scroll nativo si el toque está fuera del círculo
  const rect = canvas.getBoundingClientRect();
  const x = e.touches[0].clientX - rect.left;
  const y = e.touches[0].clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const activeRadius = (rect.width / 2) * 0.96; // 96% del radio del canvas
  const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
  
  if (distance > activeRadius) return;

  e.preventDefault(); // Evitar scroll de pantalla en móvil SOLO si arrastramos la foto
  state.isDragging = true;
  state.startX = e.touches[0].clientX;
  state.startY = e.touches[0].clientY;
  state.origTranslateX = state.translateX;
  state.origTranslateY = state.translateY;
}

function drag(e) {
  if (!state.isDragging) return;
  
  const dx = e.clientX - state.startX;
  const dy = e.clientY - state.startY;
  
  // Escalar los píxeles arrastrados a la escala real del Canvas en pantalla
  const displayScale = canvas.width / canvas.clientWidth;
  state.translateX = state.origTranslateX + dx * displayScale;
  state.translateY = state.origTranslateY + dy * displayScale;
  
  drawCanvas();
}

function dragTouch(e) {
  if (!state.isDragging || e.touches.length === 0) return;
  e.preventDefault();
  
  const dx = e.touches[0].clientX - state.startX;
  const dy = e.touches[0].clientY - state.startY;
  
  const displayScale = canvas.width / canvas.clientWidth;
  state.translateX = state.origTranslateX + dx * displayScale;
  state.translateY = state.origTranslateY + dy * displayScale;
  
  drawCanvas();
}

function endDrag() {
  state.isDragging = false;
}

// --- ACTUALIZAR MOCKUPS DE REDES SOCIALES ---
function updateMockups() {
  // Convertir canvas a imagen para alimentar los mockups
  const dataUrl = canvas.toDataURL('image/png');
  
  mockupWhatsApp.src = dataUrl;
  mockupInstagram.src = dataUrl;
  mockupFacebook.src = dataUrl;
}

// --- DESCARGAR IMAGEN DE PERFIL ---
async function downloadProfileImage() {
  if (!state.image) return;

  // Limpiar espacios en blanco y caracteres extraños para el nombre de archivo (remover acentos)
  const cleanSlogan = state.slogan.trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, '_');
  const filename = `perfil_soberano_${cleanSlogan || 'colombia'}.png`;

  // Intentar usar la API de File System Access (abre diálogo nativo de guardar como en Chrome/Edge)
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: 'Imagen PNG',
          accept: {
            'image/png': ['.png'],
          },
        }],
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert('Hubo un error al generar la imagen.');
          return;
        }
        try {
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
        } catch (writeErr) {
          console.error('Error al escribir el archivo:', writeErr);
          alert('No se pudo guardar el archivo en la ubicación seleccionada.');
        }
      }, 'image/png');
      return; // Completado con éxito usando la API nativa
    } catch (err) {
      // Si el usuario cancela la ventana de guardado, salimos silenciosamente
      if (err.name === 'AbortError') {
        console.log('El usuario canceló la selección de guardado.');
        return;
      }
      console.warn('showSaveFilePicker falló o fue cancelado, usando fallback tradicional:', err);
    }
  }

  // Fallback tradicional con enlace <a> para navegadores no compatibles (Firefox, Safari, etc.)
  canvas.toBlob((blob) => {
    if (!blob) {
      console.error('Error al generar la imagen.');
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Liberar la memoria de la URL de objeto creada
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  }, 'image/png');
}

// --- PROCESAMIENTO DE SUPERPOSICIÓN DE CROMA (INDÍGENA) ---
function initChromaKeying() {
  const video = document.getElementById('chromaVideo');
  const canvas = document.getElementById('chromaCanvas');
  if (!video || !canvas) return;

  const ctx = canvas.getContext('2d');
  
  // Canvas oculto para procesar píxeles a velocidad nativa
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });

  function processFrame() {
    if (video.paused || video.ended) {
      requestAnimationFrame(processFrame);
      return;
    }

    const vW = video.videoWidth;
    const vH = video.videoHeight;
    if (vW && vH) {
      // Ajustar resolución del canvas al tamaño real del video para evitar pixelados
      if (canvas.width !== vW) {
        canvas.width = vW;
        canvas.height = vH;
        tempCanvas.width = vW;
        tempCanvas.height = vH;
      }

      // Dibujar fotograma en offscreen
      tempCtx.drawImage(video, 0, 0, vW, vH);

      // Extraer array de píxeles
      const imgData = tempCtx.getImageData(0, 0, vW, vH);
      const data = imgData.data;

      // Procesamiento de croma keying + descontaminación (spill reduction)
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];

        // Detección de verde: Dominancia del componente G
        if (g > 85 && g > r * 1.15 && g > b * 1.15) {
          data[i+3] = 0; // Transparencia total
        } else {
          // Descontaminación de bordes verdes
          if (g > r && g > b) {
            data[i+1] = (r + b) / 2; // Suaviza halos verdes mezclando R y B
          }
        }
      }

      // Escribir píxeles procesados en el canvas visible
      ctx.putImageData(imgData, 0, 0);
    }

    requestAnimationFrame(processFrame);
  }

  video.addEventListener('play', () => {
    requestAnimationFrame(processFrame);
  });

  if (!video.paused) {
    requestAnimationFrame(processFrame);
  }
}

// Inicializar al cargar el script
init();
