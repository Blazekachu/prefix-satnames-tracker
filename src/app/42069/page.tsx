import { BrandHero } from "@/app/brand-hero";

const TRACK_PREFIX_REPO = "https://github.com/Blazekachu/track-prefix";
const TRACK_PREFIX_README = `${TRACK_PREFIX_REPO}#readme`;

export default function KnowPresentLocationPage() {
  return (
    <main className="page-shell guide-page">
      <a href="../" className="back-link">
        Back to tracker
      </a>
      <p className="eyebrow">Handoff to track-prefix</p>
      <BrandHero pageTitle="Know present location of sats" />
      <p className="lede">
        This site shows which sat name prefix series exist and which are
        already mined. To learn where those sats sit today, run{" "}
        <strong>track-prefix</strong> locally — a FIFO sat name prefix tracer
        that walks from coinbase to live UTXOs on your machine.
      </p>

      <section className="guide-section">
        <h2>1. What this is</h2>
        <p>
          track-prefix is a <strong>local-first</strong> tool (v0.1, MIT). You
          pick a mined sat name prefix series, and a worker traces those sats
          with ordinal FIFO accounting into a local SQLite database and
          dashboard. It is not a hosted service: credentials and databases stay
          on your computer.
        </p>
      </section>

      <section className="guide-section">
        <h2>2. Prerequisites</h2>
        <ul>
          <li>
            <strong>Node.js 20+</strong>
          </li>
          <li>
            Network access <strong>or</strong> a local mainnet bitcoind with{" "}
            <code>txindex=1</code> (Core 24+ recommended), and optionally{" "}
            <strong>ord</strong>
          </li>
          <li>
            Disk space for SQLite under <code>data/jobs/</code> (one folder per
            tracked prefix series)
          </li>
        </ul>
      </section>

      <section className="guide-section">
        <h2>3. Install and start</h2>
        <pre className="guide-code">{`git clone https://github.com/Blazekachu/track-prefix.git
cd track-prefix
npm install
npm start`}</pre>
        <p>
          Open the printed URL. Preferred dashboard address:{" "}
          <code>http://127.0.0.1:42069</code>. Complete the browser wizard, or
          open an existing job.
        </p>
        <p>
          Source:{" "}
          <a href={TRACK_PREFIX_REPO} target="_blank" rel="noreferrer">
            github.com/Blazekachu/track-prefix
          </a>
        </p>
      </section>

      <section className="guide-section">
        <h2>4. Pick a data mode</h2>
        <p>Nothing is hidden. Choose one mode in the wizard:</p>
        <div className="guide-table-wrap">
          <table className="guide-table">
            <thead>
              <tr>
                <th>Mode</th>
                <th>You provide</th>
                <th>UTXO trace</th>
                <th>Inscriptions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Public API</td>
                <td>Nothing</td>
                <td>Public Esplora</td>
                <td>First-sat scan via public ordinals endpoints</td>
              </tr>
              <tr>
                <td>Paid / subscribed API</td>
                <td>Esplora base URL (+ optional key)</td>
                <td>Your endpoint</td>
                <td>Same style as public</td>
              </tr>
              <tr>
                <td>BTC node (RPC)</td>
                <td>RPC URL + user + password</td>
                <td>Your bitcoind</td>
                <td>Not available (no inscription index)</td>
              </tr>
              <tr>
                <td>BTC + ORD nodes</td>
                <td>RPC + ord HTTP URL</td>
                <td>bitcoind + local ord</td>
                <td>First-sat or every sat</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ul>
          <li>
            Public / paid: <strong>one tracer at a time</strong> across all jobs
            (pause/stop before starting another).
          </li>
          <li>Node modes: not limited that way (still one lock per job).</li>
          <li>
            Pre-filled URLs like <code>http://127.0.0.1:8332</code> are local
            defaults — change them if your node listens elsewhere.
          </li>
        </ul>
      </section>

      <section className="guide-section">
        <h2>5. Wizard</h2>
        <ul>
          <li>
            Disclosure → choose mode → credentials → list mined series →
            expectations → start.
          </li>
          <li>
            For <strong>BTC node</strong> / <strong>BTC + ORD</strong>: fill
            credentials (stored only in local <code>config.json</code>,
            gitignored). Optional Fill from Bitcoin cookie is click-only. Test
            connection must succeed before Next unlocks.
          </li>
          <li>
            Enter the same prefix you looked up on this site, then pick the
            mined series you care about.
          </li>
        </ul>
      </section>

      <section className="guide-section">
        <h2>6. Dashboard and tracing</h2>
        <ul>
          <li>
            Use <strong>Start / Pause / Stop / Resume / Refresh</strong> on the
            job.
          </li>
          <li>
            Watch conservation gap, queue, and live UTXOs. Closing the dashboard
            does not stop a detached tracer — use Pause/Stop.
          </li>
          <li>
            <strong>Complete</strong> means conservation accounting reaches{" "}
            <strong>gap 0</strong> for the chosen sat range — not “every
            inscription on Earth.”
          </li>
        </ul>
      </section>

      <section className="guide-section">
        <h2>7. Optional next steps</h2>
        <p>
          After UTXO track is complete, you can scan live UTXOs for inscriptions
          (mode-dependent). Default is first sat per UTXO; every-sat scan needs
          BTC + ORD. Useful CLI commands:
        </p>
        <pre className="guide-code">{`npm test
npm run status
npm run trace:sats
npm run refresh
npm run scan:inscriptions
npm run snapshot`}</pre>
      </section>

      <section className="guide-section">
        <h2>8. Safety</h2>
        <ul>
          <li>
            track-prefix only <strong>reads</strong> bitcoind / ord. It writes
            only under its own <code>data/jobs/</code>.
          </li>
          <li>
            Never commit <code>config.json</code>, RPC passwords, API keys, or
            job databases.
          </li>
          <li>
            Prefer removing jobs from the dashboard UI over deleting folders by
            hand.
          </li>
        </ul>
      </section>

      <section className="guide-section">
        <h2>9. Links</h2>
        <ul>
          <li>
            <a href={TRACK_PREFIX_REPO} target="_blank" rel="noreferrer">
              track-prefix on GitHub
            </a>
          </li>
          <li>
            <a href={TRACK_PREFIX_README} target="_blank" rel="noreferrer">
              Full README (source of truth for edge cases)
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
}
