import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App, { compareSentiments, SentimentResult  } from './App';
import { ComprehendClient, DetectSentimentCommand } from '@aws-sdk/client-comprehend';


// mock aws sdk
jest.mock('@aws-sdk/client-comprehend', () => ({
	ComprehendClient: jest.fn(() => ({
	  send: jest.fn()
	})),
	DetectSentimentCommand: jest.fn()
}));


// SECTION: 
describe('compareSentiments', () => {
	const testData1: SentimentResult[] = [
		{ text: 'A', sentiment: 'negative', score: 0.9 },
		{ text: 'B', sentiment: 'positive', score: 0.8 },
		{ text: 'C', sentiment: 'positive', score: 0.9 },
		{ text: 'D', sentiment: 'neutral', score: 0.7 }
	];

	const testData2: (SentimentResult | null)[] = [
		{ text: "A", sentiment: "positive", score: 95 },
		{ text: "B", sentiment: "neutral", score: 80 },
		{ text: "C", sentiment: "positive", score: 95 }, // Same score as A
		null,
	];

	describe('sorting algorithm', () => {

		test('sorts by sentiment priority (POSITIVE > NEUTRAL > MIXED > NEGATIVE)', () => {
			const sorted = testData1.slice().sort(compareSentiments);
			expect(sorted.map(r => r.text)).toEqual(['C', 'B', 'D', 'A']);
		});
	  
		test('sorts by score descending within same sentiment', () => {
			const positiveOnly = testData1.filter(r => r.sentiment === 'positive');
			const sorted = positiveOnly.slice().sort(compareSentiments);
			expect(sorted[0].score).toBeGreaterThan(sorted[1].score);
		});

		test('returns 0 for identical sentiment scores of the same sentiment', () => {
			const a = { sentiment: 'neutral', score: 0.7, text: '' };
			const b = { sentiment: 'neutral', score: 0.7, text: '' };
			expect(compareSentiments(a, b)).toBe(0);
		});

		test('sorts null values to the bottom', () => {
			const sorted = [...testData2].sort(compareSentiments);
			expect(sorted[sorted.length - 1]).toBeNull();
		});

		test('handles identical objects', () => {
			const a = testData2[0]!;
			expect(compareSentiments(a, a)).toBe(0);
		});
	});
});









// SECTION: Test the compareSentiments sorting functionality only
// describe('compareSentiments', () => {
// 	it('correctly orders sentiments', () => {
// 		const testCases = [
// 			{ a: 'positive', b: 'neutral', expected: -1 },
// 			{ a: 'neutral', b: 'mixed', expected: -1 },
// 			{ a: 'mixed', b: 'negative', expected: -1 },
// 			{ a: 'positive', b: 'negative', expected: -1 }
// 		];

// 		testCases.forEach(({ a, b, expected }) => {
// 			const result = compareSentiments(
// 				{ sentiment: a, score: 0.5, text: '' },
// 				{ sentiment: b, score: 0.5, text: '' },
// 			);
// 			expect(Math.sign(result)).toBe(expected);
// 		});
// 	});

// 	it('sortes descending by score within the same sentiment', () => {
// 		const a = { sentiment: 'positive', score: 0.9, text: '' };
// 		const b = { sentiment: 'positive', score: 0.8, text: '' };
// 		expect(compareSentiments(a, b)).toBeLessThan(0);
// 		expect(compareSentiments(b, a)).toBeGreaterThan(0);
// 	});

// 	it('returns 0 for identical sentiments', () => {
// 		const a = { sentiment: 'neutral', score: 0.7, text: '' };
// 		const b = { sentiment: 'neutral', score: 0.7, text: '' };
// 		expect(compareSentiments(a, b)).toBe(0);
// 	});

// });

