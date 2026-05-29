import { useState, useEffect } from "react"
import axios from "axios"
import { GitBranch, AlertTriangle, Search, RefreshCw, Brain, Shield, Clock } from "lucide-react"

const API = "http://localhost:5050/api"

export default function App() {
  const [stats, setStats] = useState({ total: 0, authors: [] })
  const [patterns, setPatterns] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [repoPath, setRepoPath] = useState("")
  const [scanning, setScanning] = useState(false)
  const [codeSnippet, setCodeSnippet] = useState("")
  const [aiResult, setAiResult] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")

  useEffect(() => { fetchStats(); fetchPatterns() }, [])

  const fetchStats = async () => { const res = await axios.get(`${API}/stats`); setStats(res.data) }
  const fetchPatterns = async () => { const res = await axios.get(`${API}/patterns`); setPatterns(res.data) }

  const handleScan = async () => {
    if (!repoPath) return
    setScanning(true)
    await axios.post(`${API}/scan`, { repo_path: repoPath })
    await fetchStats(); await fetchPatterns()
    setScanning(false)
  }

  const handleSearch = async () => {
    if (!searchQuery) return fetchPatterns()
    const res = await axios.get(`${API}/search?q=${searchQuery}`)
    setPatterns(res.data)
  }

  const handleAiWarn = async () => {
    if (!codeSnippet) return
    setAnalyzing(true)
    const res = await axios.post(`${API}/warn`, { code: codeSnippet })
    setAiResult(res.data)
    setAnalyzing(false)
  }

  const riskColor = { high: "#f87171", medium: "#fbbf24", low: "#6ee7b7" }

  return (
    <div style={{ minHeight: "100vh", background: "#080b12", color: "#e2e8f0", fontFamily: "monospace" }}>
      <div style={{ borderBottom: "1px solid #1e293b", padding: "16px 32px", display: "flex", alignItems: "center", gap: 12, background: "#0d1117" }}>
        <GitBranch size={22} color="#6ee7b7" />
        <span style={{ fontSize: 20, fontWeight: "bold", color: "#6ee7b7", letterSpacing: 2 }}>ECHO</span>
        <span style={{ color: "#475569", fontSize: 13 }}>— AI Regression Memory System</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {["dashboard", "ai-warn", "patterns"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              background: activeTab === tab ? "#6ee7b7" : "transparent",
              color: activeTab === tab ? "#080b12" : "#64748b",
              border: "1px solid " + (activeTab === tab ? "#6ee7b7" : "#1e293b"),
              borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontFamily: "monospace"
            }}>
              {tab === "dashboard" ? "Dashboard" : tab === "ai-warn" ? "AI Warn" : "Patterns"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "32px", maxWidth: 1100, margin: "0 auto" }}>
        {activeTab === "dashboard" && <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
            {[
              { label: "Bug Patterns Stored", value: stats.total, color: "#6ee7b7", icon: <Shield size={18} /> },
              { label: "Authors Tracked", value: stats.authors.length, color: "#818cf8", icon: <GitBranch size={18} /> },
              { label: "Active Warnings", value: patterns.filter(p => p.message.includes("fix")).length, color: "#f87171", icon: <AlertTriangle size={18} /> },
            ].map((s, i) => (
              <div key={i} style={{ background: "#0d1117", border: "1px solid #1e293b", borderRadius: 12, padding: 24 }}>
                <div style={{ color: s.color, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 36, fontWeight: "bold", color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "#0d1117", border: "1px solid #1e293b", borderRadius: 12, padding: 24, marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: "#6ee7b7", marginBottom: 12 }}>Scan a Git Repository</div>
            <div style={{ display: "flex", gap: 12 }}>
              <input value={repoPath} onChange={e => setRepoPath(e.target.value)} placeholder="/Users/you/yourproject"
                style={{ flex: 1, background: "#080b12", border: "1px solid #1e293b", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 13, fontFamily: "monospace" }} />
              <button onClick={handleScan} disabled={scanning} style={{ background: "#6ee7b7", color: "#080b12", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: "bold", cursor: "pointer", fontFamily: "monospace" }}>
                {scanning ? "Scanning..." : "Scan"}
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search patterns by keyword..."
              style={{ flex: 1, background: "#0d1117", border: "1px solid #1e293b", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 13, fontFamily: "monospace" }} />
            <button onClick={handleSearch} style={{ background: "#818cf8", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: "bold", cursor: "pointer", fontFamily: "monospace" }}>
              Search
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {patterns.length === 0 && <div style={{ textAlign: "center", color: "#475569", padding: 48 }}>No patterns yet. Scan a repo to get started.</div>}
            {patterns.map((p, i) => (
              <div key={i} style={{ background: "#0d1117", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <AlertTriangle size={14} color="#f87171" />
                  <span style={{ color: "#f87171", fontSize: 12, fontWeight: "bold" }}>#{p.hash}</span>
                  <span style={{ color: "#818cf8", fontSize: 12 }}>{p.author}</span>
                  <span style={{ color: "#475569", fontSize: 11, marginLeft: "auto" }}>{new Date(p.date).toLocaleDateString()}</span>
                </div>
                <div style={{ color: "#e2e8f0", fontSize: 14, marginBottom: 8 }}>{p.message}</div>
                {p.files_changed?.length > 0 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                    {p.files_changed.slice(0, 4).map((f, j) => (
                      <span key={j} style={{ background: "#1e293b", borderRadius: 4, padding: "2px 8px", fontSize: 11, color: "#94a3b8" }}>{f}</span>
                    ))}
                  </div>
                )}
                {p.diff_preview && <pre style={{ background: "#080b12", borderRadius: 6, padding: 12, fontSize: 11, color: "#64748b", overflow: "auto", maxHeight: 100 }}>{p.diff_preview}</pre>}
              </div>
            ))}
          </div>
        </>}

        {activeTab === "ai-warn" && <>
          <div style={{ background: "#0d1117", border: "1px solid #1e293b", borderRadius: 12, padding: 24, marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: "#818cf8", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <Brain size={14} /> AI Code Analysis — Paste your code to check for regression risk
            </div>
            <textarea value={codeSnippet} onChange={e => setCodeSnippet(e.target.value)}
              placeholder="Paste your code snippet here..." rows={10}
              style={{ width: "100%", background: "#080b12", border: "1px solid #1e293b", borderRadius: 8, padding: "12px 14px", color: "#e2e8f0", fontSize: 13, fontFamily: "monospace", resize: "vertical", boxSizing: "border-box" }} />
            <button onClick={handleAiWarn} disabled={analyzing} style={{ marginTop: 12, background: "#818cf8", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: "bold", cursor: "pointer", fontFamily: "monospace" }}>
              {analyzing ? "Analyzing..." : "Analyze with AI"}
            </button>
          </div>
          {aiResult && (
            <div style={{ background: "#0d1117", border: `1px solid ${riskColor[aiResult.risk_level] || "#1e293b"}`, borderRadius: 12, padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <Brain size={18} color={riskColor[aiResult.risk_level]} />
                <span style={{ fontSize: 16, fontWeight: "bold", color: riskColor[aiResult.risk_level] }}>Risk Level: {aiResult.risk_level?.toUpperCase()}</span>
              </div>
              {aiResult.warning && <div style={{ background: "#080b12", borderRadius: 8, padding: 14, marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Warning</div>
                <div style={{ color: "#fbbf24", fontSize: 14 }}>{aiResult.warning}</div>
              </div>}
              {aiResult.suggestion && <div style={{ background: "#080b12", borderRadius: 8, padding: 14, marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Suggestion</div>
                <div style={{ color: "#6ee7b7", fontSize: 14 }}>{aiResult.suggestion}</div>
              </div>}
              {aiResult.similar_pattern && <div style={{ background: "#080b12", borderRadius: 8, padding: 14 }}>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Similar Past Bug</div>
                <div style={{ color: "#818cf8", fontSize: 14 }}>#{aiResult.similar_pattern}</div>
              </div>}
            </div>
          )}
        </>}

        {activeTab === "patterns" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ color: "#64748b", fontSize: 13, marginBottom: 8 }}>All stored patterns ({patterns.length})</div>
            {patterns.map((p, i) => (
              <div key={i} style={{ background: "#0d1117", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
                <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                  <span style={{ color: "#f87171", fontSize: 12 }}>#{p.hash}</span>
                  <span style={{ color: "#818cf8", fontSize: 12 }}>{p.author}</span>
                  <span style={{ color: "#475569", fontSize: 11, marginLeft: "auto" }}>{new Date(p.date).toLocaleDateString()}</span>
                </div>
                <div style={{ color: "#e2e8f0", fontSize: 14 }}>{p.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}