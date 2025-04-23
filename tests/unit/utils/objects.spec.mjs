import { deepMerge } from "../../../app/js/utils/objects.mjs";

describe("deepMerge", () => {
	it("merges flat objects by adding properties from source into target", () => {
		const target = { a: 1, b: 2 };
		const source = { c: 3, d: 4 };
		const result = deepMerge(target, source);
		expect(result).toEqual({ a: 1, b: 2, c: 3, d: 4 });
	});

	it("merges nested objects", () => {
		const target = { a: { x: 1 }, b: 2, d: { x: 1, y: 2 } };
		const source = { a: { y: 2 }, c: 3, d: { z: 3 } };
		const result = deepMerge(target, source);
		expect(result).toEqual({
			a: { x: 1, y: 2 },
			b: 2,
			c: 3,
			d: { x: 1, y: 2, z: 3 },
		});
	});

	it("merges nested objects deeply", () => {
		const target = { user: { name: "Alice", prefs: { theme: "light" } } };
		const source = { user: { prefs: { fontSize: 14 } } };
		const result = deepMerge(target, source);
		expect(result).toEqual({
			user: {
				name: "Alice",
				prefs: {
					theme: "light",
					fontSize: 14,
				},
			},
		});
	});

	it("does not overwrite a value in the target if the value already exists in the source", () => {
		const target = { a: 1, b: 2 };
		const source = { a: 2 };
		const result = deepMerge(target, source);
		expect(result).toEqual({ a: 2, b: 2 });
	});

	it("handles empty source or target objects", () => {
		const target = { a: 1 };
		const source = {};
		const result = deepMerge(target, source);
		expect(result).toEqual({ a: 1 });

		const targetEmpty = {};
		const sourceEmpty = { b: 2 };
		const resultEmpty = deepMerge(targetEmpty, sourceEmpty);
		expect(resultEmpty).toEqual({ b: 2 });
	});

	it("handles nested arrays by not merging them (shallow merge only for objects)", () => {
		const target = { a: [1, 2], b: 3 };
		const source = { a: [4, 5] };
		const result = deepMerge(target, source);
		expect(result).toEqual({ a: [4, 5], b: 3 });
	});

	it("returns the target if one of the arguments is not an object", () => {
		expect(deepMerge({ test: "test" }, undefined)).toEqual({ test: "test" });
		expect(deepMerge(undefined, { test: "test" })).toBe(undefined);
		expect(deepMerge([1, 2], { test: "test" })).toEqual([1, 2]);
		expect(deepMerge({ test: "test" }, [1, 2])).toEqual({ test: "test" });
	});

	it("does not mutate the original target", () => {
		const target = { a: { b: 1 } };
		const source = { a: { c: 2 } };
		const result = deepMerge(target, source);
		expect(result).toEqual({ a: { b: 1, c: 2 } });
		expect(target).toEqual({ a: { b: 1 } });
	});

	it("does not mutate the original source", () => {
		const target = { a: { b: 1 } };
		const source = { a: { c: 2 } };
		const result = deepMerge(target, source);
		expect(result).toEqual({ a: { b: 1, c: 2 } });
		expect(source).toEqual({ a: { c: 2 } });
	});
});
