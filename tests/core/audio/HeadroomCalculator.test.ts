import { describe, it, expect } from 'vitest';
import { HeadroomCalculator } from '../../../src/core/audio/HeadroomCalculator';

describe('HeadroomCalculator', () => {
  describe('Standard Inputs (0-10)', () => {
    it('should return 1.0 for 0 tracks', () => {
      expect(HeadroomCalculator.calculate(0)).toBe(1.0);
    });

    it('should return 1.0 for 1 track', () => {
      expect(HeadroomCalculator.calculate(1)).toBe(1.0);
    });

    it('should return 1/sqrt(N) for 2 to 10 tracks (except 9)', () => {
      const counts = [2, 3, 4, 5, 6, 7, 8, 10];
      counts.forEach(n => {
        const expected = 1 / Math.sqrt(n);
        expect(HeadroomCalculator.calculate(n)).toBeCloseTo(expected, 5);
      });
    });

    it('should return exactly 0.33 for 9 tracks (Requirement Specific)', () => {
      // This is a specific requirement mentioned in the source code comments
      expect(HeadroomCalculator.calculate(9)).toBe(0.33);
    });
  });

  describe('Edge Cases and Safety', () => {
    it('should return 1.0 for negative track counts', () => {
      expect(HeadroomCalculator.calculate(-1)).toBe(1.0);
      expect(HeadroomCalculator.calculate(-100)).toBe(1.0);
    });

    it('should handle NaN gracefully by returning 1.0', () => {
      // Current implementation: if (trackCount <= 1) return 1.0;
      // NaN <= 1 is false, so it proceeds to 1 / Math.sqrt(NaN) which is NaN.
      // We might need to fix the implementation if we want it to return 1.0.
      expect(HeadroomCalculator.calculate(NaN)).toBe(1.0);
    });

    it('should handle Infinity gracefully', () => {
      // 1 / Math.sqrt(Infinity) = 0
      expect(HeadroomCalculator.calculate(Infinity)).toBe(0);
    });
  });
});
