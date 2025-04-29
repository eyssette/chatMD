import { config } from "../config.mjs";

const pauseTypeWriterValue = Math.max(config.defaultPauseTypeWriter, 100);
export const pauseTypeWriter = `^${pauseTypeWriterValue} `;
export const pauseTypeWriterMultipleBots = `^${pauseTypeWriterValue - 50} `; // Valeur qui doit être différente de pauseTypeWriter pour ne pas créer de conflit dans la fonction stopTypeWriter
