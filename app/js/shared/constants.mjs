import { config } from "../config.mjs";

// Constantes pour déterminer le type de navigateur utilisé et définir des comportements par défaut en fonction de ce paramètre
export const userAgent = window.navigator.userAgent;
export const isMobile =
	/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
		userAgent,
	);
// Le focus automatique sur l'userInput est désactivé sur les téléphones mobiles
export const autoFocus = isMobile ? false : true;
export const isFirefoxOnWindows =
	userAgent.includes("Firefox") && userAgent.includes("Windows");

// Constantes pour l'effet de machine à écrire
const pauseTypeWriterValue = Math.max(config.defaultPauseTypeWriter, 100);
export const pauseTypeWriter = `^${pauseTypeWriterValue} `;
export const pauseTypeWriterMultipleBots = `^${pauseTypeWriterValue - 50} `; // Valeur qui doit être différente de pauseTypeWriter pour ne pas créer de conflit dans la fonction stopTypeWriter
