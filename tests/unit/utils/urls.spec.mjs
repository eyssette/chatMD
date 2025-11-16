import { config } from "../../../app/js/config.mjs";
import {
	handleURL,
	loadScript,
	loadCSS,
	getParamsFromURL,
	goToNewChatbot,
	normalizeUrl,
} from "../../../app/js/utils/urls.mjs";

describe("normalizeUrl", function () {
	const originalConfig = { ...config }; // Store the original config to restore after tests

	beforeEach(function () {
		// Save and mock config
		Object.assign(config, {
			corsProxy: "https://proxy.example.com/",
		});
	});

	afterEach(() => {
		// Restore the original config after each test
		Object.assign(config, originalConfig);
	});

	it("returns URL without proxy when no CORS proxy is requested and host does not require it", function () {
		const result = normalizeUrl("https://example.com", { useCorsProxy: false });
		expect(result).toBe("https://example.com");
	});

	it("prepends CORS proxy when useCorsProxy is true and host does not override", function () {
		const result = normalizeUrl("https://example.com", { useCorsProxy: true });
		expect(result).toBe("https://proxy.example.com/https://example.com");
	});

	it("returns updated URL if handleKnownHosts modifies it", function () {
		const result = normalizeUrl("https://codimd/test?both", {
			useCorsProxy: true,
		});
		expect(result).toBe("https://codimd/test/download");
	});

	it("defaults options to undefined and processes without proxy if options not provided", function () {
		const result = normalizeUrl("https://example.com");
		expect(result).toBe("https://example.com");
	});
});

