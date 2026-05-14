/**
 * app.js
 * Lógica de la aplicación para Apadrina tu Naranjo.
 * v1.4.2 - Fix PDF capture and layout consistency.
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
    const nombre = document.getElementById('reserva-nombre')?.value || '';
    const dni = document.getElementById('reserva-dni')?.value || '';
    const direccion = document.getElementById('reserva-direccion')?.value || '';
    const arbol = document.getElementById('reserva-nombre-arbol')?.value || '';
    const fechaArbolInput = document.getElementById('reserva-fecha-arbol')?.value || '';

    // Actualizar campos en el documento
    const setContent = (id, val, defaultVal = '') => {
        const el = document.getElementById(id);
        if (el) el.innerText = val || defaultVal;
    };

    setContent('doc-nombre', nombre, '[Tu Nombre]');
    setContent('doc-dni', dni, '[Tu DNI]');
    setContent('doc-direccion', direccion, '[Tu Dirección]');
    setContent('doc-arbol', arbol, '[Nombre del Árbol]');
    setContent('doc-firma-nombre', nombre, '[Nombre Padrino]');
    setContent('doc-firma', nombre, '');

    // Llenar también la plantilla de impresión (id duplicados con prefijo print-)
    setContent('print-doc-nombre', nombre, '[Tu Nombre]');
    setContent('print-doc-dni', dni, '[Tu DNI]');
    setContent('print-doc-direccion', direccion, '[Tu Dirección]');
    setContent('print-doc-arbol', arbol, '[Nombre del Árbol]');
    setContent('print-doc-firma-nombre', nombre, '[Nombre Padrino]');
    setContent('print-doc-firma', nombre, '');
    
    // Formatear fecha del árbol
    const elFechaArbol = document.getElementById('doc-fecha-arbol');
    const elFechaArbolPrint = document.getElementById('print-doc-fecha-arbol');
    
    if (fechaArbolInput) {
        const f = new Date(fechaArbolInput);
        const fechaStr = f.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
        if (elFechaArbol) elFechaArbol.innerText = fechaStr;
        if (elFechaArbolPrint) elFechaArbolPrint.innerText = fechaStr;
    } else {
        if (elFechaArbol) elFechaArbol.innerText = '[Fecha]';
        if (elFechaArbolPrint) elFechaArbolPrint.innerText = '[Fecha]';
    }
    
    // Fecha del contrato (hoy)
    const hoy = new Date();
    const fechaHoyStr = hoy.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    const fechaEl = document.getElementById('fecha-contrato');
    const fechaElPrint = document.getElementById('print-fecha-contrato');
    if (fechaEl) fechaEl.innerText = fechaHoyStr;
    if (fechaElPrint) fechaElPrint.innerText = fechaHoyStr;
};

async function generateContractBase64() {
    window.updateContract();
    const element = document.getElementById('contract-print-template');
    if (!element) return null;

    const opt = {
        margin: 0,
        filename: 'contrato_apadrinamiento.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2, 
            useCORS: true, 
            letterRendering: true,
            backgroundColor: '#ffffff',
            logging: false,
            windowWidth: 800,
            scrollY: 0,
            scrollX: 0
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
        // La plantilla ya está display:block y absolute fuera de pantalla en el HTML
        const dataUri = await html2pdf().set(opt).from(element).outputPdf('datauristring');
        if (!dataUri || dataUri.length < 1000) throw new Error("PDF fallido");
        return dataUri;
    } catch (err) {
        console.error("Error Crítico PDF:", err);
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
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Procesando Reserva...';

    try {
        // 1. FormData capturará los campos
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // 2. Guardar en Supabase (Respaldo de seguridad y gestión)
        if (supabaseClient) {
            const { error: sbError } = await supabaseClient.from('reservas_naranjos').insert([{
                nombre: data.nombre,
                email: data.email,
                dni: data.dni,
                direccion: data.direccion,
                nombre_arbol: data.nombreArbol,
                fecha_arbol: data.fechaArbol,
                telefono: data.telefono
            }]);
            if (sbError) console.error("Error Supabase:", sbError);
        }

        // 3. Notificar a Jose vía PHP
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Enviando Notificación...';
        const response = await fetch('procesar_reserva.php', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            document.getElementById('reserva-form-container').classList.add('hidden');
            document.getElementById('reserva-preview-container').classList.add('hidden');
            document.getElementById('reserva-success').classList.remove('hidden');
        } else {
            throw new Error('Error en el envío');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al enviar la reserva. Por favor, contacta con nosotros.');
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

    // Si estamos en Modo Jose, cargamos también el panel de reservas
    if (josePwd) {
        loadReservas();
    } else {
        const panelReservas = document.getElementById('panel-reservas-admin');
        if (panelReservas) panelReservas.classList.add('hidden');
    }
}

window.loadReservas = async function() {
    const panel = document.getElementById('panel-reservas-admin');
    const lista = document.getElementById('lista-reservas');
    if (!panel || !lista) return;

    panel.classList.remove('hidden');
    lista.innerHTML = '<div class="col-span-full text-center py-8"><i class="fas fa-spinner fa-spin mr-2"></i> Cargando reservas...</div>';

    try {
        const { data, error } = await supabaseClient.from('reservas_naranjos').select('*').order('created_at', { ascending: false });
        if (error) throw error;

        if (data.length === 0) {
            lista.innerHTML = '<div class="col-span-full text-center text-gray-500 py-8">No hay reservas registradas todavía.</div>';
            return;
        }

        lista.innerHTML = '';
        data.forEach(r => {
            const date = new Date(r.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            lista.innerHTML += `
            <div class="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow relative group">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <p class="font-bold text-gray-900">${escapeHTML(r.nombre)}</p>
                        <p class="text-xs text-gray-500">${date}</p>
                    </div>
                    <button onclick="downloadContractById('${r.id}')" class="text-primary hover:text-primary-dark transition-colors" title="Descargar Contrato PDF">
                        <i class="fa-solid fa-file-pdf text-2xl"></i>
                    </button>
                </div>
                <div class="space-y-1 text-sm text-gray-600">
                    <p><i class="fa-solid fa-envelope w-5"></i> ${escapeHTML(r.email)}</p>
                    <p><i class="fa-solid fa-phone w-5"></i> ${escapeHTML(r.telefono || '-')}</p>
                    <p><i class="fa-solid fa-tree w-5 text-green-600"></i> ${escapeHTML(r.nombre_arbol || '-')}</p>
                </div>
                <div class="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                    <span class="text-[10px] px-2 py-0.5 rounded-full ${r.pagado ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'} font-bold">
                        ${r.pagado ? 'PAGADO' : 'PENDIENTE PAGO'}
                    </span>
                </div>
            </div>`;
        });
    } catch (err) {
        console.error(err);
        lista.innerHTML = '<div class="col-span-full text-center text-red-500 py-8">Error al cargar reservas.</div>';
    }
}

window.downloadContractById = async function(id) {
    if (!josePwd) return alert('Debes estar en Modo Jose');
    
    try {
        const { data, error } = await supabaseClient.from('reservas_naranjos').select('*').eq('id', id).single();
        if (error) throw error;
        
        // Llenar campos invisibles para sincronizar plantilla
        const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };
        setVal('reserva-nombre', data.nombre);
        setVal('reserva-dni', data.dni);
        setVal('reserva-direccion', data.direccion);
        setVal('reserva-nombre-arbol', data.nombre_arbol);
        setVal('reserva-fecha-arbol', data.fecha_arbol);
        
        // Sincronizar plantilla de impresión
        window.updateContract();
        
        const element = document.getElementById('contract-print-template');
        if (!element) return;

        // Mostrar momentáneamente para asegurar que html2pdf lo capture
        element.style.position = 'fixed';
        element.style.left = '0';
        element.style.top = '0';
        element.style.zIndex = '9999';
        element.style.display = 'block';

        const opt = {
            margin: 0,
            filename: `Contrato_${data.nombre.replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        await html2pdf().set(opt).from(element).save();
        
        // Restaurar estado oculto
        element.style.display = 'block'; // Lo dejamos bloque pero movido
        element.style.position = 'absolute';
        element.style.left = '-9999px';
        
    } catch (err) {
        console.error(err);
        alert('Error al generar el contrato.');
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
