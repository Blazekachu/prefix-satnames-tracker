import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchTipHeight } from "./tip";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchTipHeight", () => {
  it("returns the parsed height on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("900123\n", { status: 200 })),
    );
    expect(await fetchTipHeight()).toBe(900123);
  });

  it("retries once then throws on persistent failure", async () => {
    const fetchMock = vi.fn(async () => new Response("err", { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(fetchTipHeight()).rejects.toThrow(/mempool\.space/);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("throws on a non-numeric response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("not-a-number", { status: 200 })),
    );
    await expect(fetchTipHeight()).rejects.toThrow(/mempool\.space/);
  });
});
