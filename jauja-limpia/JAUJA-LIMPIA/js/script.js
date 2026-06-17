// JAUJA LIMPIA - JavaScript
// Autor: Desarrollador Full Stack
// Versión: 1.0

// ========================================
// FUNCIONES DE UTILIDAD
// ========================================

/**
 * Formatea una fecha en formato dd/mm/yyyy
 * @param {Date} date - Fecha a formatear
 * @returns {string} Fecha formateada
 */
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

/**
 * Formatea una hora en formato HH:MM:SS
 * @param {Date} date - Fecha y hora a formatear
 * @returns {string} Hora formateada
 */
function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

/**
 * Actualiza la fecha y hora en la interfaz
 */
function updateDateTime() {
    const now = new Date();
    document.getElementById('fechaActual').textContent = formatDate(now);
    document.getElementById('horaActual').textContent = formatTime(now);
}

/**
 * Genera coordenadas aleatorias para simulación
 * @returns {Object} Coordenadas aleatorias
 */
function generateRandomCoordinates() {
    const lat = 10.0 + (Math.random() * 0.5);
    const lng = -75.0 + (Math.random() * 0.5);
    return {
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6),
        formatted: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    };
}

/**
 * Actualiza las estadísticas
 */
function updateStats() {
    const stats = {
        totalReportes: parseInt(localStorage.getItem('totalReportes')) || 0,
        totalFotos: parseInt(localStorage.getItem('totalFotos')) || 0,
        totalCiudadanos: parseInt(localStorage.getItem('totalCiudadanos')) || 0,
        totalZonas: parseInt(localStorage.getItem('totalZonas')) || 0
    };

    document.getElementById('totalReportes').textContent = stats.totalReportes;
    document.getElementById('totalFotos').textContent = stats.totalFotos;
    document.getElementById('totalCiudadanos').textContent = stats.totalCiudadanos;
    document.getElementById('totalZonas').textContent = stats.totalZonas;
}

/**
 * Incrementa una estadística
 * @param {string} key - Clave de la estadística
 */
function incrementStat(key) {
    const current = parseInt(localStorage.getItem(key)) || 0;
    localStorage.setItem(key, (current + 1).toString());
    updateStats();
}

/**
 * Muestra una notificación temporal
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación (success, error, info)
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 2000;
        animation: slideIn 0.3s ease;
        ${type === 'success' ? 'background: linear-gradient(135deg, #28a745, #20c997);' :
         type === 'error' ? 'background: linear-gradient(135deg, #dc3545, #e74c3c);' :
         'background: linear-gradient(135deg, #0066cc, #004499);'}
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

/**
 * Valida un formulario
 * @param {HTMLFormElement} form - Formulario a validar
 * @returns {boolean} Resultado de la validación
 */
function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('shake');
            setTimeout(() => field.classList.remove('shake'), 500);
        }
    });

    return isValid;
}

/**
 * Procesa las imágenes seleccionadas
 * @param {FileList} files - Lista de archivos
 * @returns {Promise} Promesa con las vistas previas
 */
function processSelectedImages(files) {
    return new Promise((resolve) => {
        const previewContainer = document.getElementById('preview-container');
        previewContainer.innerHTML = '';

        Array.from(files).forEach((file, index) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const preview = document.createElement('img');
                    preview.src = e.target.result;
                    preview.className = 'preview-image hover-scale';
                    previewContainer.appendChild(preview);

                    if (index === Array.from(files).length - 1) {
                        resolve();
                    }
                };
                reader.readAsDataURL(file);

                incrementStat('totalFotos');
            }
        });
    });
}

// ========================================
// MANEJADORES DE EVENTOS
// ========================================

/**
 * Maneja el evento de envío del formulario
 * @param {Event} event - Evento de envío
 */
