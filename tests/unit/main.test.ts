/**
 * Simple unit test for main.ts
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';

describe('Main Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should log "it works" to console', () => {
    // Mock console.log
    const mockLog = vi.fn();
    vi.spyOn(console, 'log').mockImplementation(mockLog);

    // Import and run the main module
    require('../../src/main.ts');

    // Verify console.log was called with "it works"
    expect(console.log).toHaveBeenCalledWith('it works');

    // Restore mock
    vi.restoreAllMocks();
  });
});