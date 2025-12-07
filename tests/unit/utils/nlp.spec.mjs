import {
	longestCommonSubstringWeightedLength,
	removeAccents,
	normalizeText,
	levenshteinDistance,
	hasLevenshteinDistanceLessThan,
	dotProduct,
	magnitude,
	tokenize,
	createVector,
	cosineSimilarity,
} from "../../../app/js/utils/nlp.mjs";

describe("longestCommonSubstringWeightedLength", function () {
	const wordLengthFactor = 0.1;

	it("returns a positive weighted length for clear common substring", function () {
		const result = longestCommonSubstringWeightedLength(
			"intelligent",
			"intellect",
			wordLengthFactor,
		);
		expect(result > 0).toBeTrue();
	});

	it("returns 0 when there is no common substring", function () {
		const result = longestCommonSubstringWeightedLength(
			"abc",
			"xyz",
			wordLengthFactor,
		);
		expect(result).toBe(0);
	});

	it("returns 0 when common substring is less than or equal to 4 characters", function () {
		const result = longestCommonSubstringWeightedLength(
			"abcdxyz",
			"xyzabcd",
			wordLengthFactor,
		);
		expect(result).toBe(0);
	});

	it("returns higher score for longer common substring", function () {
		const shortMatch = longestCommonSubstringWeightedLength(
			"abcdefgh",
			"abcdxxxx",
			wordLengthFactor,
		);
		const longMatch = longestCommonSubstringWeightedLength(
			"abcdefgh",
			"abcdefxx",
			wordLengthFactor,
		);
		expect(longMatch > shortMatch).toBeTrue();
	});

	it("gives more weight to substring closer to the start of keyword", function () {
		const earlyMatch = longestCommonSubstringWeightedLength(
			"abcdef",
			"abcdef",
			wordLengthFactor,
		);
		const lateMatch = longestCommonSubstringWeightedLength(
			"abcdef",
			"zzabcdef",
			wordLengthFactor,
		);
		expect(earlyMatch > lateMatch).toBeTrue();
	});

	it("handles empty strings correctly", function () {
		const result1 = longestCommonSubstringWeightedLength(
			"",
			"test",
			wordLengthFactor,
		);
		const result2 = longestCommonSubstringWeightedLength(
			"test",
			"",
			wordLengthFactor,
		);
		expect(result1).toBe(0);
		expect(result2).toBe(0);
	});
});

describe("levenshteinDistance", function () {
	it("returns 0 when comparing two identical strings", function () {
		const result = levenshteinDistance("kitten", "kitten");
		expect(result).toEqual(0);
	});

	it("returns the length of the second string when the first is empty", function () {
		const result = levenshteinDistance("", "test");
		expect(result).toEqual(4);
	});

	it("returns the length of the first string when the second is empty", function () {
		const result = levenshteinDistance("test", "");
		expect(result).toEqual(4);
	});

	it("calculates the distance when one substitution is required", function () {
		const result = levenshteinDistance("kitten", "sitten");
		expect(result).toEqual(1);
	});

	it("calculates the distance when one insertion is required", function () {
		const result = levenshteinDistance("kitten", "kittlen");
		expect(result).toEqual(1);
	});

	it("calculates the distance when one deletion is required", function () {
		const result = levenshteinDistance("kitten", "kiten");
		expect(result).toEqual(1);
	});

	it("computes the correct distance with multiple edits", function () {
		const result = levenshteinDistance("kitten", "sitting");
		expect(result).toEqual(3);
	});

	it("handles completely different strings", function () {
		const result = levenshteinDistance("abc", "xyz");
		expect(result).toEqual(3);
	});

	it("returns 0 when comparing two empty strings", function () {
		const result = levenshteinDistance("", "");
		expect(result).toEqual(0);
	});

	it("treats case-sensitive differences as edits", function () {
		const result = levenshteinDistance("Apple", "apple");
		expect(result).toEqual(1);
	});
});

