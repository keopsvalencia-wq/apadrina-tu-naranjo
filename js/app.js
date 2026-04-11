// Manejo del Header en scroll
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 10) {
        header.classList.add('shadow-md');
    } else {
        header.classList.remove('shadow-md');
    }
});

// Funciones para modales
function openModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevenir scroll de fondo
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
    document.body.style.overflow = 'auto'; // Restaurar scroll
}

// Envío del Formulario de Dudas
async function submitDudas(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    try {
        await fetch('https://formsubmit.co/ajax/info@apadrinatunaranjo.es', {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            },
            body: formData
        });
        
        // Mostrar estado de éxito
        document.getElementById('dudas-form-container').classList.add('hidden');
        document.getElementById('dudas-success').classList.remove('hidden');
        
        form.reset();
    } catch (error) {
        console.error('Error enviando formulario:', error);
        alert('Hubo un error al enviar el mensaje. Por favor, inténtelo de nuevo.');
    }
}


// Update Contract en tiempo real
function updateContract() {
    const nombre = document.getElementById('reserva-nombre').value;
    const dni = document.getElementById('reserva-dni').value;
    const direccion = document.getElementById('reserva-direccion').value;

    document.getElementById('doc-nombre').textContent = nombre || '[Tu Nombre]';
    document.getElementById('doc-dni').textContent = dni || '[Tu DNI]';
    document.getElementById('doc-direccion').textContent = direccion || '[Tu Dirección]';
    
    // Updates para firma
    document.getElementById('doc-firma').textContent = nombre ? nombre : '';
    document.getElementById('doc-firma-nombre').textContent = nombre || '[Nombre Padrino]';
}

// Envío Formulario Reserva y Generación PDF
function submitReserva(e) {
    e.preventDefault();
    
    const element = document.getElementById('contract-document');
    const nombrePadrino = document.getElementById('reserva-nombre').value || 'Padrino';
    
    // Opciones para el PDF
    const opt = {
        margin:       15,
        filename:     `Contrato_Apadrinamiento_${nombrePadrino.replace(/\s+/g, '_')}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, windowWidth: 800 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Agregar estilo temporal para PDF si es necesario u ocultar algo
    const originalWidth = element.style.width;
    const originalMaxWidth = element.style.maxWidth;
    const originalPadding = element.style.padding;
    const originalXs = element.className;

    element.style.padding = '40px';
    element.style.width = '750px';
    element.style.maxWidth = '750px';
    element.classList.remove('shadow-2xl', 'shadow-xl', 'w-full', 'max-w-lg');
    
    // Mostramos un overlay de carga (si quieres) o al menos generamos el PDF
    html2pdf().set(opt).from(element).save().then(() => {
        // Restaurar estado visual
        element.style.padding = originalPadding;
        element.style.width = originalWidth;
        element.style.maxWidth = originalMaxWidth;
        element.className = originalXs;
        
        // Cambiar vista en Modal Formulario a Success
        document.getElementById('reserva-form-container').classList.add('hidden');
        document.getElementById('reserva-preview-container').classList.add('hidden');
        document.getElementById('reserva-success').classList.remove('hidden');
        document.getElementById('reservaModal').classList.remove('overflow-hidden'); 
    });
}

// Limpiar modal reserva al cerrar para futuros intentos
document.getElementById('reservaModal').addEventListener('click', function(e) {
    if (e.target.closest('button[onclick="closeModal(\'reservaModal\')"]') || e.target === this.querySelector('div[onclick="closeModal(\'reservaModal\')"]')) {
        setTimeout(() => {
            document.getElementById('reserva-form-container').classList.remove('hidden');
            document.getElementById('reserva-preview-container').classList.remove('hidden');
            document.getElementById('reserva-preview-container').classList.add('flex'); // Se asegura que quede como flex
            document.getElementById('reserva-success').classList.add('hidden');
            document.getElementById('form-reserva').reset();
            updateContract();
        }, 500);
    }
});
