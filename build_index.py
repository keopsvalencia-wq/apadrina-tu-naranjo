import re

with open('stitch_code.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Add needed CSS & Scripts to <head>
extra_head = """
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
"""
html = html.replace('</head>', extra_head + '</head>')

# Add JS and Modals to END of body
with open('index.html', 'r', encoding='utf-8') as f:
    old_html = f.read()

start_idx = old_html.find('<!-- MODALES -->')
modals = ""
if start_idx != -1:
    end_idx = old_html.find('</body>')
    modals = old_html[start_idx:end_idx]

# Inject logo
html = html.replace('<div class="flex items-center gap-2">\n<span class="material-symbols-outlined text-orange-600" data-icon="potted_plant">potted_plant</span>', 
'<div class="flex items-center gap-2">\n<img src="logo.png" alt="Apadrina tu Naranjo" class="h-14 w-auto object-contain rounded">')

# Modify Buttons
html = html.replace('<button class="hidden md:block bg-primary-container text-white px-6 py-2 rounded-xl font-bold transition-all active:scale-95">',
'<button onclick="openModal(\'reservaModal\')" class="hidden md:block bg-primary-container text-white px-6 py-2 rounded-xl font-bold transition-all active:scale-95">')

html = html.replace('<button class="bg-primary text-white font-headline font-bold px-8 py-4 rounded-xl shadow-lg hover:bg-primary-container transition-all active:scale-95">\n                            Quiero Apadrinar\n                        </button>',
'<button onclick="openModal(\'reservaModal\')" class="bg-primary text-white font-headline font-bold px-8 py-4 rounded-xl shadow-lg hover:bg-primary-container transition-all active:scale-95">\n                            Quiero Apadrinar\n                        </button>')

html = html.replace('<button class="border-2 border-secondary text-secondary font-headline font-bold px-8 py-4 rounded-xl hover:bg-secondary/5 transition-all active:scale-95">\n                            Conocer más\n                        </button>',
'<button onclick="document.getElementById(\'huerto\').scrollIntoView({behavior:\'smooth\'})" class="border-2 border-secondary text-secondary font-headline font-bold px-8 py-4 rounded-xl hover:bg-secondary/5 transition-all active:scale-95">\n                            Conocer más\n                        </button>')

# Add an id to Tu Huerto digital
html = html.replace('<h2 class="font-headline font-black text-4xl tracking-tighter mb-4">Tu huerto digital</h2>',
'<h2 id="huerto" class="font-headline font-black text-4xl tracking-tighter mb-4 pt-16">Tu huerto digital</h2>')

html = html.replace('<button class="w-full bg-primary text-white font-headline font-black py-5 rounded-2xl text-xl hover:scale-[1.02] active:scale-95 transition-all">\n                        Quiero mi Naranjo\n                    </button>',
'<button onclick="openModal(\'reservaModal\')" class="w-full bg-primary text-white font-headline font-black py-5 rounded-2xl text-xl hover:scale-[1.02] active:scale-95 transition-all">\n                        Quiero mi Naranjo\n                    </button>')

# The existing "Contact Section" uses a hardcoded Form. Let's make it actually submit using our JS function!
html = html.replace('<form class="space-y-6">', '<form id="form-dudas" onsubmit="submitDudas(event)" class="space-y-6">\n<input type="hidden" name="_captcha" value="false">\n<input type="hidden" name="_subject" value="Nueva duda desde Landing Page Apadrina Tu Naranjo">')
html = html.replace('id="dudas-nombre"', 'id="old-dudas-nombre"') # Clear potential conflicts
html = html.replace('id="dudas-email"', 'id="old-dudas-email"')
html = html.replace('id="dudas-mensaje"', 'id="old-dudas-mensaje"')

# Add standard Dudas IDs that app.js expects:
html = html.replace('placeholder="Juan Pérez" type="text"/>', 'placeholder="Juan Pérez" type="text" id="dudas-nombre" name="nombre" required />')
html = html.replace('placeholder="juan@ejemplo.com" type="email"/>', 'placeholder="juan@ejemplo.com" type="email" id="dudas-email" name="email" required />')
html = html.replace('<textarea class="w-full bg-surface-container-highest border-none border-b-2 border-outline-variant focus:ring-0 focus:border-primary rounded-lg py-4 px-4 h-32" placeholder="Cuéntanos en qué podemos ayudarte..."></textarea>',
'<textarea id="dudas-mensaje" name="mensaje" required class="w-full bg-surface-container-highest border-none border-b-2 border-outline-variant focus:ring-0 focus:border-primary rounded-lg py-4 px-4 h-32" placeholder="Cuéntanos en qué podemos ayudarte..."></textarea>')

html = html.replace('<button class="w-full bg-secondary text-white font-headline font-bold py-5 rounded-2xl hover:bg-secondary-container hover:text-on-secondary-container transition-all">\n                        Enviar mensaje\n                    </button>',
'<button type="submit" class="w-full bg-secondary text-white font-headline font-bold py-5 rounded-2xl hover:bg-secondary-container hover:text-on-secondary-container transition-all">\n                        Enviar mensaje\n                    </button>')

html = html.replace('</form>', '</form>\n<div id="dudas-success" class="hidden mt-4 bg-green-100 p-4 rounded text-green-800 text-center font-bold">¡Mensaje enviado con éxito! Jose te contactará pronto.</div>')


# Replace body end
html = html.replace('</body>', modals + '\n</body>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
