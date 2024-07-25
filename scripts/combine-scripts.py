import os
import glob

# Dossier qui contient la source du chatbot avec les fichiers en markdown
data_folder = "data"

# Une fonction pour lire tous les fichiers markdown dans le dossier source et pour les combiner ensemble dans la définition de la variable md qui contient la source du chatbot
def read_markdown_files(data_folder):
	# Initialisation de la variable qui va représenter le contenu du chatbot
	combined_content = "let md = `"

	# Ajout du contenu de main.md au début
	main_md_path = os.path.join(data_folder, 'main.md')	
	if os.path.isfile(main_md_path):
		with open(main_md_path, 'r', encoding='utf-8') as file:
			combined_content += file.read().replace('`', '\\`') + "\n"

	# Recherche de tous les fichiers .md de manière récursive dans le dossier et les sous-dossiers
	markdown_files = glob.glob(os.path.join(data_folder, '**', '*.md'), recursive=True)
		
	# Supression de main.md de la liste des fichiers s'il est présent
	markdown_files = [f for f in markdown_files if f != main_md_path]
		
	# Ajout du contenu de chaque fichier .md à combined_content
	for file_path in markdown_files:
		with open(file_path, 'r', encoding='utf-8') as file:
			combined_content += file.read().replace('`', '\\`') + "\n"

	combined_content += "`;"

	return combined_content

combined_md_content = read_markdown_files(data_folder)

# Fichiers javascripts
file_list = ["scripts/custom.js", "scripts/utils.js", "scripts/processFixedVariables.js", "scripts/markdown.js", "scripts/convertLatex.js", "scripts/nlp.js", "scripts/typewriter.js", "scripts/processDynamicVariables.js", "scripts/directivesAndSpecialContents.js", "scripts/chatbot.js", "LLM/processRAG.js", "scripts/yaml.js", "scripts/chatbotData.js"]

# Fichier de sortie
combined_file = "script.min.js"

# Une fonction pour combiner ensemble tous les fichiers nécessaires
def combine_files(file_list, output_file):
	with open(output_file, 'w') as final_file:
		# On ajoute d'abord la définition de la variable md qui contient la source du chatbot
		final_file.write(combined_md_content)
		# On ajoute ensuite tous les scripts js
		for file in file_list:
			with open(file, 'r') as f:
				content = f.read()
				final_file.write(content)
				final_file.write('\n')

combine_files(file_list, combined_file)