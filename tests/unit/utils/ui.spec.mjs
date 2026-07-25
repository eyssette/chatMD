import { getWindow } from "../.config/helpers.mjs";
import { scrollWindow } from "../../../app//js/utils/ui.mjs";

describe("scrollToBottomOfPage", () => {
	let scrollToSpy;
	let requestAnimationFrameSpy;

	beforeEach(() => {
		const window = getWindow();
		global.window = window;
		global.document = window.document;
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
