import { evaluateExpression } from "../../../../../app/js/markdown/custom/variablesDynamic/evaluateExpression.mjs";

// Tests unitaires pour la fonction evaluateExpression
describe("evaluateExpression", () => {
	const dynamicVariables = {
		num1: "10",
		num2: "20",
		str1: "Hello",
		str2: "World",
		boolTrue: true,
		boolFalse: false,
		json: '{"key": "value"}',
		jsonObj: '{"numbers": [1, 2, 3]}',
	};

	it("returns correct result for arithmetic expressions", () => {
		expect(
			evaluateExpression(
				'tryConvertStringToNumber(dynamicVariables["num1"]) + tryConvertStringToNumber(dynamicVariables["num2"])',
				dynamicVariables,
			),
		).toBe(30);
		expect(
			evaluateExpression(
				'tryConvertStringToNumber(dynamicVariables["num2"]) - tryConvertStringToNumber(dynamicVariables["num1"])',
				dynamicVariables,
			),
		).toBe(10);
		expect(
			evaluateExpression(
				'tryConvertStringToNumber(dynamicVariables["num1"]) * 2',
				dynamicVariables,
			),
		).toBe(20);
		expect(
			evaluateExpression(
				'tryConvertStringToNumber(dynamicVariables["num2"]) / 2',
				dynamicVariables,
			),
		).toBe(10);
		expect(
			evaluateExpression(
				'(tryConvertStringToNumber(dynamicVariables["num1"]) + tryConvertStringToNumber(dynamicVariables["num2"])) * 2',
				dynamicVariables,
			),
		).toBe(60);
	});

	it("returns correct result for string operations", () => {
		expect(
			evaluateExpression(
				'dynamicVariables["str1"] + " " + dynamicVariables["str2"]',
				dynamicVariables,
			),
		).toBe("Hello World");
		expect(
			evaluateExpression(
				'dynamicVariables["str1"].toUpperCase() + " " + dynamicVariables["str2"].toLowerCase()',
				dynamicVariables,
			),
		).toBe("HELLO world");
		expect(
			evaluateExpression(
				'dynamicVariables["str1"].length + dynamicVariables["str2"].length',
				dynamicVariables,
			),
		).toBe(10);
		expect(
			evaluateExpression(
				'dynamicVariables["str1"].includes("lo")',
				dynamicVariables,
			),
		).toBe(true);
		expect(
			evaluateExpression(
				'dynamicVariables["str2"].startsWith("W")',
				dynamicVariables,
			),
		).toBe(true);
		expect(
			evaluateExpression(
				'dynamicVariables["str2"].endsWith("d")',
				dynamicVariables,
			),
		).toBe(true);
		expect(
			evaluateExpression(
				'dynamicVariables["str1"].trim() + dynamicVariables["str2"].trim()',
				dynamicVariables,
			),
		).toBe("HelloWorld");
		expect(
			evaluateExpression(
				'dynamicVariables["str1"].replace("l", "x")',
				dynamicVariables,
			),
		).toBe("Hexlo");
		expect(
			evaluateExpression(
				'dynamicVariables["str2"].replaceAll("o", "a")',
				dynamicVariables,
			),
		).toBe("Warld");
	});

	it("returns correct result for logical expressions", () => {
		expect(
			evaluateExpression(
				'tryConvertStringToNumber(dynamicVariables["num1"]) > 5 && tryConvertStringToNumber(dynamicVariables["num2"]) < 30',
				dynamicVariables,
			),
		).toBe(true);
		expect(
			evaluateExpression(
				'!(tryConvertStringToNumber(dynamicVariables["num1"]) < 5) || tryConvertStringToNumber(dynamicVariables["num2"]) > 15',
				dynamicVariables,
			),
		).toBe(true);
		expect(
			evaluateExpression(
				'!(dynamicVariables["str1"] == "Hello") && dynamicVariables["str2"] == "World"',
				dynamicVariables,
			),
		).toBe(false);
	});

	it("returns correct result for Math expressions", () => {
		expect(
			evaluateExpression(
				'Math.max(tryConvertStringToNumber(dynamicVariables["num1"]), tryConvertStringToNumber(dynamicVariables["num2"]))',
				dynamicVariables,
			),
		).toBe(20);
		expect(
			evaluateExpression(
				'Math.min(tryConvertStringToNumber(dynamicVariables["num1"]), tryConvertStringToNumber(dynamicVariables["num2"]))',
				dynamicVariables,
			),
		).toBe(10);
		expect(
			evaluateExpression(
				'Math.round(tryConvertStringToNumber(dynamicVariables["num2"]) / 3)',
				dynamicVariables,
			),
		).toBe(7);
		expect(
			evaluateExpression(
				'Math.abs(tryConvertStringToNumber(dynamicVariables["num1"]) - 15)',
				dynamicVariables,
			),
		).toBe(5);
	});

	it("returns correct result for comparison expressions", () => {
		expect(
			evaluateExpression(
				'tryConvertStringToNumber(dynamicVariables["num1"]) < tryConvertStringToNumber(dynamicVariables["num2"])',
				dynamicVariables,
			),
		).toBe(true);
		expect(
			evaluateExpression(
				'tryConvertStringToNumber(dynamicVariables["num1"]) <= tryConvertStringToNumber(dynamicVariables["num1"])',
				dynamicVariables,
			),
		).toBe(true);
		expect(
			evaluateExpression(
				'tryConvertStringToNumber(dynamicVariables["num2"]) > tryConvertStringToNumber(dynamicVariables["num1"])',
				dynamicVariables,
			),
		).toBe(true);
		expect(
			evaluateExpression(
				'tryConvertStringToNumber(dynamicVariables["num2"]) >= tryConvertStringToNumber(dynamicVariables["num2"])',
				dynamicVariables,
			),
		).toBe(true);
		expect(
			evaluateExpression(
				'dynamicVariables["str1"] == "Hello"',
				dynamicVariables,
			),
		).toBe(true);
		expect(
			evaluateExpression(
				'dynamicVariables["str2"] != "Hello"',
				dynamicVariables,
			),
		).toBe(true);
	});

	it("returns correct result for boolean expressions", () => {
		expect(
			evaluateExpression('dynamicVariables["boolTrue"]', dynamicVariables),
		).toBe(true);
		expect(
			evaluateExpression(
				'dynamicVariables["boolTrue"] || dynamicVariables["boolFalse"]',
				dynamicVariables,
			),
		).toBe(true);
		expect(
			evaluateExpression(
				'dynamicVariables["boolFalse"] || false',
				dynamicVariables,
			),
		).toBe(false);
	});

	it("returns correct result for JSON operations", () => {
		expect(
			evaluateExpression(
				'JSON.parse(dynamicVariables["json"]).key',
				dynamicVariables,
			),
		).toBe("value");
		expect(
			evaluateExpression(
				'JSON.parse(dynamicVariables["jsonObj"]).numbers[1]',
				dynamicVariables,
			),
		).toBe(2);
	});

	it("returns correct result for mainTopic function", () => {
		expect(
			evaluateExpression(
				`mainTopic("Je m'intéresse beaucoup à la photographie")`,
				dynamicVariables,
			),
		).toBe("photographie");

		expect(
			evaluateExpression(
				`mainTopic("Je voudrais des informations sur les vélos électriques")`,
				dynamicVariables,
			),
		).toBe("vélos électriques");
	});

	it("does not execute disallowed and potentially dangerous code or XSS attacks", () => {
		expect(() => {
			evaluateExpression("while(true) {}", dynamicVariables);
		}).toThrow();
		expect(() => {
			evaluateExpression('fetch("http://malicious.com")', dynamicVariables);
		}).toThrow();
		const evilCode = `const fs=require("fs");fs.writeFileSync("hacked.txt", "You have been hacked!");`;
		expect(() => {
			evaluateExpression(evilCode, dynamicVariables);
		}).toThrow();
		expect(() => {
			evaluateExpression('alert("XSS")', dynamicVariables);
		}).toThrow();
		expect(() => {
			evaluateExpression("process.exit()", dynamicVariables);
		}).toThrow();
		expect(() => {
			evaluateExpression('require("fs")', dynamicVariables);
		}).toThrow();
		expect(() => {
			evaluateExpression('eval("while(true) {}")', dynamicVariables);
		}).toThrow();
	});

	// Measure performance
	it("returns result within acceptable time for complex expressions", () => {
		const complexExpression = `(Math.max(tryConvertStringToNumber(dynamicVariables["num1"]), tryConvertStringToNumber(dynamicVariables["num2"])) * Math.min(tryConvertStringToNumber(dynamicVariables["num1"]), tryConvertStringToNumber(dynamicVariables["num2"]))) / (Math.abs(tryConvertStringToNumber(dynamicVariables["num2"]) - tryConvertStringToNumber(dynamicVariables["num1"])) + 1) + JSON.parse(dynamicVariables["jsonObj"]).numbers[0] + (dynamicVariables["str1"].length + dynamicVariables["str2"].length)`;
		const startTime = performance.now();
		const result = evaluateExpression(complexExpression, dynamicVariables);
		const endTime = performance.now();
		const timeTaken = endTime - startTime;
		expect(result).toBe(29.181818181818183);
		expect(timeTaken).toBeLessThan(1); // Doit s'exécuter en moins de 1 ms
		// Si on exécute une deuxième fois, ça doit être encore plus rapide grâce au cache
		const startTime2 = performance.now();
		const result2 = evaluateExpression(complexExpression, dynamicVariables);
		const endTime2 = performance.now();
		const timeTaken2 = endTime2 - startTime2;
		expect(result2).toBe(29.181818181818183);
		expect(timeTaken2).toBeLessThan(timeTaken);
		expect(timeTaken2).toBeLessThan(0.05); // Doit s'exécuter en moins de 0.05 ms
	});
});
