import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  THEME_STORAGE_KEY,
  applyTheme,
  normalizeTheme,
  readStoredTheme,
  toggleTheme,
  writeStoredTheme,
  type Theme,
} from "./theme";

describe("normalizeTheme", () => {
  it("accepts dark and light", () => {
    expect(normalizeTheme("dark")).toBe("dark");
    expect(normalizeTheme("light")).toBe("light");
  });

  it("defaults invalid values to dark", () => {
    expect(normalizeTheme(null)).toBe("dark");
    expect(normalizeTheme("")).toBe("dark");
    expect(normalizeTheme("nope")).toBe("dark");
  });
});

describe("storage + toggle", () => {
  const store = new Map<string, string>();
  const setAttribute = vi.fn();
  const removeAttribute = vi.fn();

  beforeEach(() => {
    store.clear();
    setAttribute.mockClear();
    removeAttribute.mockClear();

    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      clear: () => {
        store.clear();
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
      key: () => null,
      length: 0,
    });

    vi.stubGlobal("document", {
      documentElement: {
        setAttribute,
        removeAttribute,
        getAttribute: (name: string) => {
          if (name !== "data-theme") return null;
          const calls = setAttribute.mock.calls.filter(
            (call) => call[0] === "data-theme",
          );
          return calls.length ? (calls[calls.length - 1][1] as string) : null;
        },
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reads dark when storage empty", () => {
    expect(readStoredTheme()).toBe("dark");
  });

  it("writes and reads light", () => {
    writeStoredTheme("light");
    expect(store.get(THEME_STORAGE_KEY)).toBe("light");
    expect(readStoredTheme()).toBe("light");
  });

  it("applyTheme sets data-theme and storage", () => {
    applyTheme("light");
    expect(setAttribute).toHaveBeenCalledWith("data-theme", "light");
    expect(readStoredTheme()).toBe("light");
  });

  it("toggleTheme flips dark <-> light", () => {
    applyTheme("dark");
    const next: Theme = toggleTheme();
    expect(next).toBe("light");
    expect(setAttribute).toHaveBeenCalledWith("data-theme", "light");
    expect(toggleTheme()).toBe("dark");
  });
});
