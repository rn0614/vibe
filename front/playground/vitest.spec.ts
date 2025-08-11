import { test, expect } from 'vitest';

const addOne = (num: number) => num + 1;


describe('addOne', () => {
  test('addOne: 1 + 1 = 2', () => {
    expect(addOne(1)).toBe(2);
  });
});
