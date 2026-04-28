/**
 * app.js
 * Lógica de la aplicación para Apadrina tu Naranjo.
 * v1.4.1 - Fix PDF capture and email data consistency.
 */

// Funciones Globales de UI
window.openModal = function(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
    document.body.style.overflow = 'hidden';
};

window.closeModal = function(modalId) {
    document.getElementById(modalId).classList.add('hidden');
    document.body.style.overflow = 'auto';
};

// --- FORMULARIO DE DUDAS ---
window.submitDudas = async function(event) {
    event.preventDefault();
    const form = event.target;
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Enviando...';

    const formData = new FormData(form);
    
    try {
        const response = await fetch('procesar_dudas.php', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            document.getElementById('dudas-form-container').innerHTML = `
                <div class="text-center py-10 animate-fade-in">
                    <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span class="material-symbols-outlined text-4xl">check_circle</span>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-900 mb-2">¡Mensaje Enviado!</h3>
                    <p class="text-gray-600">Jose y Alex han recibido tu duda y te responderán muy pronto.</p>
                </div>
            `;
        } else {
            throw new Error('Error en el envío');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un error al enviar tu consulta.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
};

// --- PREVISUALIZACIÓN Y PDF DEL CONTRATO ---
window.updateContract = function() {
    const nombre = document.getElementById('reserva-nombre').value || '';
    const dni = document.getElementById('reserva-dni').value || '';
    const direccion = document.getElementById('reserva-direccion').value || '';
    const arbol = document.getElementById('reserva-nombre-arbol').value || '';
    const fechaArbol = document.getElementById('reserva-fecha-arbol').value || '';

    // Actualizar campos en el documento
    const elNombre = document.getElementById('doc-nombre');
    const elDni = document.getElementById('doc-dni');
    const elDir = document.getElementById('doc-direccion');
    const elArbol = document.getElementById('doc-arbol');
    const elFirmaNombre = document.getElementById('doc-firma-nombre');
    const elFirma = document.getElementById('doc-firma');

    if(elNombre) elNombre.innerText = nombre || '[Tu Nombre]';
    if(elDni) elDni.innerText = dni || '[Tu DNI]';
    if(elDir) elDir.innerText = direccion || '[Tu Dirección]';
    if(elArbol) elArbol.innerText = arbol || '[Nombre del Árbol]';
    if(elFirmaNombre) elFirmaNombre.innerText = nombre || '[Nombre Padrino]';
    if(elFirma) elFirma.innerText = nombre;
    
    const elFechaArbol = document.getElementById('doc-fecha-arbol');
    if (elFechaArbol) {
        if (fechaArbol) {
            const f = new Date(fechaArbol);
            elFechaArbol.innerText = f.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
        } else {
            elFechaArbol.innerText = '[Fecha]';
        }
    }
    
    // Fecha
    const fechaEl = document.getElementById('fecha-contrato');
    if (fechaEl) {
        const hoy = new Date();
        fechaEl.innerText = hoy.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    }
};

async function generateContractBase64() {
    // Sincronizar antes de capturar
    window.updateContract();
    
    // Obtener elemento directamente
    const element = document.getElementById('contract-document');
    if (!element) return null;
    
    // Dar un tiempo generoso para renderizar fuentes e imágenes (especialmente en móviles)
    await new Promise(r => setTimeout(r, 1000)); 

    const opt = {
        margin: [5, 5, 5, 5],
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2, 
            useCORS: true, 
            logging: false,
            letterRendering: true,
            scrollY: 0,
            scrollX: 0,
            backgroundColor: '#ffffff'
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
        // Usar el worker de html2pdf para mayor control
        const worker = html2pdf().set(opt).from(element);
        const dataUri = await worker.output('datauristring');
        return dataUri;
    } catch (err) {
        console.error("PDF Error:", err);
        return null;
    }
}

// --- FORMULARIO DE RESERVA ---
window.submitReserva = async function(event) {
    event.preventDefault();
    const form = event.target;
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Generando Contrato...';

    try {
        // 1. Generar PDF
        const pdfBase64 = await generateContractBase64();
        if (!pdfBase64) throw new Error("No se pudo generar el PDF");

        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Enviando...';

        // 2. FormData capturará los campos con 'name' automáticamente
        const formData = new FormData(form);
        formData.append('pdf_base64', pdfBase64);

        // 3. Enviar
        const response = await fetch('procesar_reserva.php', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            document.getElementById('reserva-form-container').classList.add('hidden');
            document.getElementById('reserva-preview-container').classList.add('hidden');
            document.getElementById('reserva-success').classList.remove('hidden');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error en el servidor');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al enviar la reserva: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
};

// Listeners
document.addEventListener('DOMContentLoaded', () => {
    ['reserva-nombre', 'reserva-dni', 'reserva-direccion', 'reserva-nombre-arbol', 'reserva-fecha-arbol'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', window.updateContract);
    });
    
    // Cargar comentarios si existe la sección
    if (document.getElementById('lista-comentarios')) {
        loadComentarios();
    }
});

// --- SISTEMA DE COMENTARIOS CON SUPABASE ---
const supabaseUrl = 'https://njnrsmdcstbboifuxvgy.supabase.co';
const supabaseKey = 'sb_publishable_RaC5G6QScSMzwOE-IclpEA_YJfdZxJ2';
let supabaseClient = null;

if (window.supabase) {
    supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
}

// MODO JOSE: Permite responder a comentarios
let josePwd = sessionStorage.getItem('jose_pwd') || '';

window.toggleJoseMode = function(e) {
    if(e) e.preventDefault();
    if (josePwd) {
        josePwd = '';
        sessionStorage.removeItem('jose_pwd');
        alert('Modo Jose desactivado.');
    } else {
        const pass = prompt('Contraseña de Administrador (Jose):');
        if (pass) {
            josePwd = pass;
            sessionStorage.setItem('jose_pwd', pass);
            alert('Modo Jose activado. Ahora puedes responder, editar y eliminar comentarios.');
        }
    }
    loadComentarios();
}

window.responderComentario = async function(id) {
    if (!josePwd) return alert('Debes estar en Modo Jose');
    const respuesta = prompt('Escribe tu respuesta pública:');
    if (!respuesta) return;

    try {
        const { data, error } = await supabaseClient.rpc('responder_comentario', { p_id: id, p_respuesta: respuesta, p_password: josePwd });
        if (error) throw error;
        if (data === true) loadComentarios();
        else { alert('Contraseña incorrecta.'); josePwd = ''; sessionStorage.removeItem('jose_pwd'); loadComentarios(); }
    } catch (err) { console.error(err); alert('Error al responder.'); }
}

window.editarComentario = async function(id, textoActual) {
    if (!josePwd) return alert('Debes estar en Modo Jose');
    // Prompt no es muy cómodo para textos largos, pero servirá para ediciones rápidas
    const nuevoTexto = prompt('Edita el comentario del cliente:', textoActual);
    if (!nuevoTexto || nuevoTexto === textoActual) return;

    try {
        const { data, error } = await supabaseClient.rpc('editar_comentario', { p_id: id, p_nuevo_texto: nuevoTexto, p_password: josePwd });
        if (error) throw error;
        if (data === true) loadComentarios();
        else { alert('Contraseña incorrecta.'); josePwd = ''; sessionStorage.removeItem('jose_pwd'); loadComentarios(); }
    } catch (err) { console.error(err); alert('Error al editar.'); }
}

window.eliminarComentario = async function(id) {
    if (!josePwd) return alert('Debes estar en Modo Jose');
    if (!confirm('¿Seguro que quieres borrar este comentario permanentemente?')) return;

    try {
        const { data, error } = await supabaseClient.rpc('eliminar_comentario', { p_id: id, p_password: josePwd });
        if (error) throw error;
        if (data === true) loadComentarios();
        else { alert('Contraseña incorrecta.'); josePwd = ''; sessionStorage.removeItem('jose_pwd'); loadComentarios(); }
    } catch (err) { console.error(err); alert('Error al eliminar.'); }
}

window.loadComentarios = async function() {
    if (!supabaseClient) return;
    const lista = document.getElementById('lista-comentarios');
    
    try {
        const { data, error } = await supabaseClient.from('comentarios').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        
        if (data.length === 0) {
            lista.innerHTML = '<div class="text-center text-on-surface-variant py-8">Todavía no hay comentarios. ¡Sé el primero!</div>';
            return;
        }

        lista.innerHTML = '';
        
        data.forEach(c => {
            const date = new Date(c.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
            let respuestaHTML = '';
            
            if (c.respuesta_jose) {
                respuestaHTML = `
                <div class="mt-4 ml-8 bg-orange-50 border-l-4 border-primary p-4 rounded-r-xl relative group">
                    <p class="font-bold text-sm text-primary mb-1">Respuesta de Jose</p>
                    <p class="text-sm text-on-surface-variant italic">"${escapeHTML(c.respuesta_jose)}"</p>
                    ${josePwd ? `<button onclick="responderComentario('${c.id}')" class="absolute top-2 right-2 text-xs opacity-0 group-hover:opacity-100 bg-stone-200 hover:bg-stone-300 text-stone-700 px-2 py-1 rounded transition-opacity"><i class="fa-solid fa-pen"></i></button>` : ''}
                </div>`;
            } else if (josePwd) {
                respuestaHTML = `
                <div class="mt-2 text-right">
                    <button onclick="responderComentario('${c.id}')" class="text-xs bg-stone-200 hover:bg-stone-300 text-stone-700 px-3 py-1 rounded">Responder como Jose</button>
                </div>`;
            }
            
            let adminControls = '';
            if (josePwd) {
                // Pasamos el texto actual escapando comillas simples para evitar romper el JS
                const textoSeguro = escapeHTML(c.comentario).replace(/'/g, "\\'");
                adminControls = `
                <div class="absolute top-4 right-4 flex gap-2">
                    <button onclick="editarComentario('${c.id}', '${textoSeguro}')" title="Editar comentario" class="text-stone-400 hover:text-primary transition-colors"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button onclick="eliminarComentario('${c.id}')" title="Eliminar comentario" class="text-stone-400 hover:text-red-500 transition-colors"><i class="fa-solid fa-trash"></i></button>
                </div>`;
            }

            const itemHTML = `
            <div class="bg-surface-container p-6 rounded-2xl relative">
                ${adminControls}
                <div class="flex items-center gap-3 mb-3">
                    <div class="bg-primary/10 text-primary w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg uppercase">${escapeHTML(c.nombre).charAt(0)}</div>
                    <div>
                        <p class="font-bold pr-16">${escapeHTML(c.nombre)}</p>
                        <p class="text-xs text-on-surface-variant">${date}</p>
                    </div>
                </div>
                <p class="text-on-surface">${escapeHTML(c.comentario).replace(/\\n/g, '<br>')}</p>
                ${respuestaHTML}
            </div>`;
            
            lista.innerHTML += itemHTML;
        });

    } catch (error) {
        console.error('Error cargando comentarios:', error);
        lista.innerHTML = '<div class="text-center text-red-500 py-8">No se han podido cargar los comentarios.</div>';
    }
}

window.submitComentario = async function(event) {
    event.preventDefault();
    if (!supabaseClient) return;
    
    const form = event.target;
    const btn = document.getElementById('comentario-submit');
    const originalText = btn.innerHTML;
    
    const nombre = document.getElementById('comentario-nombre').value;
    const texto = document.getElementById('comentario-texto').value;
    
    btn.disabled = true;
    btn.innerHTML = 'Publicando...';
    
    document.getElementById('comentario-success').classList.add('hidden');
    document.getElementById('comentario-error').classList.add('hidden');
    
    try {
        const { error } = await supabaseClient
            .from('comentarios')
            .insert([{ nombre: nombre, comentario: texto }]);
            
        if (error) throw error;
        
        form.reset();
        document.getElementById('comentario-success').classList.remove('hidden');
        
        loadComentarios();
        
    } catch (error) {
        console.error('Error publicando:', error);
        document.getElementById('comentario-error').classList.remove('hidden');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}
