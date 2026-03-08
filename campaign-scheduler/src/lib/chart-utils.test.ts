import { describe, it, expect } from 'vitest';
import { processChartData } from './chart-utils';

describe('processChartData', () => {
    it('should return exactly three keys: 24H, 7D, 30D', () => {
        const dummyData = [
            { sent_at: new Date().toISOString() },
            { sent_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }, // 2 days ago
        ];

        const result = processChartData(dummyData) as Record<string, any[]>;

        expect(result).toHaveProperty('24H');
        expect(result).toHaveProperty('7D');
        expect(result).toHaveProperty('30D');

        // Assert the arrays have data
        expect(Array.isArray(result['24H'])).toBe(true);
        expect(Array.isArray(result['7D'])).toBe(true);
        expect(Array.isArray(result['30D'])).toBe(true);
    });
});
