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
function submitDudas(e) {
    e.preventDefault();
    // Aquí iría el envío real (AJAX/Fetch) a Backend o Email...
    
    // Mostrar estado de éxito
    document.getElementById('dudas-form-container').classList.add('hidden');
    document.getElementById('dudas-success').classList.remove('hidden');
    
    // Al resetear y si lo vuelven a abrir, restauramos estado (opcional, para esta Demo estará bien así o limpiar forms)
    document.getElementById('form-dudas').reset();
}

// Al cerrar modal Dudas, restauramos su vista normal
document.getElementById('dudasModal').addEventListener('click', function(e) {
    if (e.target.closest('button[onclick="closeModal(\'dudasModal\')"]') || e.target === this.querySelector('div[onclick="closeModal(\'dudasModal\')"]')) {
        setTimeout(() => {
            document.getElementById('dudas-form-container').classList.remove('hidden');
            document.getElementById('dudas-success').classList.add('hidden');
        }, 500);
    }
});

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
        margin:       10,
        filename:     `Contrato_Apadrinamiento_${nombrePadrino.replace(/\s+/g, '_')}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Agregar estilo temporal para PDF si es necesario u ocultar algo
    element.style.padding = '30px';
    element.classList.remove('shadow-2xl');
    
    // Generación del PDF
    html2pdf().set(opt).from(element).save().then(() => {
        // Restaurar estado visual
        element.style.padding = '';
        element.classList.add('shadow-2xl');
        
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
            document.getElementById('reserva-preview-container').classList.add('lg:flex');
            document.getElementById('reserva-success').classList.add('hidden');
            document.getElementById('form-reserva').reset();
            updateContract();
        }, 500);
    }
});