describe("hasLevenshteinDistanceLessThan", () => {
	const WORD_LENGTH_FACTOR = 0.1;

	it("returns 0 if no n-grams have distance less than threshold", () => {
		const result = hasLevenshteinDistanceLessThan(
			"a string that is not very interesting",
			"a test string",
			2,
			WORD_LENGTH_FACTOR,
		);
		expect(result).toBe(0);
	});

	it("returns correct similarity when one matching n-gram is found", () => {
		const result = hasLevenshteinDistanceLessThan(
			"this is a test string",
			"test string",
			2,
			WORD_LENGTH_FACTOR,
		);
		expect(result).toBeCloseTo(3.3);
	});

	it("returns cumulative similarity for multiple matching n-grams", () => {
		const input = "foo bar foo bar foo bar ";
		const keyword = "foo bar";
		const threshold = 2;
		const result = hasLevenshteinDistanceLessThan(
			input,
			keyword,
			threshold,
			WORD_LENGTH_FACTOR,
		);
		expect(result).toBeCloseTo(6.3, 1);
	});

	it("returns 0 if input string has fewer words than n-gram size", () => {
		const result = hasLevenshteinDistanceLessThan(
			"hello",
			"this is",
			2,
			WORD_LENGTH_FACTOR,
		);
		expect(result).toBe(0);
	});

	it("uses correct n-gram size based on keyWord", () => {
		//
	});
});

describe("removeAccents", function () {
	it("converts lowercase accented vowels to their plain equivalents", function () {
		const result = removeAccents("à â é è ê ë î ï ô ö û ü ù ÿ ç");
		expect(result).toEqual("a a e e e e i i o o u u u y c");
	});

	it("converts uppercase accented vowels to their plain equivalents", function () {
		const result = removeAccents("À Â É È Ê Ë Î Ï Ô Ö Û Ü Ù Ÿ Ç");
		expect(result).toEqual("A A E E E E I I O O U U U Y C");
	});

	it("handles mixed strings with both accented and unaccented characters", function () {
		const result = removeAccents(
			"Portez ce vieux whisky au juge blond qui fume sur son île intérieure, à côté de l'alcôve ovoïde, où les bûches se consument dans l'âtre, ce qui lui permet de penser à la cænogénèse de l'être dont il est question dans la cause ambiguë entendue à Moÿ, dans un capharnaüm qui, pense-t-il, diminue çà et là la qualité de son œuvre.",
		);
		expect(result).toBe(
			"Portez ce vieux whisky au juge blond qui fume sur son ile interieure, a cote de l'alcove ovoide, ou les buches se consument dans l'atre, ce qui lui permet de penser a la cænogenese de l'etre dont il est question dans la cause ambigue entendue a Moy, dans un capharnaum qui, pense-t-il, diminue ca et la la qualite de son œuvre.",
		);
	});

	describe("normalizeText", function () {
		it("removes accents and converts to lowercase by default", function () {
			const result = normalizeText("Éléphant à l'école");
			expect(result).toBe("elephant a l'ecole");
		});
		it("preserves case when keepCase option is true", function () {
			const result = normalizeText("Éléphant à l'école", { keepCase: true });
			expect(result).toBe("Elephant a l'ecole");
		});
		it("handles empty strings", function () {
			const result = normalizeText("");
			expect(result).toBe("");
		});
		it("leaves non-accented strings unchanged except for case", function () {
			const result = normalizeText("Hello World");
			expect(result).toBe("hello world");
		});
	});

	it("handles mixed strings with both accented and unaccented uppercase characters", function () {
		const result = removeAccents(
			"PORTEZ CE VIEUX WHISKY AU JUGE BLOND QUI FUME SUR SON ÎLE INTÉRIEURE, À CÔTÉ DE L'ALCÔVE OVOÏDE, OÙ LES BÛCHES SE CONSUMENT DANS L'ÂTRE, CE QUI LUI PERMET DE PENSER À LA CÆNOGÉNÈSE DE L'ÊTRE DONT IL EST QUESTION DANS LA CAUSE AMBIGUË ENTENDUE À MOŸ, DANS UN CAPHARNAÜM QUI, PENSE-T-IL, DIMINUE ÇÀ ET LÀ LA QUALITÉ DE SON ŒUVRE.",
		);
		expect(result).toBe(
			"PORTEZ CE VIEUX WHISKY AU JUGE BLOND QUI FUME SUR SON ILE INTERIEURE, A COTE DE L'ALCOVE OVOIDE, OU LES BUCHES SE CONSUMENT DANS L'ATRE, CE QUI LUI PERMET DE PENSER A LA CÆNOGENESE DE L'ETRE DONT IL EST QUESTION DANS LA CAUSE AMBIGUE ENTENDUE A MOY, DANS UN CAPHARNAUM QUI, PENSE-T-IL, DIMINUE CA ET LA LA QUALITE DE SON ŒUVRE.",
		);
	});

	it("returns the same string when there are no accented characters", function () {
		const result = removeAccents("Hello World");
		expect(result).toEqual("Hello World");
	});

	it("leaves numbers and non-alphanumeric characters unchanged", function () {
		const result = removeAccents("0123456789 !?%@&");
		expect(result).toEqual("0123456789 !?%@&");
	});

	it("handles an empty string", function () {
		const result = removeAccents("");
		expect(result).toEqual("");
	});
});

