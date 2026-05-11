// js/main.js

import { templateStyles } from './styles-config.js';
import { drawResponsiveContainer } from './container-drawer.js';

document.addEventListener('DOMContentLoaded', () => {

    const canvas = document.getElementById('signature-canvas');
    const ctx = canvas.getContext('2d');
    const inputs = document.querySelectorAll('#signature-form input');
    const tabs = document.querySelectorAll('.tab-button');
    const downloadBtn = document.getElementById('download-btn');
    const direccionField = document.getElementById('field-direccion');

    const scaleFactor = 2;
    let currentTemplateSrc = 'img/template_PEPS.png';

    function updateFormVisibility(templateKey) {
        direccionField.style.display = 'block';
        const templatesWithoutDireccion = ['template_arai.png'];
        if (templatesWithoutDireccion.includes(templateKey)) {
            direccionField.style.display = 'none';
        }
    }

    async function drawSignature() {
        const templateImg = new Image();
        templateImg.src = currentTemplateSrc;

        templateImg.onload = async () => {
            const key = currentTemplateSrc.replace('img/', '');
            const styles = templateStyles[key];
            if (!styles) return;

            const originalWidth = templateImg.naturalWidth;
            const originalHeight = templateImg.naturalHeight;
            const targetWidth = styles.width;
            const targetHeight = (originalHeight / originalWidth) * targetWidth;
            canvas.width = targetWidth * scaleFactor;
            canvas.height = targetHeight * scaleFactor;
            canvas.style.width = `${targetWidth}px`;
            canvas.style.height = `${targetHeight}px`;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);

            const nombre = document.getElementById('nombre').value;
            const apellido = document.getElementById('apellido').value;
            const cargo = document.getElementById('cargo').value;
            const telefono = document.getElementById('telefono').value;
            const correo = document.getElementById('correo').value;
            const direccion = document.getElementById('direccion').value;
            
            // CORRECCIÓN: Función drawText mejorada
            const drawText = (text, style) => {
                if (!style || !text) return;
                const fontFamily = style.fontFamily || styles.fontFamily;
                const fontStyle = style.style || 'normal';
                ctx.font = `${fontStyle} ${style.weight} ${style.size * scaleFactor}px ${fontFamily}`;
                ctx.fillStyle = style.color;
                ctx.fillText(text, style.x * scaleFactor, style.y * scaleFactor);
            };

            if (key === 'template_volemos.png') {
                drawText(nombre, styles.nombre);
                drawText(apellido, styles.apellido);
            } else {
                drawText(`${nombre} ${apellido}`, styles.nombre);
            }

            if (styles.cargo && styles.cargo.useContainer) {
                await drawResponsiveContainer(ctx, cargo, styles.cargo, styles, scaleFactor);
            } else {
                drawText(cargo, styles.cargo);
            }

            drawText(telefono, styles.telefono);
            drawText(correo, styles.correo);
            
            if (styles.direccion) {
                const styleDireccion = styles.direccion;
                let line1 = direccion;
                let line2 = '';
                const maxLineLength = styleDireccion.maxLineLength || 999;

                if (direccion.length > maxLineLength) {
                    let splitIndex = direccion.lastIndexOf(' ', maxLineLength);
                    if (splitIndex === -1) splitIndex = direccion.indexOf(' ', maxLineLength);
                    if (splitIndex !== -1) {
                        line1 = direccion.substring(0, splitIndex);
                        line2 = direccion.substring(splitIndex + 1);
                    }
                }
                drawText(line1, styleDireccion);
                if (line2) {
                    const styleLine2 = { ...styleDireccion, y: styleDireccion.y + styleDireccion.lineHeight };
                    drawText(line2.trim(), styleLine2);
                }
            }
        };
    }

    inputs.forEach(input => {
        input.addEventListener('input', drawSignature);
    });
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const newTemplateFile = tab.dataset.template;
            currentTemplateSrc = `img/${newTemplateFile}`;
            
            updateFormVisibility(newTemplateFile);
            drawSignature();
        });
    });

    downloadBtn.addEventListener('click', () => {
        const nombreValue = document.getElementById('nombre').value || 'Nombre';
        const apellidoValue = document.getElementById('apellido').value || 'Apellido';
        const key = currentTemplateSrc.replace('img/', '');
        const styles = templateStyles[key];
        const companyValue = styles.companyName || 'Empresa';
        const sanitizeFilename = (text) => text.replace(/ /g, '-').replace(/[^a-zA-Z0-9-]/g, '');
        const safeCompany = sanitizeFilename(companyValue);
        const safeNombre = sanitizeFilename(nombreValue);
        const safeApellido = sanitizeFilename(apellidoValue);
        const fileName = `Firma-${safeCompany}-${safeNombre}-${safeApellido}.png`;
        const link = document.createElement('a');
        link.download = fileName;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });

    document.fonts.ready.then(() => {
        console.log('Fuentes cargadas, dibujando firma inicial.');
        updateFormVisibility(currentTemplateSrc.replace('img/', ''));
        drawSignature();
    });
});