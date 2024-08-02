import terser from '@rollup/plugin-terser';
import { string } from "rollup-plugin-string";

export default {
	input: 'scripts/chatbotData.js',
	output: {
		file: 'bundle.js',
		format: 'iife',
		plugins: [terser()]
	},
	plugins: [
		string({
		  // Required to be specified
		  include: "data/*.md",
		})
	  ]
};