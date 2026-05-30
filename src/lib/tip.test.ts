import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchTipHeight, ESPLORA_PROVIDERS } from "./tip";

afterEach(() => {
  vi.unstubAllGlobals();
});

const P1 = "https://a.example/api";
const P2 = "https://b.example/api";
const P3 = "https://c.example/api";

describe("fetchTipHeight", () => {
  it("returns the height from the first provider on success", async () => {
    const fetchMock = vi.fn(
      async (_url: string) => new Response("900123\n", { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    expect(await fetchTipHeight([P1, P2])).toBe(900123);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(`${P1}/blocks/tip/height`);
  });

  it("falls through to the next provider when one returns an error status", async () => {
    const fetchMock = vi.fn(async (url: string) =>
      url.startsWith(P1)
        ? new Response("err", { status: 500 })
        : new Response("777\n", { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    expect(await fetchTipHeight([P1, P2])).toBe(777);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("falls through when a provider throws (timeout / network)", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.startsWith(P1)) {
        throw new DOMException("timed out", "TimeoutError");
      }
      return new Response("555\n", { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);

    expect(await fetchTipHeight([P1, P2])).toBe(555);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("falls through on a non-numeric response", async () => {
    const fetchMock = vi.fn(async (url: string) =>
      url.startsWith(P1)
        ? new Response("not-a-number", { status: 200 })
        : new Response("123\n", { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    expect(await fetchTipHeight([P1, P2])).toBe(123);
  });

  it("tries every provider and throws when all fail", async () => {
    const fetchMock = vi.fn(async () => new Response("err", { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchTipHeight([P1, P2, P3])).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("passes an abort signal (timeout) to each fetch", async () => {
    const fetchMock = vi.fn(
      async (_url: string, _init?: RequestInit) =>
        new Response("900\n", { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await fetchTipHeight([P1]);
    const opts = fetchMock.mock.calls[0][1] as RequestInit | undefined;
    expect(opts?.signal).toBeInstanceOf(AbortSignal);
  });

  it("uses the default provider list when none is passed", async () => {
    const fetchMock = vi.fn(
      async (_url: string) => new Response("900\n", { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    expect(await fetchTipHeight()).toBe(900);
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/blocks\/tip\/height$/);
  });

  it("defaults to mempool.space, blockstream.info, and memepool.space as Esplora providers", () => {
    expect(ESPLORA_PROVIDERS.some((u) => u.includes("mempool.space"))).toBe(
      true,
    );
    expect(ESPLORA_PROVIDERS.some((u) => u.includes("blockstream.info"))).toBe(
      true,
    );
    expect(ESPLORA_PROVIDERS.some((u) => u.includes("memepool.space"))).toBe(
      true,
    );
  });
});
