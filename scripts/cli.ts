import { validatePrefix } from "../src/core/prefix";
import { buildReport } from "../src/core/report";
import { renderText } from "../src/cli/render";
import { fetchTipHeight } from "../src/lib/tip";

interface CliArgs {
  prefix?: string;
  tip?: number;
  json: boolean;
  collapse: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { json: false, collapse: true };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") args.json = true;
    else if (a === "--no-collapse") args.collapse = false;
    else if (a === "--tip") args.tip = Number(argv[++i]);
    else if (!a.startsWith("--") && args.prefix === undefined) args.prefix = a;
  }
  return args;
}

/** JSON.stringify replacer that renders bigint as a string. */
function bigintReplacer(_key: string, value: unknown): unknown {
  return typeof value === "bigint" ? value.toString() : value;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.prefix === undefined) {
    console.error(
      "Usage: npm run prefix -- <prefix> [--tip N] [--json] [--no-collapse]",
    );
    process.exit(1);
  }

  const validated = validatePrefix(args.prefix);
  if (!validated.ok) {
    console.error(`Error: ${validated.error}`);
    process.exit(1);
  }

  let tip: number;
  if (args.tip !== undefined) {
    tip = args.tip;
  } else {
    try {
      tip = await fetchTipHeight();
    } catch (err) {
      console.error(`Error: ${String(err)}`);
      console.error("Pass --tip <height> to run offline.");
      process.exit(1);
    }
  }

  const report = buildReport(validated.prefix, tip, { collapse: args.collapse });

  if (args.json) {
    console.log(JSON.stringify(report, bigintReplacer, 2));
  } else {
    console.log(renderText(report));
  }
}

main();
