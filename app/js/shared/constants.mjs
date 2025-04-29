import { config } from "../config.mjs";

const pauseTypeWriterValue = Math.max(config.defaultPauseTypeWriter, 100);
export const pauseTypeWriter = `^${pauseTypeWriterValue} `;
export const pauseTypeWriterMultipleBots = `^${pauseTypeWriterValue - 50} `; // Valeur qui doit être différente de pauseTypeWriter pour ne pas créer de conflit dans la fonction stopTypeWriter

// Le focus automatique sur l'userInput est désactivé sur les téléphones mobiles
export const userAgent = window.navigator.userAgent;
export const isMobile =
	/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
		userAgent,
	);
export const autoFocus = isMobile ? false : true;