describe("dotProduct", function () {
	it("returns 0 when both vectors are empty", function () {
		const result = dotProduct({}, {});
		expect(result).toBe(0);
	});

	it("returns 0 when vectors have no common keys", function () {
		const result = dotProduct({ a: 1 }, { b: 2 });
		expect(result).toBe(0);
	});

	it("returns correct dot product for vectors with common keys", function () {
		const vec1 = { a: 2, b: 3 };
		const vec2 = { a: 4, b: 5 };
		const result = dotProduct(vec1, vec2); // 2*4 + 3*5 = 8 + 15 = 23
		expect(result).toBe(23);
	});

	it("ignores keys not present in both vectors", function () {
		const vec1 = { a: 2, b: 3 };
		const vec2 = { b: 4, c: 5 };
		const result = dotProduct(vec1, vec2); // Only b is common: 3*4 = 12
		expect(result).toBe(12);
	});

	it("handles zero values correctly", function () {
		const vec1 = { a: 0, b: 2 };
		const vec2 = { a: 3, b: 0 };
		const result = dotProduct(vec1, vec2); // 0*3 + 2*0 = 0
		expect(result).toBe(0);
	});

	it("handles negative values correctly", function () {
		const vec1 = { a: -2, b: 3 };
		const vec2 = { a: 4, b: -1 };
		const result = dotProduct(vec1, vec2); // -2*4 + 3*(-1) = -8 - 3 = -11
		expect(result).toBe(-11);
	});
});

describe("magnitude", function () {
	it("returns 0 for an empty vector", function () {
		const result = magnitude({});
		expect(result).toBe(0);
	});

	it("returns the absolute value for a vector with one element", function () {
		const result = magnitude({ a: 3 });
		expect(result).toBe(3);
	});

	it("calculates the correct magnitude for a vector with multiple positive elements", function () {
		const result = magnitude({ a: 3, b: 4 }); // sqrt(9 + 16) = 5
		expect(result).toBe(5);
	});

	it("calculates the correct magnitude for a vector with negative values", function () {
		const result = magnitude({ a: -3, b: -4 }); // sqrt(9 + 16) = 5
		expect(result).toBe(5);
	});

	it("handles zero values correctly", function () {
		const result = magnitude({ a: 0, b: 0 });
		expect(result).toBe(0);
	});
});

describe("tokenize", function () {
	it("returns an empty array when given an empty string", function () {
		const result = tokenize("");
		expect(result.length).toBe(0);
	});

	it("returns an empty array when given only short words", function () {
		const result = tokenize("is a cat dog sun");
		expect(result.length).toBe(0);
	});

	it("tokenizes a single long word", function () {
		const result = tokenize("elephant");
		const tokens = result.map((t) => t.token);
		expect(tokens).toContain("elephant");
		expect(tokens).toContain("eleph");
		expect(tokens).toContain("elepha");
		expect(tokens).toContain("elephan");
	});

	it("removes punctuation and accents", function () {
		const result = tokenize("français, éléphant! éducâtîon");
		const tokens = result.map((t) => t.token);
		expect(tokens).toContain("francais");
		expect(tokens).toContain("elephant");
		expect(tokens).toContain("education");
	});

	it("applies bonus weight when token is in the title and prioritization is enabled", function () {
		const result1 = tokenize("elephant", {
			prioritizeTokensInTitle: true,
			//boostIfKeywordsInTitle: true,
			titleResponse: "The elephant in the Room",
		});
		const result2 = tokenize("elephant", {
			prioritizeTokensInTitle: true,
			//boostIfKeywordsInTitle: false,
			titleResponse: "The Tiger in the Room",
		});
		const match1 = result1.find((t) => t.token === "elephant");
		const match2 = result2.find((t) => t.token === "elephant");
		expect(match1.weight).toBeGreaterThan(match2.weight);
	});

	it("assigns more weight to full words than sub-tokens", function () {
		const result = tokenize("elephant");
		const fullWord = result.find((t) => t.token === "elephant");
		const subToken = result.find((t) => t.token === "elephan");
		expect(fullWord.weight).toBeGreaterThan(subToken.weight);
	});

	it("returns multiple tokens for each qualifying word", function () {
		const result = tokenize("elephant giraffe");
		const tokens = result.map((t) => t.token);
		expect(tokens).toContain("elephant");
		expect(tokens).toContain("giraffe");
		expect(tokens.filter((t) => t === "elephant").length).toBe(1);
		expect(tokens.filter((t) => t.includes("eleph")).length).toBeGreaterThan(0);
	});
});

