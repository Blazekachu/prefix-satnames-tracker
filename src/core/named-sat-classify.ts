export type ClassifyResult =
  | { kind: "single" }
  | { kind: "pair"; parts: [string, string] }
  | { kind: "none" };

export function buildWordSet(words: Iterable<string>): Set<string> {
  const set = new Set<string>();
  for (const raw of words) {
    const w = raw.trim().toLowerCase();
    if (/^[a-z]+$/.test(w)) set.add(w);
  }
  return set;
}

export function classifySatname(
  satname: string,
  words: Set<string>,
): ClassifyResult {
  const name = satname.trim().toLowerCase();
  if (!/^[a-z]+$/.test(name)) return { kind: "none" };
  if (words.has(name)) return { kind: "single" };
  for (let i = 1; i < name.length; i++) {
    const left = name.slice(0, i);
    const right = name.slice(i);
    if (words.has(left) && words.has(right)) {
      return { kind: "pair", parts: [left, right] };
    }
  }
  return { kind: "none" };
}
