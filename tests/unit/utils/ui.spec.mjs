import { JSDOM } from "jsdom";
import { scrollWindow, hideFooter } from "../../../app//js/utils/ui.mjs";

beforeEach(() => {
	const dom = new JSDOM(`<!DOCTYPE html><body>
	<h1 id="chatbot-name">&nbsp;</h1>
	<main>
		<div id="chat" class="chat-container" role="region" aria-label="Zone de conversation">
			<!-- La conversation sera affichée ici -->
		</div>
		<div id="controls">
			<div id="input-container">
				<label id="user-input-label" class="sr-only" for="user-input">Écrivez votre message</label>
				<div id="user-input" contenteditable="true" placeholder="Écrivez votre message" tabindex="0" role="textbox" aria-labelledby="user-input-label" title="Écrivez votre message"></div>
			</div>
			<button id="send-button" type="button">Envoyer</button>
		</div>
	</main>
	<footer id="footer">
		ChatMD – Outil libre & gratuit créé par <a href="http://eyssette.forge.apps.education.fr/">Cédric Eyssette</a>
	</footer>
	<script src="script.min.js"></script>
</body>`);
	global.window = dom.window;
	global.document = dom.window.document;
});

describe("scrollToBottomOfPage", () => {
	let scrollToSpy;
	let requestAnimationFrameSpy;

	beforeEach(() => {
		window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
		window.cancelAnimationFrame = (cb) => cb;
		spyOnProperty(document.body, "scrollHeight", "get").and.returnValue(1000);
		spyOnProperty(
			document.documentElement,
			"scrollHeight",
			"get",
		).and.returnValue(1200);
		spyOn(window, "cancelAnimationFrame");
		requestAnimationFrameSpy = spyOn(
			window,
			"requestAnimationFrame",
		).and.callFake((cb) => {
			cb();
			return 42;
		});
		// Mock scrollTo
		scrollToSpy = spyOn(window, "scrollTo");
	});

	it("scrolls instantly to the correct position when scrollMode is set to instant scrolling", () => {
		scrollWindow({ scrollMode: "instant" });
		expect(requestAnimationFrameSpy).not.toHaveBeenCalled();
		expect(scrollToSpy).toHaveBeenCalledWith({
			top: 1350,
			behavior: "auto",
		});
	});

	it("scrolls smoothly to the correct position when scrollMode is set to smooth", () => {
		scrollWindow({ scrollMode: "smooth" });
		expect(requestAnimationFrameSpy).toHaveBeenCalled();
		expect(scrollToSpy).toHaveBeenCalledWith({
			top: 1350,
			behavior: "smooth",
		});
	});

	it("defaults to instant scrolling if no scrollMode is chosen", () => {
		scrollWindow();
		expect(scrollToSpy).toHaveBeenCalledWith({
			top: 1350,
			behavior: "auto",
		});
	});
});

describe("hideFooter", () => {
	let controls, footer;

	beforeEach(() => {
		footer = document.body.querySelector("#footer");
		controls = document.body.querySelector("#controls");
	});

	it("should hide the footer element", () => {
		hideFooter();
		expect(footer.style.display).toBe("none");
	});
	it("should hide the footer element if parameter false", () => {
		hideFooter(false);
		expect(footer.style.display).toBe("none");
	});

	it("should set the height of #controls to 70px", () => {
		hideFooter();
		expect(controls.style.height).toBe("70px");
	});

	it("should inject a responsive style with height 70px when userInput is false", () => {
		hideFooter(false);
		expect(controls.style.height).toBe("70px");
	});

	it("should inject a responsive style with height 110px when userInput is true", () => {
		hideFooter(true);
		const styleTag = document.getElementById("styleControlsIfNoFooter");
		expect(styleTag.textContent).toContain("110px");
	});
});