describe("handleURL", () => {
	const originalConfig = { ...config }; // Store the original config to restore after tests

	beforeEach(() => {
		// Mock the config object for testing purposes
		Object.assign(config, {
			shortcuts: [
				["monRaccourci", "https://shortened.com"],
				[
					"monRaccourciAvecPlusieursURLs",
					[
						"https://test1.com",
						"https://codimd.apps.education.fr/iChROsR5Sce9suRp3G3r8Q?both",
					],
				],
			],
			secureMode: false,
			authorizedChatbots: ["https://chatbot.com"],
			corsProxy: "http://corsproxy.io/?url=",
		});
	});

	afterEach(() => {
		// Restore the original config after each test
		Object.assign(config, originalConfig);
	});

	it("returns the correct URL when a shortcut is found", () => {
		const url = "monRaccourci";
		const options = {};
		const result = handleURL(url, options);
		expect(result).toBe("https://shortened.com");
	});

	it("returns the correct URLs when a shortcut is found and ", () => {
		const url = "monRaccourciAvecPlusieursURLs";
		const options = {};
		const result = handleURL(url, options);
		expect(result).toEqual([
			"https://test1.com",
			"https://codimd.apps.education.fr/iChROsR5Sce9suRp3G3r8Q/download",
		]);
	});

	it("returns an empty string if the URL is not in the authorized chatbots list in secureMode", () => {
		Object.assign(config, {
			secureMode: true,
		});
		const url = "https://unauthorized-chatbot.com";
		const options = {};
		const result = handleURL(url, options);
		expect(result).toBe("");
	});

	it("returns the same URL if it is in the authorized chatbots list in secureMode", () => {
		Object.assign(config, {
			secureMode: true,
		});
		const url = "https://chatbot.com";
		const options = {};
		const result = handleURL(url, options);
		expect(result).toBe("https://chatbot.com");
	});

	it('removes unnecessary parameters if needed and adds "/download" for CodiMD if not present', () => {
		const unNecessaryParameter = "#?both";
		let url = "https://codimd.apps.education.fr/iChROsR5Sce9suRp3G3r8Q";
		const options = {};
		const result1 = handleURL(url + unNecessaryParameter, options);
		expect(result1).toBe(
			"https://codimd.apps.education.fr/iChROsR5Sce9suRp3G3r8Q/download",
		);
		const result2 = handleURL(url + "/download", options);
		expect(result2).toBe(
			"https://codimd.apps.education.fr/iChROsR5Sce9suRp3G3r8Q/download",
		);
	});

	it('removes unnecessary parameters if needed and adds "/download" for pad.numerique.gouv.fr if not present', () => {
		const unNecessaryParameter = "#?view";
		let url = "https://pad.numerique.gouv.fr/iChROsR5Sce9suRp3G3r8Q";
		const options = {};
		const result1 = handleURL(url + unNecessaryParameter, options);
		expect(result1).toBe(
			"https://pad.numerique.gouv.fr/iChROsR5Sce9suRp3G3r8Q/download",
		);
		const result2 = handleURL(url + "/download", options);
		expect(result2).toBe(
			"https://pad.numerique.gouv.fr/iChROsR5Sce9suRp3G3r8Q/download",
		);
	});

	it('removes unnecessary parameters if needed and adds "/download" for hedgedoc if not present', () => {
		const unNecessaryParameter = "#?both";
		let url = "https://demo.hedgedoc.org/iChROsR5Sce9suRp3G3r8Q";
		const options = {};
		const result1 = handleURL(url + unNecessaryParameter, options);
		expect(result1).toBe(
			"https://demo.hedgedoc.org/iChROsR5Sce9suRp3G3r8Q/download",
		);
		const result2 = handleURL(url + "/download", options);
		expect(result2).toBe(
			"https://demo.hedgedoc.org/iChROsR5Sce9suRp3G3r8Q/download",
		);
	});

	it('removes unnecessary parameters if needed and adds "/download" for Digipage if present', () => {
		const unNecessaryParameter = "/";
		let url = "https://digipage.app/k1XUDeazeA1SazeMSi_UiF3Aw";
		const options = {};
		const result1 = handleURL(url + unNecessaryParameter, options);
		expect(result1).toBe(
			"https://digipage.app/k1XUDeazeA1SazeMSi_UiF3Aw/download",
		);
		const result2 = handleURL(url + "/download", options);
		expect(result2).toBe(
			"https://digipage.app/k1XUDeazeA1SazeMSi_UiF3Aw/download",
		);
	});

	it('removes unnecessary parameters for Framapad and appends "/export/txt" if not present', () => {
		const url = "https://hebdo.framapad.org/p/6f3xs9j9m7-acto?lang=fr";
		const options = {};
		const result = handleURL(url, options);
		expect(result).toBe(
			"https://hebdo.framapad.org/p/6f3xs9j9m7-acto/export/txt",
		);
	});

	it('removes unnecessary parameters for Digidoc and appends "/export/txt" if not present', () => {
		const url = "https://digidoc.app/p/680967e56d3d3";
		const options = {};
		const result = handleURL(url, options);
		expect(result).toBe("https://digidoc.app/p/680967e56d3d3/export/txt");
	});

	it("updates the URL of a Github file to get raw content", () => {
		const url = "https://github.com/user/repo/blob/main/file.md";
		const options = {};
		const result = handleURL(url, options);
		expect(result).toBe(
			"https://raw.githubusercontent.com/user/repo/main/file.md",
		);
	});

	it("does not add CORS proxy for URLs from the .forge domain", () => {
		const url = "https://group.forge.apps.education.fr/repo/file.md";
		const options = {};
		const result = handleURL(url, options);
		expect(result).toBe("https://group.forge.apps.education.fr/repo/file.md");
	});

	it("adds CORS proxy if the option is set and no other conditions block it", () => {
		const url = "https://example.com/file.txt";
		const options = { useCorsProxy: true };
		const result = handleURL(url, options);
		expect(result).toBe(
			"http://corsproxy.io/?url=https://example.com/file.txt",
		);
	});

	it("returns the original URL if it does not match any special case and no option is set", () => {
		const url = "https://random-url.com/file.md";
		const result = handleURL(url);
		expect(result).toBe("https://random-url.com/file.md");
	});

	it("returns the original URL if it does not match any special case and option.useCorsProxy is false", () => {
		const url = "https://random-url.com/file.md";
		const options = { useCorsProxy: false };
		const result = handleURL(url, options);
		expect(result).toBe("https://random-url.com/file.md");
	});

	it("returns an empty string if the URL is empty", () => {
		const url = "";
		const options = {};
		const result = handleURL(url, options);
		expect(result).toBe("");
	});
});

describe("loadScript", () => {
	let createElementSpy;
	let appendChildSpy;
	let mockScript;

	beforeEach(() => {
		mockScript = {
			set src(value) {
				this._src = value;
			},
			get src() {
				return this._src;
			},
			onload: null,
			onerror: null,
		};

		createElementSpy = spyOn(document, "createElement").and.returnValue(
			mockScript,
		);
		appendChildSpy = spyOn(document.head, "appendChild").and.callFake(
			(script) => {
				// Simulate appending the script without actually modifying the DOM
				return script;
			},
		);
	});

	it("resolves the promise when the script loads successfully", async () => {
		const promise = loadScript("https://example.com/test.js");
		mockScript.onload(); // simulate script loading
		const result = await promise;
		expect(result).toBeUndefined(); // resolve does not return anything
	});

	it("rejects the promise when the script fails to load", async () => {
		const promise = loadScript("https://example.com/fail.js");
		let errorCaught = false;

		try {
			mockScript.onerror(); // simulate script loading failure
			await promise;
		} catch (e) {
			errorCaught = true;
		}

		expect(errorCaught).toBeTrue();
	});

	it("creates a script element with the correct source URL", () => {
		loadScript("https://example.com/myscript.js");
		expect(createElementSpy).toHaveBeenCalledWith("script");
		expect(mockScript.src).toBe("https://example.com/myscript.js");
	});

	it("appends the script element to the document head", () => {
		loadScript("https://example.com/append.js");
		expect(appendChildSpy).toHaveBeenCalledWith(mockScript);
	});
});

