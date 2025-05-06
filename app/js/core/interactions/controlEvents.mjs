import { setKeypressListener } from "./events/keypress.mjs";
import { setClickListener } from "./events/click.mjs";
import { setFocusListener } from "./events/focus.mjs";
import { setPasteListener } from "./events/paste.mjs";

export async function controlEvents(chatbot) {
	setKeypressListener();
	setClickListener(chatbot);
	setFocusListener();
	setPasteListener();
}
