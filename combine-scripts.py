import rjsmin

# Chemin des fichiers source
chatbot_js_file = "chatbot.js"
chatdata_js_file = "chatdata.js"

# Chemin du fichier de sortie
output_file = "script.min.js"

# Lire le contenu des fichiers source
with open(chatbot_js_file, "r") as chatbot_file, open(chatdata_js_file, "r") as chatdata_file:
    chatbot_content = chatbot_file.read()
    chatdata_content = chatdata_file.read()

# Concaténer le contenu des fichiers source
combined_content = chatbot_content + chatdata_content

# Écrire le contenu minifié dans le fichier de sortie
with open(output_file, "w") as output:
    output.write(combined_content)

print(f"Le fichier {output_file} a été créé avec succès.")