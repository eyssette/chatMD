import {
	getRandomElement,
	topElements,
	shuffleArray,
	randomizeArrayWithFixedElements,
	shouldBeRandomized,
	getElementFromEnd,
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
			{ text: "A", link: "url0", isRandom: false },
			{ text: "B", link: "url1", isRandom: true },
			{ text: "C", link: "url2", isRandom: false },
			{ text: "D", link: "url3", isRandom: true },
		];

		const result = randomizeArrayWithFixedElements([...input]);
		expect(result.length).toBe(input.length);
	});

	it("keeps fixed elements in their original positions", () => {
		const input = [
			{ text: "A", link: "url0", isRandom: false },
			{ text: "B", link: "url1", isRandom: true },
			{ text: "C", link: "url2", isRandom: false },
			{ text: "D", link: "url3", isRandom: true },
		];

		const result = randomizeArrayWithFixedElements([...input]);
		expect(result[0]).toEqual(input[0]);
		expect(result[2]).toEqual(input[2]);
	});

	it("preserves the set of randomizable elements but in different order", () => {
		const input = [
			{ text: "X", link: "url0", isRandom: false },
			{ text: "Y", link: "url1", isRandom: true },
			{ text: "Z", link: "url2", isRandom: true },
			{ text: "W", link: "url3", isRandom: false },
		];

		const originalRandomizables = input.filter((el) => el[2]);
		const result = randomizeArrayWithFixedElements([...input]);
		const resultRandomizables = [result[1], result[2]].filter((el) => el[2]);

		expect(resultRandomizables.sort()).toEqual(originalRandomizables.sort());
	});

	it("handles an array with only fixed elements", () => {
		const input = [
			{ text: "L", link: "url0", isRandom: false },
			{ text: "M", link: "url1", isRandom: false },
			{ text: "N", link: "url2", isRandom: false },
		];

		const result = randomizeArrayWithFixedElements([...input]);
		expect(result).toEqual(input);
	});

	it("produces different random arrangements across multiple calls", () => {
		const input = [
			{ text: "A", link: "url0", isRandom: false },
			{ text: "B", link: "url1", isRandom: true },
			{ text: "C", link: "url2", isRandom: true },
			{ text: "D", link: "url3", isRandom: true },
			{ text: "E", link: "url4", isRandom: false },
			{ text: "F", link: "url4", isRandom: true },
			{ text: "G", link: "url4", isRandom: true },
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
				.map((el) => el.text) // use element name for comparison
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
			{ text: "Option A", link: "url0", isRandom: false },
			{ text: "Option B", link: "url1", isRandom: true },
			{ text: "Option C", link: "url2", isRandom: false },
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

describe("getElementFromEnd", () => {
	it("returns the last element of a non-empty array", () => {
		const result = getElementFromEnd([1, 2, 3]);
		expect(result).toBe(3);
	});

	it("returns undefined for an empty array", () => {
		const result = getElementFromEnd([]);
		expect(result).toBeUndefined();
	});

	it("returns undefined when input is not an array", () => {
		const result = getElementFromEnd("not an array");
		expect(result).toBeUndefined();
	});

	it("returns the last element even if it is falsy (0)", () => {
		const result = getElementFromEnd([1, 0]);
		expect(result).toBe(0);
	});

	it("returns the last element even if it is falsy (null)", () => {
		const result = getElementFromEnd([1, null]);
		expect(result).toBeNull();
	});

	it("returns the last element even if it is falsy (false)", () => {
		const result = getElementFromEnd([true, false]);
		expect(result).toBe(false);
	});

	it("returns the last element when n is 1", () => {
		const result = getElementFromEnd([10, 20, 30], 1);
		expect(result).toBe(30);
	});

	it("returns the second-to-last element when n is 2", () => {
		const result = getElementFromEnd([10, 20, 30], 2);
		expect(result).toBe(20);
	});

	it("returns the correct element when n is equal to array length", () => {
		const result = getElementFromEnd([10, 20, 30], 3);
		expect(result).toBe(10);
	});

	it("returns undefined when n is greater than array length", () => {
		const result = getElementFromEnd([10, 20, 30], 4);
		expect(result).toBeUndefined();
	});

	it("returns undefined when n is zero", () => {
		const result = getElementFromEnd([10, 20, 30], 0);
		expect(result).toBeUndefined();
	});

	it("returns undefined when n is negative", () => {
		const result = getElementFromEnd([10, 20, 30], -1);
		expect(result).toBeUndefined();
	});

	it("returns undefined when array is empty", () => {
		const result = getElementFromEnd([], 1);
		expect(result).toBeUndefined();
	});

	it("returns falsy value if it exists at the target position", () => {
		const result = getElementFromEnd([true, null, false], 1);
		expect(result).toBe(false);
	});
});
