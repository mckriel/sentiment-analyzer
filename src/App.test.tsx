import React from 'react';
import { render, screen } from '@testing-library/react';
import App, { compareSentiments, SentimentResult  } from './App';

describe('compareSentiments', () => {
	it('correctly orders sentiments', () => {
		const testCases = [
			{ a: 'positive', b: 'neutral', expected: -1 },
			{ a: 'neutral', b: 'mixed', expected: -1 },
			{ a: 'mixed', b: 'negative', expected: -1 },
			{ a: 'positive', b: 'negative', expected: -1 }
		];

		testCases.forEach(({ a, b, expected }) => {
			const result = compareSentiments(
				{ sentiment: a, score: 0.5, text: '' },
				{ sentiment: b, score: 0.5, text: '' },
			);
			expect(Math.sign(result)).toBe(expected);
		});
	});

	it('sortes descending by score within the same sentiment', () => {
		const a = { sentiment: 'positive', score: 0.9, text: '' };
		const b = { sentiment: 'positive', score: 0.8, text: '' };
		expect(compareSentiments(a, b)).toBeLessThan(0);
		expect(compareSentiments(b, a)).toBeGreaterThan(0);
	});

	it('returns 0 for identical sentiments', () => {
		const a = { sentiment: 'neutral', score: 0.7, text: '' };
		const b = { sentiment: 'neutral', score: 0.7, text: '' };
		expect(compareSentiments(a, b)).toBe(0);
	});

	it('handles null values correctly', () => {
		const validItem = { sentiment: 'positive', score: 0.9, text: '' };
		
		expect(compareSentiments(validItem, null)).toBeLessThan(0);
		expect(compareSentiments(null, validItem)).toBeGreaterThan(0);
		expect(compareSentiments(null, null)).toBe(0);
	  });
	
	  // Test case sensitivity
	  it('handles case-insensitive sentiment values', () => {
		const a = { sentiment: 'POSITIVE', score: 0.5, text: '' };
		const b = { sentiment: 'positive', score: 0.5, text: '' };
		expect(compareSentiments(a, b)).toBe(0);
	  });

});

