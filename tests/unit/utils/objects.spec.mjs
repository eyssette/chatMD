import { deepMerge } from "../../../app/js/utils/objects.mjs";

describe("deepMerge", () => {
	it("merges flat objects by adding properties from objectToMergeIn into baseObject", () => {
		const baseObject = { a: 1, b: 2 };
		const objectToMergeIn = { c: 3, d: 4 };
		const mergedObject = deepMerge(baseObject, objectToMergeIn);
		expect(mergedObject).toEqual({ a: 1, b: 2, c: 3, d: 4 });
	});

	it("merges nested objects", () => {
		const baseObject = { a: { x: 1 }, b: 2, d: { x: 1, y: 2 } };
		const objectToMergeIn = { a: { y: 2 }, c: 3, d: { z: 3 } };
		const mergedObject = deepMerge(baseObject, objectToMergeIn);
		expect(mergedObject).toEqual({
			a: { x: 1, y: 2 },
			b: 2,
			c: 3,
			d: { x: 1, y: 2, z: 3 },
		});
	});

	it("merges nested objects deeply", () => {
		const baseObject = { user: { name: "Alice", prefs: { theme: "light" } } };
		const objectToMergeIn = { user: { prefs: { fontSize: 14 } } };
		const mergedObject = deepMerge(baseObject, objectToMergeIn);
		expect(mergedObject).toEqual({
			user: {
				name: "Alice",
				prefs: {
					theme: "light",
					fontSize: 14,
				},
			},
		});
	});

	it("overwrites non-object values in the baseObject with non-object values from objectToMergeIn", () => {
		const baseObject = { a: 1, b: 2 };
		const objectToMergeIn = { a: 2 };
		const mergedObject = deepMerge(baseObject, objectToMergeIn);
		expect(mergedObject).toEqual({ a: 2, b: 2 });
	});

	it("overwrites non-object values in the baseObject with object values from objectToMergeIn ", () => {
		const baseObject = { a: 1, b: 2 };
		const objectToMergeIn = { a: { c: 3, d: 4 } };
		const mergedObject = deepMerge(baseObject, objectToMergeIn);
		expect(mergedObject).toEqual({ a: { c: 3, d: 4 }, b: 2 });
	});

	it("handles empty objectToMergeIn or baseObject", () => {
		const baseObject = { a: 1 };
		const objectToMergeIn = {};
		const mergedObject = deepMerge(baseObject, objectToMergeIn);
		expect(mergedObject).toEqual({ a: 1 });

		const baseObjectEmpty = {};
		const objectToMergeInEmpty = { b: 2 };
		const mergedObjectEmpty = deepMerge(baseObjectEmpty, objectToMergeInEmpty);
		expect(mergedObjectEmpty).toEqual({ b: 2 });
	});

	it("handles nested arrays by not merging them and overwrites with elements from objectToMergeIn", () => {
		const baseObject = { a: [1, 2], b: 3 };
		const objectToMergeIn = { a: [4, 5] };
		const mergedObject = deepMerge(baseObject, objectToMergeIn);
		expect(mergedObject).toEqual({ a: [4, 5], b: 3 });
	});

	it("returns the valid object when the other input is undefined or not a plain object", () => {
		expect(deepMerge({ test: "test" }, undefined)).toEqual({ test: "test" });
		expect(deepMerge(undefined, { test: "test" })).toEqual({ test: "test" });
		expect(deepMerge([1, 2], { test: "test" })).toEqual({ test: "test" });
		expect(deepMerge({ test: "test" }, [1, 2])).toEqual({ test: "test" });
	});

	it("does not mutate the original baseObject", () => {
		const baseObject = { a: { b: 1 } };
		const objectToMergeIn = { a: { c: 2 } };
		const mergedObject = deepMerge(baseObject, objectToMergeIn);
		expect(mergedObject).toEqual({ a: { b: 1, c: 2 } });
		expect(baseObject).toEqual({ a: { b: 1 } });
	});

	it("does not mutate the original objectToMergeIn", () => {
		const baseObject = { a: { b: 1 } };
		const objectToMergeIn = { a: { c: 2 } };
		const mergedObject = deepMerge(baseObject, objectToMergeIn);
		expect(mergedObject).toEqual({ a: { b: 1, c: 2 } });
		expect(objectToMergeIn).toEqual({ a: { c: 2 } });
	});

	it("mutates the original objectToMergeIn or the originale baseObject when reassigned with the result of deepMerge", () => {
		let baseObject = { a: { b: 1 } };
		let objectToMergeIn = { a: { c: 2 } };
		objectToMergeIn = deepMerge(baseObject, objectToMergeIn);
		baseObject = deepMerge(baseObject, objectToMergeIn);
		expect(objectToMergeIn).toEqual({ a: { b: 1, c: 2 } });
		expect(baseObject).toEqual({ a: { b: 1, c: 2 } });
	});
});