async function handleFormSubmit(event) {
    event.preventDefault();

    const form = event.target;

    if (!validateForm(form)) {
        showNotification('Por favor, complete todos los campos requeridos', 'error');
        return;
    }

    const submitButton = form.querySelector('.submit-button');
    const originalText = submitButton.querySelector('span').textContent;

    submitButton.disabled = true;
    submitButton.querySelector('span').textContent = 'Enviando...';

    try {
        const formData = new FormData(form);

        incrementStat('totalReportes');
        incrementStat('totalCiudadanos');
        incrementStat('totalZonas');

        await new Promise(resolve => setTimeout(resolve, 1500));

        showNotification('¡Reporte enviado correctamente!', 'success');

        form.reset();
        document.getElementById('preview-container').innerHTML = '';
        document.getElementById('coordenadas').style.display = 'none';

        setTimeout(() => {
            showSuccessModal();
        }, 1000);

    } catch (error) {
        showNotification('Error al enviar el reporte. Por favor, intente nuevamente.', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.querySelector('span').textContent = originalText;
    }
}

/**
 * Muestra el modal de éxito
 */
function showSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.classList.add('show');

    setTimeout(() => {
        modal.scrollTop = 0;
    }, 100);
}

/**
 * Cierra el modal de éxito
 */
function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.classList.remove('show');
}

/**
 * Maneja el evento de cambio en el input de archivos
 * @param {Event} event - Evento de cambio
 */
async function handleFileInputChange(event) {
    const files = event.target.files;
    if (files.length > 0) {
        await processSelectedImages(files);
    }
}

/**
 * Maneja el evento de arrastre sobre el área de carga
 * @param {Event} event - Evento de arrastre
 */
function handleDragOver(event) {
    event.preventDefault();
    const fileUpload = event.target.closest('.file-upload');
    if (fileUpload) {
        fileUpload.classList.add('dragover');
    }
}

/**
 * Maneja el evento de salida del área de carga
 * @param {Event} event - Evento de salida
 */
function handleDragLeave(event) {
    event.preventDefault();
    const fileUpload = event.target.closest('.file-upload');
    if (fileUpload) {
        fileUpload.classList.remove('dragover');
    }
}

/**
 * Maneja el evento de soltar archivos
 * @param {Event} event - Evento de soltar
 */
async function handleDrop(event) {
    event.preventDefault();
    const fileUpload = event.target.closest('.file-upload');
    if (fileUpload) {
        fileUpload.classList.remove('dragover');
    }

    const files = event.dataTransfer.files;
    if (files.length > 0) {
        await processSelectedImages(files);
    }
}

/**
 * Maneja el evento de clic en el botón de GPS
 * @param {Event} event - Evento de clic
 */
function handleGpsButtonClick(event) {
    const button = event.target.closest('#btnGps');
    if (button) {
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Obteniendo ubicación...';
        button.disabled = true;

        setTimeout(() => {
            const coords = generateRandomCoordinates();
            document.getElementById('coordsText').textContent = coords.formatted;
            document.getElementById('coordenadas').style.display = 'block';
            button.innerHTML = '<i class="fas fa-map-marker-alt"></i> Obtener ubicación GPS';
            button.disabled = false;
            showNotification('Coordenadas obtenidas correctamente', 'success');
        }, 2000);
    }
}

/**
 * Inicializa el formulario
 */
function initializeForm() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    updateStats();

    const form = document.getElementById('reportForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    const fileInput = document.getElementById('foto');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileInputChange);
    }

    const fileUpload = document.querySelector('.file-upload');
    if (fileUpload) {
        fileUpload.addEventListener('dragover', handleDragOver);
        fileUpload.addEventListener('dragleave', handleDragLeave);
        fileUpload.addEventListener('drop', handleDrop);
    }

    const gpsButton = document.getElementById('btnGps');
    if (gpsButton) {
        gpsButton.addEventListener('click', handleGpsButtonClick);
    }

    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
        closeModal.addEventListener('click', closeSuccessModal);
    }

    const modal = document.getElementById('successModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeSuccessModal();
            }
        });
    }

    showNotification('¡Bienvenido a JAUJA LIMPIA! Por favor complete el formulario para reportar problemas de limpieza.', 'info');
}

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initializeForm();
});

// Agregar estilos para las animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);