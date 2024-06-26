# Chemin des fichiers source
custom_js_file = "scripts/custom.js"
utils_js_file = "scripts/utils.js"
markdown_js_file = "scripts/markdown.js"
nlp_js_file = "scripts/nlp.js"
typewriter_js_file = "scripts/typewriter.js"
processCustomVariables_js_file = "scripts/processCustomVariables.js"
chatbot_js_file = "scripts/chatbot.js"
chatdata_js_file = "scripts/chatdata.js"

# Chemin du fichier de sortie
output_file = "script.min.js"

# Lire le contenu des fichiers source
with open(chatbot_js_file, "r") as chatbot_file, open(chatdata_js_file, "r") as chatdata_file, open(custom_js_file, "r") as custom_file, open(utils_js_file, "r") as utils_file, open(typewriter_js_file, "r") as typewriter_file, open(markdown_js_file, "r") as markdown_file, open(nlp_js_file, "r") as nlp_file, open(processCustomVariables_js_file, "r") as processCustomVariables_file:
    custom_content = custom_file.read()
    utils_content = utils_file.read()
    markdown_content = markdown_file.read()
    nlp_content = nlp_file.read()
    typewriter_content = typewriter_file.read()
    processCustomVariables_content = processCustomVariables_file.read()
    chatbot_content = chatbot_file.read()
    chatdata_content = chatdata_file.read()

# Concaténer le contenu des fichiers source
combined_content = custom_content + utils_content + markdown_content + nlp_content + typewriter_content + processCustomVariables_content + chatbot_content + chatdata_content

# Écrire le contenu minifié dans le fichier de sortie
with open(output_file, "w") as output:
    output.write(combined_content)

print(f"Le fichier {output_file} a été créé avec succès.")