describe("loadCSS", () => {
	let appendChildSpy;
	let createElementSpy;
	let mockElement;

	beforeEach(() => {
		mockElement = {
			set href(value) {
				this._href = value;
			},
			get href() {
				return this._href;
			},
			rel: "",
			onload: null,
			onerror: null,
			textContent: "",
		};

		createElementSpy = spyOn(document, "createElement").and.callFake((tag) => {
			mockElement.tagName = tag;
			return mockElement;
		});

		appendChildSpy = spyOn(document.head, "appendChild").and.callFake(
			(el) => el,
		);
	});

	it("creates a <link> element for external CSS with correct href and rel", () => {
		loadCSS("https://example.com/style.css");
		expect(createElementSpy).toHaveBeenCalledWith("link");
		expect(mockElement.href).toBe("https://example.com/style.css");
		expect(mockElement.rel).toBe("stylesheet");
		expect(appendChildSpy).toHaveBeenCalledWith(mockElement);
	});

	it("resolves the promise when external CSS is loaded successfully", async () => {
		const promise = loadCSS("https://example.com/style.css");
		mockElement.onload(); // simulate load
		const result = await promise;
		expect(result).toBeUndefined(); // resolve returns nothing
	});

	it("rejects the promise when external CSS fails to load", async () => {
		const promise = loadCSS("https://example.com/fail.css");
		let rejected = false;

		try {
			mockElement.onerror(); // simulate error
			await promise;
		} catch (e) {
			rejected = true;
		}

		expect(rejected).toBeTrue();
	});

	it("creates a <style> element when given inline CSS", () => {
		const inlineCSS = "<style>body { background: red; }</style>";
		loadCSS(inlineCSS);
		expect(createElementSpy).toHaveBeenCalledWith("style");
		expect(mockElement.textContent).toBe("body { background: red; }");
		expect(appendChildSpy).toHaveBeenCalledWith(mockElement);
	});
});

describe("getParamsFromURL", () => {
	it("parses params from search only", () => {
		const result = getParamsFromURL("?foo=bar&num=42", "");
		expect(result.foo).toBe("bar");
		expect(result.num).toBe("42");
	});

	it("parses params from hash only", () => {
		const result = getParamsFromURL("", "#/test?abc=123");
		expect(result.abc).toBe("123");
	});

	it("merges search and hash, with hash taking precedence", () => {
		const result = getParamsFromURL("?x=1", "#/view?x=2&y=3");
		expect(result.x).toBe("2");
		expect(result.y).toBe("3");
	});

	it("returns empty object if no parameters", () => {
		const result = getParamsFromURL("", "");
		expect(Object.keys(result).length).toBe(0);
	});

	it("ignores hash if it has no query part", () => {
		const result = getParamsFromURL("?test=value1", "#test=value2");
		expect(result.test).toBe("value1");
	});
});

describe("goToNewChatbot", () => {
	let openSpy;
	let alertSpy;

	beforeEach(() => {
		openSpy = spyOn(window, "open");
		alertSpy = spyOn(window, "alert");
	});

	it("opens a new tab with the correct chatbot URL when given a valid chatbot path and no origin", () => {
		goToNewChatbot("my.bot.fr");
		const expectedUrl = `/#my.bot.fr`;
		const baseURL = window.location.origin + window.location.pathname;
		expect(openSpy).toHaveBeenCalledWith(baseURL + expectedUrl, "_blank");
		expect(alertSpy).not.toHaveBeenCalled();
	});

	it("opens a new tab with the correct chatbot URL when given a valid chatbot path and custom origin", () => {
		const customOrigin = "https://custom-origin.com";
		goToNewChatbot("my.bot", customOrigin);

		const expectedUrl = `https://custom-origin.com/#my.bot`;
		expect(openSpy).toHaveBeenCalledWith(expectedUrl, "_blank");
		expect(alertSpy).not.toHaveBeenCalled();
	});

	it("does not open a new tab and triggers alert when URL is missing", () => {
		goToNewChatbot("");

		expect(openSpy).not.toHaveBeenCalled();
		expect(alertSpy).toHaveBeenCalled();
	});

	it("does not open a new tab and triggers alert when URL is invalid (no dot)", () => {
		goToNewChatbot("invalid-url");

		expect(openSpy).not.toHaveBeenCalled();
		expect(alertSpy).toHaveBeenCalled();
	});
});
