"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./page.module.css";

interface DiagnosticResponse {
  status: string;
  message: string;
  timestamp: string;
  serverDurationMs: number;
  environment: {
    mode: string;
    platform: string;
    nodeVersion: string;
    isVercel: boolean;
    region: string;
    hostUrl: string;
    gitCommit: string;
  };
  geo: {
    ip: string;
    city: string;
    country: string;
  };
  headers: {
    vercelId: string;
    userAgent: string;
    acceptLanguage: string;
  };
}

interface PingRecord {
  id: string;
  timestamp: string;
  latencyMs: number;
  serverDurationMs: number;
  status: number;
  region: string;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  tag: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"diagnostics" | "playground" | "checklist" | "guide">("diagnostics");
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticResponse | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [lastLatency, setLastLatency] = useState<number | null>(null);
  const [pingHistory, setPingHistory] = useState<PingRecord[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Playground state with deterministic initial state
  const [echoPayload, setEchoPayload] = useState(
    JSON.stringify(
      {
        test: "vercel-serverless-execution",
        clientTimestamp: "2026-10-20T00:00:00.000Z",
        message: "Hello from client browser!",
      },
      null,
      2
    )
  );
  const [playgroundLoading, setPlaygroundLoading] = useState(false);
  const [playgroundResult, setPlaygroundResult] = useState<Record<string, unknown> | null>(null);

  // Set real client timestamp after mount
  useEffect(() => {
    setEchoPayload(
      JSON.stringify(
        {
          test: "vercel-serverless-execution",
          clientTimestamp: new Date().toISOString(),
          message: "Hello from client browser!",
        },
        null,
        2
      )
    );
  }, []);

  // Pre-flight checklist state
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: "app-router",
      title: "App Router & React 19 Verified",
      description: "Project compiles cleanly with Turbopack and React 19 Server Components.",
      checked: true,
      tag: "Framework",
    },
    {
      id: "serverless-route",
      title: "Serverless Function Handler (/api/diagnostic)",
      description: "API route supports both GET health checks and POST execution payloads.",
      checked: true,
      tag: "API",
    },
    {
      id: "zero-external-css",
      title: "Vanilla CSS & Modern Design Tokens",
      description: "Pure CSS Modules with glassmorphism without heavy external CSS runtimes.",
      checked: true,
      tag: "Styling",
    },
    {
      id: "build-test",
      title: "Local Production Build Passing",
      description: "`next build` passes typechecking and produces optimized static & serverless routes.",
      checked: true,
      tag: "Build",
    },
    {
      id: "git-init",
      title: "Git Repository Ready",
      description: "Git repository initialized and ready to push to GitHub / GitLab / Bitbucket.",
      checked: true,
      tag: "VCS",
    },
    {
      id: "vercel-deploy",
      title: "Connect Repository in Vercel Dashboard",
      description: "Push repository and import directly at vercel.com/new for zero-config CI/CD.",
      checked: false,
      tag: "Deploy",
    },
  ]);

  // Ping handler
  const performPing = useCallback(async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      const res = await fetch("/api/diagnostic", { cache: "no-store" });
      const end = performance.now();
      const latency = Math.round(end - start);
      const data: DiagnosticResponse = await res.json();

      setDiagnosticData(data);
      setLastLatency(latency);
      setPingHistory((prev) => [
        {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toLocaleTimeString(),
          latencyMs: latency,
          serverDurationMs: data.serverDurationMs,
          status: res.status,
          region: data.environment.region,
        },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      console.error("Ping error:", err);
    } finally {
      setIsPinging(false);
    }
  }, []);

  // Auto-ping on initial mount
  useEffect(() => {
    performPing();
  }, [performPing]);

  // Burst ping (3 pings sequential)
  const performBurst = async () => {
    for (let i = 0; i < 3; i++) {
      await performPing();
      await new Promise((r) => setTimeout(r, 200));
    }
  };

  // Submit playground echo
  const handlePlaygroundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlaygroundLoading(true);
    try {
      const parsed = JSON.parse(echoPayload);
      const res = await fetch("/api/diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      setPlaygroundResult(data);
    } catch {
      setPlaygroundResult({ error: "Invalid JSON format in payload input" });
    } finally {
      setPlaygroundLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleChecklist = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const completedChecks = checklist.filter((item) => item.checked).length;
  const progressPercent = Math.round((completedChecks / checklist.length) * 100);

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.brandLogo}>
            {/* Vercel Iconic Triangle */}
            <svg width="24" height="24" viewBox="0 0 76 65" fill="none">
              <path d="M38 0L76 65H0L38 0Z" fill="white" />
            </svg>
          </div>
          <span>Vercel Pulse</span>
        </div>

        <div className={styles.headerBadges}>
          <div className={styles.liveBadge}>
            <span className={styles.liveDot}></span>
            <span>Edge Ready</span>
          </div>
          <div className={styles.badgeVercel}>
            <span>Next.js 16</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroTag}>
          <span>⚡ Turbopack App Router • Serverless Diagnostic</span>
        </div>
        <h1 className={styles.title}>
          Deployment & Edge Benchmark <span className={styles.gradientText}>for Vercel</span>
        </h1>
        <p className={styles.subtitle}>
          A high-performance demonstration web application designed to test zero-config Vercel
          deployment, serverless API execution, edge headers, and latency.
        </p>
        <div className={styles.heroButtons}>
          <button className={styles.btnPrimary} onClick={performPing} disabled={isPinging}>
            {isPinging ? "Pinging..." : "⚡ Ping Serverless API"}
          </button>
          <a
            href="https://vercel.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnSecondary}
          >
            <span>Read Vercel Docs ↗</span>
          </a>
        </div>
      </section>

      {/* Stats Quick Bar */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Hosting Status</div>
          <div className={styles.statValue}>
            <span style={{ color: diagnosticData?.environment.isVercel ? "var(--accent-green)" : "var(--accent-cyan)" }}>
              {diagnosticData?.environment.isVercel ? "Vercel Edge" : "Local Host"}
            </span>
          </div>
          <div className={styles.statDesc}>
            {diagnosticData?.environment.mode || "detecting"} mode
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Roundtrip Latency</div>
          <div className={styles.statValue}>
            <span style={{ color: "var(--accent-cyan)" }}>
              {lastLatency !== null ? `${lastLatency} ms` : "..."}
            </span>
          </div>
          <div className={styles.statDesc}>
            Server time: {diagnosticData?.serverDurationMs ?? 0} ms
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Edge Region</div>
          <div className={styles.statValue}>
            <span>{diagnosticData?.environment.region || "detecting..."}</span>
          </div>
          <div className={styles.statDesc}>
            {diagnosticData?.geo.country || "Local"} ({diagnosticData?.geo.city || "Local Machine"})
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Readiness Score</div>
          <div className={styles.statValue}>
            <span style={{ color: "var(--accent-green)" }}>{progressPercent}%</span>
          </div>
          <div className={styles.statDesc}>
            {completedChecks} of {checklist.length} pre-flight items checked
          </div>
        </div>
      </div>

      {/* Interactive Tabs Section */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabsNav}>
          <button
            className={`${styles.tabButton} ${activeTab === "diagnostics" ? styles.tabButtonActive : ""}`}
            onClick={() => setActiveTab("diagnostics")}
          >
            <span>📡 Live Diagnostics</span>
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "playground" ? styles.tabButtonActive : ""}`}
            onClick={() => setActiveTab("playground")}
          >
            <span>🧪 Serverless Playground</span>
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "checklist" ? styles.tabButtonActive : ""}`}
            onClick={() => setActiveTab("checklist")}
          >
            <span>✅ Pre-flight Checklist ({completedChecks}/{checklist.length})</span>
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "guide" ? styles.tabButtonActive : ""}`}
            onClick={() => setActiveTab("guide")}
          >
            <span>🚀 1-Click Deploy Guide</span>
          </button>
        </div>

        <div className={styles.tabContent}>
          {/* TAB 1: DIAGNOSTICS */}
          {activeTab === "diagnostics" && (
            <div className={styles.diagGrid}>
              <div className={styles.panel}>
                <div className={styles.panelTitle}>
                  <span>Latency & Ping Monitor</span>
                  <span style={{ fontSize: "0.8rem", color: "var(--accent-green)" }}>• Online</span>
                </div>
                <div className={styles.panelSub}>
                  Live roundtrip latency against the Next.js serverless route <code>/api/diagnostic</code>.
                </div>

                <div className={styles.pingControls}>
                  <button
                    className={styles.pingButton}
                    onClick={performPing}
                    disabled={isPinging}
                  >
                    {isPinging ? "Testing..." : "Send Single Ping"}
                  </button>
                  <button
                    className={styles.burstButton}
                    onClick={performBurst}
                    disabled={isPinging}
                  >
                    Burst Ping (3x)
                  </button>
                </div>

                <div className={styles.meterRow}>
                  <div className={styles.meterBox}>
                    <div className={styles.meterNum}>{lastLatency !== null ? lastLatency : "--"}</div>
                    <div className={styles.meterLabel}>Roundtrip (ms)</div>
                  </div>
                  <div className={styles.meterBox}>
                    <div className={styles.meterNum}>
                      {diagnosticData?.serverDurationMs ?? "--"}
                    </div>
                    <div className={styles.meterLabel}>Server Exec (ms)</div>
                  </div>
                  <div className={styles.meterBox}>
                    <div className={styles.meterNum}>{pingHistory.length}</div>
                    <div className={styles.meterLabel}>Pings Logged</div>
                  </div>
                </div>

                <div style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                  Recent Ping Logs
                </div>
                <div className={styles.historyList}>
                  {pingHistory.length === 0 ? (
                    <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", padding: "0.5rem 0" }}>
                      No ping logs yet. Click above to benchmark!
                    </div>
                  ) : (
                    pingHistory.map((item) => (
                      <div key={item.id} className={styles.historyItem}>
                        <span>{item.timestamp}</span>
                        <span>HTTP {item.status}</span>
                        <span>Region: {item.region}</span>
                        <span className={styles.historyLatency}>{item.latencyMs} ms</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className={styles.panel}>
                <div className={styles.panelTitle}>
                  <span>Vercel Edge & Environment Inspection</span>
                  <button
                    className={styles.copyBtn}
                    onClick={() =>
                      copyToClipboard(JSON.stringify(diagnosticData, null, 2), "diagJson")
                    }
                  >
                    {copiedId === "diagJson" ? "✓ Copied" : "Copy JSON"}
                  </button>
                </div>
                <div className={styles.panelSub}>
                  Detected runtime environment, serverless region identifiers, and headers.
                </div>

                <div className={styles.infoRows} style={{ marginBottom: "1rem" }}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoKey}>Platform Runtime</span>
                    <span className={styles.infoVal}>
                      {diagnosticData?.environment.platform || "Next.js on Node.js"}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoKey}>Node Engine</span>
                    <span className={styles.infoVal}>
                      {diagnosticData?.environment.nodeVersion || "Unknown"}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoKey}>Vercel ID Header</span>
                    <span className={styles.infoVal}>
                      {diagnosticData?.headers.vercelId || "local-development"}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoKey}>Client Geolocation</span>
                    <span className={styles.infoVal}>
                      {diagnosticData?.geo.city}, {diagnosticData?.geo.country}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                  Raw Diagnostic Response Payload
                </div>
                <pre className={styles.codeBlock}>
                  {diagnosticData
                    ? JSON.stringify(diagnosticData, null, 2)
                    : "// Waiting for diagnostic payload..."}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: SERVERLESS PLAYGROUND */}
          {activeTab === "playground" && (
            <div className={styles.playgroundLayout}>
              <div className={styles.panel}>
                <div className={styles.panelTitle}>
                  <span>Payload Echo Tester</span>
                </div>
                <div className={styles.panelSub}>
                  Send arbitrary JSON payloads to the <code>POST /api/diagnostic</code> serverless
                  function to verify request parsing and response handling.
                </div>

                <form onSubmit={handlePlaygroundSubmit}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>JSON Payload to Send:</label>
                    <textarea
                      rows={8}
                      className={styles.textareaInput}
                      value={echoPayload}
                      onChange={(e) => setEchoPayload(e.target.value)}
                    />
                  </div>

                  <div className={styles.presetButtons}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", alignSelf: "center" }}>
                      Presets:
                    </span>
                    <button
                      type="button"
                      className={styles.presetBtn}
                      onClick={() =>
                        setEchoPayload(
                          JSON.stringify(
                            {
                              action: "benchmark",
                              timestamp: Date.now(),
                              randomUUID: crypto.randomUUID(),
                            },
                            null,
                            2
                          )
                        )
                      }
                    >
                      UUID Benchmark
                    </button>
                    <button
                      type="button"
                      className={styles.presetBtn}
                      onClick={() =>
                        setEchoPayload(
                          JSON.stringify(
                            {
                              event: "deployment_check",
                              target: "Vercel Cloud",
                              status: "validating",
                            },
                            null,
                            2
                          )
                        )
                      }
                    >
                      Deployment Event
                    </button>
                  </div>

                  <button
                    type="submit"
                    className={styles.pingButton}
                    style={{ marginTop: "1.25rem" }}
                    disabled={playgroundLoading}
                  >
                    {playgroundLoading ? "Processing in Serverless..." : "Execute Serverless POST"}
                  </button>
                </form>
              </div>

              <div className={styles.panel}>
                <div className={styles.panelTitle}>
                  <span>Serverless Response</span>
                  {playgroundResult && (
                    <button
                      className={styles.copyBtn}
                      onClick={() =>
                        copyToClipboard(JSON.stringify(playgroundResult, null, 2), "resultCopy")
                      }
                    >
                      {copiedId === "resultCopy" ? "✓ Copied" : "Copy"}
                    </button>
                  )}
                </div>
                <div className={styles.panelSub}>
                  Output returned by the serverless handler including execution latency.
                </div>

                <pre className={styles.codeBlock} style={{ minHeight: "260px" }}>
                  {playgroundResult
                    ? JSON.stringify(playgroundResult, null, 2)
                    : "// Click 'Execute Serverless POST' to trigger handler..."}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: CHECKLIST */}
          {activeTab === "checklist" && (
            <div>
              <div className={styles.checklistHeader}>
                <div>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>
                    Vercel Pre-Flight Readiness Checklist
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    Verify these critical checkpoints before pushing to production.
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--accent-green)" }}>
                    {progressPercent}%
                  </span>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Ready to Deploy</div>
                </div>
              </div>

              <div className={styles.progressBarContainer}>
                <div
                  className={styles.progressBarFill}
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>

              <div className={styles.checkItems}>
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className={`${styles.checkItem} ${item.checked ? styles.checkItemActive : ""}`}
                    onClick={() => toggleChecklist(item.id)}
                  >
                    <div className={`${styles.checkbox} ${item.checked ? styles.checkboxChecked : ""}`}>
                      {item.checked && "✓"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className={styles.checkTitle}>
                        {item.title}{" "}
                        <span
                          style={{
                            fontSize: "0.7rem",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "4px",
                            background: "rgba(255,255,255,0.08)",
                            color: "var(--text-secondary)",
                            marginLeft: "0.5rem",
                          }}
                        >
                          {item.tag}
                        </span>
                      </div>
                      <div className={styles.checkDesc}>{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DEPLOYMENT GUIDE */}
          {activeTab === "guide" && (
            <div>
              <div className={styles.guideSection}>
                <div className={styles.guideTitle}>
                  <span>Option A: Instant Deployment via Vercel CLI</span>
                </div>
                <div className={styles.guideDesc}>
                  The fastest way to test your deployment right from your local terminal.
                </div>

                <div className={styles.stepBlock}>
                  <div className={styles.stepHeader}>
                    <span className={styles.stepNumber}>Step 1 • Run Vercel CLI</span>
                    <button
                      className={styles.copyBtn}
                      onClick={() => copyToClipboard("npx vercel", "step1")}
                    >
                      {copiedId === "step1" ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                  <div className={styles.cliCode}>npx vercel</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                    Follow the prompts to link to your Vercel account and deploy a preview URL in seconds.
                  </div>
                </div>

                <div className={styles.stepBlock}>
                  <div className={styles.stepHeader}>
                    <span className={styles.stepNumber}>Step 2 • Deploy to Production</span>
                    <button
                      className={styles.copyBtn}
                      onClick={() => copyToClipboard("npx vercel --prod", "step2")}
                    >
                      {copiedId === "step2" ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                  <div className={styles.cliCode}>npx vercel --prod</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                    Promote your build to production with global CDN caching and SSL.
                  </div>
                </div>
              </div>

              <div className={styles.guideSection}>
                <div className={styles.guideTitle}>
                  <span>Option B: Git-Connected Continuous Deployment</span>
                </div>
                <div className={styles.guideDesc}>
                  Push this repository to GitHub, GitLab, or Bitbucket for automatic preview URLs on every commit.
                </div>

                <div className={styles.stepBlock}>
                  <div className={styles.stepHeader}>
                    <span className={styles.stepNumber}>Git Push Commands</span>
                    <button
                      className={styles.copyBtn}
                      onClick={() =>
                        copyToClipboard(
                          "git add .\ngit commit -m 'Initial commit for Vercel deployment'\ngit remote add origin <YOUR_REPO_URL>\ngit branch -M main\ngit push -u origin main",
                          "gitCmds"
                        )
                      }
                    >
                      {copiedId === "gitCmds" ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                  <pre className={styles.cliCode}>
{`git add .
git commit -m "Initial commit for Vercel deployment"
git remote add origin <YOUR_REPO_URL>
git branch -M main
git push -u origin main`}
                  </pre>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                    Then visit <strong>https://vercel.com/new</strong> and click <strong>Import</strong> on your repository.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className={styles.featuresGrid}>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>⚡</div>
          <div className={styles.featureTitle}>Zero-Config Next.js</div>
          <div className={styles.featureDesc}>
            Vercel natively optimizes Next.js apps with edge routing, automatic static optimization, and image handling.
          </div>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>🌐</div>
          <div className={styles.featureTitle}>Serverless & Edge</div>
          <div className={styles.featureDesc}>
            API endpoints in <code>src/app/api/</code> scale instantly from zero to millions of requests without server configuration.
          </div>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>🔒</div>
          <div className={styles.featureTitle}>Auto SSL & Edge CDN</div>
          <div className={styles.featureDesc}>
            Every preview and production deployment receives instant HTTPS certificates and multi-region anycast CDN routing.
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <div>
          Vercel Pulse • Next.js App Router Verification Suite
        </div>
        <div className={styles.footerLinks}>
          <a href="https://nextjs.org/docs" target="_blank" rel="noopener noreferrer">
            Next.js Docs
          </a>
          <a href="https://vercel.com/docs" target="_blank" rel="noopener noreferrer">
            Vercel Platform
          </a>
          <a href="https://vercel-status.com" target="_blank" rel="noopener noreferrer">
            System Status
          </a>
        </div>
      </footer>
    </div>
  );
}
