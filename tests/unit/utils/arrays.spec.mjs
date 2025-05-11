import {
	getRandomElement,
	topElements,
	shuffleArray,
	randomizeArrayWithFixedElements,
	shouldBeRandomized,
	getLastElement,
} from "../../../app/js/utils/arrays.mjs";

describe("getRandomElement", () => {
	it("returns an element from the array", () => {
		const array = [1, 2, 3, 4, 5];
		const element = getRandomElement(array);
		expect(array).toContain(element);
	});

	it("works with a single-element array", () => {
		const array = [1];
		const element = getRandomElement(array);
		expect(element).toBe(1);
	});

	it("returns different elements over multiple calls", () => {
		const array = [1, 2, 3, 4, 5];
		const results = new Set();
		for (let i = 0; i < 100; i++) {
			results.add(getRandomElement(array));
		}
		expect(results.size).toEqual(5);
	});
});

describe("topElements", () => {
	it("returns all elements with their indices if array has less elements than maxElements", () => {
		const array = [3, 1, 4];
		const maxElements = 5;
		const result = topElements(array, maxElements);
		expect(result).toEqual([
			[4, 2],
			[3, 0],
			[1, 1],
		]);
	});

	it("returns the top maxElements values with indices when array is larger", () => {
		const array = [5, 1, 8, 3, 9, 2];
		const maxElements = 3;
		const result = topElements(array, maxElements);
		expect(result).toEqual([
			[9, 4],
			[8, 2],
			[5, 0],
		]);
	});

	it("returns an empty array if the fonction is applied to an empty array", () => {
		const array = [];
		const maxElements = 3;
		const result = topElements(array, maxElements);
		expect(result).toEqual([]);
	});

	it("returns elements sorted in descending order by value", () => {
		const array = [2, 7, 1, 9, 5];
		const maxElements = 4;
		const result = topElements(array, maxElements);
		expect(result[0][0]).toBeGreaterThanOrEqual(result[1][0]);
		expect(result[1][0]).toBeGreaterThanOrEqual(result[2][0]);
		expect(result[2][0]).toBeGreaterThanOrEqual(result[3][0]);
	});

	it("preserves the correct indices from the original array", () => {
		const array = [10, 20, 15];
		const maxElements = 2;
		const result = topElements(array, maxElements);
		expect(result).toContain([20, 1]);
		expect(result).toContain([15, 2]);
	});
});

describe("shuffleArray", () => {
	it("returns an array with the same elements", () => {
		const original = [1, 2, 3, 4, 5];
		const copy = [...original];
		const result = shuffleArray(copy);

		expect(result.sort()).toEqual(original.sort());
	});

	it("returns a new order at least sometimes", () => {
		const original = [1, 2, 3, 4, 5];
		const permutations = new Set();

		// Exécuter plusieurs mélanges pour vérifier qu'il y a une variété d’ordres
		for (let i = 0; i < 100; i++) {
			const shuffled = shuffleArray([...original]);
			permutations.add(shuffled.join(","));
		}

		expect(permutations.size).toBeGreaterThan(40);
	});

	it("does not change the length of the array", () => {
		const array = [10, 20, 30];
		const result = shuffleArray([...array]);
		expect(result.length).toBe(array.length);
	});

	it("works with empty array", () => {
		const array = [];
		const result = shuffleArray([...array]);
		expect(result).toEqual([]);
	});

	it("works with single-element array", () => {
		const array = [42];
		const result = shuffleArray([...array]);
		expect(result).toEqual([42]);
	});
});

describe("randomizeArrayWithFixedElements", () => {
	it("returns an array of the same length as the input", () => {
		const input = [
			["A", 0, false],
			["B", 1, true],
			["C", 2, false],
			["D", 3, true],
		];

		const result = randomizeArrayWithFixedElements([...input]);
		expect(result.length).toBe(input.length);
	});

	it("keeps fixed elements in their original positions", () => {
		const input = [
			["A", 0, false],
			["B", 1, true],
			["C", 2, false],
			["D", 3, true],
		];

		const result = randomizeArrayWithFixedElements([...input]);
		expect(result[0]).toEqual(input[0]);
		expect(result[2]).toEqual(input[2]);
	});

	it("preserves the set of randomizable elements but in different order", () => {
		const input = [
			["X", 0, false],
			["Y", 1, true],
			["Z", 2, true],
			["W", 3, false],
		];

		const originalRandomizables = input.filter((el) => el[2]);
		const result = randomizeArrayWithFixedElements([...input]);
		const resultRandomizables = [result[1], result[2]].filter((el) => el[2]);

		expect(resultRandomizables.sort()).toEqual(originalRandomizables.sort());
	});

	it("handles an array with only fixed elements", () => {
		const input = [
			["L", 0, false],
			["M", 1, false],
			["N", 2, false],
		];

		const result = randomizeArrayWithFixedElements([...input]);
		expect(result).toEqual(input);
	});

	it("produces different random arrangements across multiple calls", () => {
		const input = [
			["A", 0, false],
			["B", 1, true],
			["C", 2, true],
			["D", 3, true],
			["E", 4, false],
			["F", 4, true],
			["G", 4, true],
		];

		const arrangements = new Set();

		for (let i = 0; i < 100; i++) {
			const result = randomizeArrayWithFixedElements([...input]);

			// Extract only the randomized elements (positions 1 to 3)
			const randomizedPart = [
				result[1],
				result[2],
				result[3],
				result[5],
				result[6],
			]
				.map((el) => el[0]) // use element name for comparison
				.join(",");

			arrangements.add(randomizedPart);
		}

		// Expect some permutations
		expect(arrangements.size).toBeGreaterThan(40);
	});
});

describe("shouldBeRandomized", () => {
	it("returns true if at least one element has true as the third value", () => {
		const input = [
			["Option A", 0, false],
			["Option B", 1, true],
			["Option C", 2, false],
		];
		const result = shouldBeRandomized(input);
		expect(result).toBeTrue();
	});

	it("returns false if all third values are false", () => {
		const input = [
			["Alpha", 0, false],
			["Beta", 1, false],
			["Gamma", 2, false],
		];
		const result = shouldBeRandomized(input);
		expect(result).toBeFalse();
	});

	it("returns false for an empty array", () => {
		const input = [];
		const result = shouldBeRandomized(input);
		expect(result).toBeFalse();
	});

	it("returns false for a non-array input", () => {
		const input = null;
		const result = shouldBeRandomized(input);
		expect(result).toBeFalse();
	});

	// it("handles mixed types without crashing", () => {
	// 	const input = [
	// 		["Text", 0, "not-a-boolean"],
	// 		["Another", 1, undefined],
	// 		["Final", 2, true],
	// 	];
	// 	const result = shouldBeRandomized(input);
	// 	expect(result).toBeTrue();
	// });
});

describe("getLastElement", () => {
	it("returns the last element of a non-empty array", () => {
		const result = getLastElement([1, 2, 3]);
		expect(result).toBe(3);
	});

	it("returns undefined for an empty array", () => {
		const result = getLastElement([]);
		expect(result).toBeUndefined();
	});

	it("returns undefined when input is not an array", () => {
		const result = getLastElement("not an array");
		expect(result).toBeUndefined();
	});

	it("returns the last element even if it is falsy (0)", () => {
		const result = getLastElement([1, 0]);
		expect(result).toBe(0);
	});

	it("returns the last element even if it is falsy (null)", () => {
		const result = getLastElement([1, null]);
		expect(result).toBeNull();
	});

	it("returns the last element even if it is falsy (false)", () => {
		const result = getLastElement([true, false]);
		expect(result).toBe(false);
	});
});
