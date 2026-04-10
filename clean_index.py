import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Remove the Dudas Modal entirely
# Find the div id="dudasModal" up to the next modal
modal1_start = html.find('<!-- Formulario 1: Dudas -->')
modal2_start = html.find('<!-- Formulario 2: Reserva (Split view) -->')
if modal1_start != -1 and modal2_start != -1:
    html = html[:modal1_start] + html[modal2_start:]

# 2. Add id="dudas-form-container" to the inner div of the Contact Section
html = html.replace('<div class="max-w-xl mx-auto bg-white p-10 rounded-[2.5rem] editorial-shadow">', '<div id="dudas-form-container" class="max-w-xl mx-auto bg-white p-10 rounded-[2.5rem] editorial-shadow">')

# 3. Add id="form-dudas" to the form in the Contact Section
# Wait, the previous script might have already added it if it ran.
# Let's check if it has id="form-dudas". Yes, the html snippet earlier shows: `<form id="form-dudas" onsubmit="submitDudas(event)" class="space-y-6">`
# We just need to make sure the success div is properly structured and hideable.
# The html snippet: `<div id="dudas-success" class="hidden mt-4 bg-green-100 p-4 rounded text-green-800 text-center font-bold">¡Mensaje enviado con éxito! Jose te contactará pronto.</div>`

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
