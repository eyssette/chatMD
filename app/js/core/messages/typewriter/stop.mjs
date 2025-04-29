import { scrollWindow } from "../../../utils/ui.mjs";
import { manageScrollDetection } from "../helpers/scroll";
import {
	pauseTypeWriter,
	pauseTypeWriterMultipleBots,
	regex,
} from "../../../shared/constants.mjs";

// Formate le contenu quand on veut utiliser la fonction stopwriter
function formatContentStopTypeWriter(content) {
	content = content.replaceAll("`", "").replace(regex.messageOptions, "`$1`");
	// On doit conserver les retours à la ligne dans les blocs "pre"
	const contentKeepReturnInCode = content.replaceAll(
		regex.pre,
		function (match) {
			return match.replaceAll("\n", "RETURNCHARACTER");
		},
	);
	const contentArray = contentKeepReturnInCode.split("\n");
	// On découpe chaque paragraphe pour pouvoir ensuite l'afficher d'un coup
	const contentArrayFiltered = contentArray.map((element) =>
		element.startsWith(pauseTypeWriter)
			? element
					.replace(pauseTypeWriter, "")
					.replaceAll("RETURNCHARACTER", "\n") + "`"
			: element.endsWith("`")
				? "`" + element.replaceAll("RETURNCHARACTER", "\n")
				: "`" +
					element
						.replaceAll("RETURNCHARACTER", "\n")
						.replace(pauseTypeWriterMultipleBots, "") +
					"`",
	);
	const contentWithNoPause = contentArrayFiltered
		.join(" ")
		.replace(/\^\d+/g, "");
	return contentWithNoPause;
}

// Pour stopper l'effet machine à écrire (en appuyant sur “Enter”)
export function stopTypeWriter(content, typedElement, observer) {
	typedElement.stop();
	typedElement.reset();
	content = formatContentStopTypeWriter(content);
	typedElement.strings = [content];
	typedElement.start();
	typedElement.destroy();
	scrollWindow({ scrollMode: "instant" });
	manageScrollDetection(false, observer);
}
