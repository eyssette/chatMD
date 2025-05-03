import { setKeypressListener } from "./events/keypress.mjs";
import { setClickListener } from "./events/click.mjs";
import { setFocusListener } from "./events/focus.mjs";

export async function controlEvents(chatbot) {
	setKeypressListener();
	setClickListener(chatbot);
	setFocusListener();
}
