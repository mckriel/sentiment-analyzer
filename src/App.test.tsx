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
describe('sentiment analysis app', () => {
	const mockSentimentResponse = (sentiment: string, score: number) => ({
		Sentiment: sentiment,
		SentimentScore: {
		  Positive: sentiment === 'POSITIVE' ? score : 0,
		  Negative: sentiment === 'NEGATIVE' ? score : 0,
		  Neutral: sentiment === 'NEUTRAL' ? score : 0,
		  Mixed: sentiment === 'MIXED' ? score : 0
		}
	});

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('sorting algorithm', () => {
		const testResults: SentimentResult[] = [
			{ text: 'A', sentiment: 'negative', score: 0.9 },
			{ text: 'B', sentiment: 'positive', score: 0.8 },
			{ text: 'C', sentiment: 'positive', score: 0.9 },
			{ text: 'D', sentiment: 'neutral', score: 0.7 }
		];

		test('sorts by sentiment priority (POSITIVE > NEUTRAL > MIXED > NEGATIVE)', () => {
			const sorted = testResults.slice().sort(compareSentiments);
			expect(sorted.map(r => r.text)).toEqual(['C', 'B', 'D', 'A']);
		});
	  
		test('sorts by score descending within same sentiment', () => {
			const positiveOnly = testResults.filter(r => r.sentiment === 'positive');
			const sorted = positiveOnly.slice().sort(compareSentiments);
			expect(sorted[0].score).toBeGreaterThan(sorted[1].score);
		});

		it('returns 0 for identical sentiment scores of the same sentiment', () => {
			const a = { sentiment: 'neutral', score: 0.7, text: '' };
			const b = { sentiment: 'neutral', score: 0.7, text: '' };
			expect(compareSentiments(a, b)).toBe(0);
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