describe("createVector", function () {
	it("returns an empty object when given an empty string", function () {
		const result = createVector("");
		expect(result).toEqual({});
	});

	it("returns a vector with one entry for a single word", function () {
		const result = createVector("elephant");
		expect(Object.keys(result)).toContain("elephant");
		expect(result["elephant"]).toBeGreaterThan(0);
	});

	it("aggregates weights for repeated tokens", function () {
		const result1 = createVector("elephant");
		const result2 = createVector("elephant elephant");
		expect(result2["elephant"]).toBeGreaterThan(result1["elephant"]);
	});

	it("handles multiple distinct words", function () {
		const result = createVector("elephant giraffe");
		expect(Object.keys(result)).toContain("elephant");
		expect(Object.keys(result)).toContain("giraffe");
	});

	it("respects tokenization options (e.g., title boost)", function () {
		const options = {
			prioritizeTokensInTitle: true,
			//boostIfKeywordsInTitle: true,
			titleResponse: "The Elephant",
		};
		const result1 = createVector("elephant", options);
		const result2 = createVector("elephant", {});
		expect(result1["elephant"]).toBeGreaterThan(result2["elephant"]); // boosted by title presence
	});
});

describe("cosineSimilarity", function () {
	const exampleVector = {
		lorem: 11.2,
		ipsum: 11.2,
		dolor: 11.2,
		consectetur: 6.2,
		conse: 1.4333333333333336,
		onsec: 1.2333333333333334,
		nsect: 1.2333333333333334,
		secte: 1.2333333333333334,
		ectet: 1.2333333333333334,
		ctetu: 1.2333333333333334,
		tetur: 1.2333333333333334,
		consec: 1.8,
		onsect: 1.6,
		nsecte: 1.6,
		sectet: 1.6,
		ectetu: 1.6,
		ctetur: 1.6,
		consect: 2.25,
		onsecte: 2.05,
		nsectet: 2.05,
		sectetu: 2.05,
		ectetur: 2.05,
		adipiscing: 6.2,
		adipi: 1.6,
		dipis: 1.4,
		ipisc: 1.4,
		pisci: 1.4,
		iscin: 1.4,
		scing: 1.4,
		adipis: 2.05,
		dipisc: 1.85,
		ipisci: 1.85,
		piscin: 1.85,
		iscing: 1.85,
		adipisc: 2.666666666666667,
		dipisci: 2.466666666666667,
		ipiscin: 2.466666666666667,
		piscing: 2.466666666666667,
	};

	it("returns 0 when the first parameter is an empty string or is undefined", function () {
		const result1 = cosineSimilarity("", exampleVector);
		const result2 = cosineSimilarity(undefined, exampleVector);
		expect(result1).toBe(0);
		expect(result2).toBe(0);
	});

	it("returns 0 when the chatbot vector is null or undefined", function () {
		const result = cosineSimilarity("test", {});
		expect(result).toBe(0);
	});

	it("returns correct cosine similarity for valid vectors", function () {
		const result1 = cosineSimilarity("Lorem", exampleVector);
		expect(result1).toBeCloseTo(0.5, 1);
		const result2 = cosineSimilarity("Lorem ipsum,", exampleVector);
		expect(result2).toBeCloseTo(0.65, 1);
		const result3 = cosineSimilarity(
			"Lorem ipsum dolor sit amet,",
			exampleVector,
		);
		expect(result3).toBeCloseTo(0.82, 1);
	});

	it("returns a value between -1 and 1", function () {
		const result = cosineSimilarity(
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vel ligula semper, volutpat quam at, pulvinar mauris. ",
			exampleVector,
		);
		expect(result).toBeGreaterThan(-1);
		expect(result).toBeLessThan(1);
	});
});
