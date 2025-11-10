import { describe, expect, test } from "vitest";
import { queryClient } from "./api";

describe("QueryClient configuration", () => {
  test("should have gcTime configured for memory management", () => {
    const defaultOptions = queryClient.getDefaultOptions();
    expect(defaultOptions.queries?.gcTime).toBeDefined();
    expect(defaultOptions.queries?.gcTime).toBe(2 * 60 * 1000); // 2 minutes
  });

  test("should have staleTime configured", () => {
    const defaultOptions = queryClient.getDefaultOptions();
    expect(defaultOptions.queries?.staleTime).toBeDefined();
    expect(defaultOptions.queries?.staleTime).toBe(5 * 60 * 1000); // 5 minutes
  });

  test("gcTime should be less than staleTime to prevent memory leaks", () => {
    const defaultOptions = queryClient.getDefaultOptions();
    const gcTime = defaultOptions.queries?.gcTime || 0;
    const staleTime = defaultOptions.queries?.staleTime || 0;
    // gcTime should be less than or equal to staleTime for proper cleanup
    expect(gcTime).toBeLessThanOrEqual(staleTime);
  });
});
