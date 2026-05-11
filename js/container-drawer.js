// js/container-drawer.js

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

export async function drawResponsiveContainer(ctx, text, styleConfig, globalStyles, scaleFactor) {
    // 1. Carga de imágenes (sin cambios)
    const [leftCap, middle, rightCap] = await Promise.all([
        loadImage('svg/container-left.svg'),
        loadImage('svg/container-middle.svg'),
        loadImage('svg/container-right.svg')
    ]);

    // 2. Medición del texto (sin cambios)
    const fontFamily = styleConfig.fontFamily || globalStyles.fontFamily;
    ctx.font = `${styleConfig.weight} ${styleConfig.size * scaleFactor}px ${fontFamily}`;
    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;

    // --- ¡LÓGICA DE ESCALADO Y POSICIONAMIENTO CORREGIDA! ---

    // 3. Definimos nuestras variables de diseño y proporciones
    const padding = 15 * scaleFactor;
    const overlap = 2 * scaleFactor;
    
    // ¡CLAVE 1: La altura objetivo es la misma para TODAS las piezas!
    const targetCapHeight = styleConfig.height * scaleFactor; 
    
    // El ancho de la parte del MEDIO que se estirará (basado en el texto).
    const middleWidth = textWidth + padding * 2;

    // ¡CLAVE 2: Calculamos el ANCHO de las tapas para que sea proporcional a la ALTURA objetivo!
    // Fórmula: nuevoAncho = (anchoOriginal / altoOriginal) * nuevaAltura
    const leftCapPropWidth = (leftCap.width / leftCap.height) * targetCapHeight;
    const rightCapPropWidth = (rightCap.width / rightCap.height) * targetCapHeight;
    
    // 4. Calculamos las posiciones X e Y (ahora más simple)
    const x = styleConfig.x * scaleFactor;
    
    // Como todas las piezas ahora tienen la misma altura, usamos UNA SOLA posición Y.
    const containerY = (styleConfig.y * scaleFactor) - (targetCapHeight / 1.5); 

    // 5. Dibujamos en orden para el efecto de capas (usando los nuevos anchos)
    
    // Tapa Izquierda (ahora con el ancho proporcional correcto)
    ctx.drawImage(
        leftCap, 
        x, 
        containerY, 
        leftCapPropWidth, // Ancho proporcional
        targetCapHeight   // Altura objetivo
    );

    // Tapa Derecha
    const rightCapX = x + leftCapPropWidth + middleWidth;
    ctx.drawImage(
        rightCap, 
        rightCapX, 
        containerY, 
        rightCapPropWidth, // Ancho proporcional
        targetCapHeight    // Altura objetivo
    );

    // Medio (se dibuja al final para quedar por encima)
    const middleX = x + leftCapPropWidth - overlap;
    const middleDrawingWidth = middleWidth + (overlap * 2);
    ctx.drawImage(
        middle, 
        middleX, 
        containerY, 
        middleDrawingWidth,
        targetCapHeight // Usamos la misma altura objetivo
    );

    // 6. Finalmente, dibujamos el texto encima de todo.
    ctx.fillStyle = styleConfig.color;
    // La posición X del texto ahora depende del nuevo ancho de la tapa izquierda.
    ctx.fillText(text, x + leftCapPropWidth + padding, styleConfig.y * scaleFactor);
}