import { useState, useEffect } from "react"
import axios from "axios"
import { GitBranch, AlertTriangle, Search, BarChart2, RefreshCw } from "lucide-react"

const API = "http://localhost:5050/api"

export default function App() {
  const [stats, setStats] = useState({ total: 0, authors: [] })
  const [patterns, setPatterns] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [repoPath, setRepoPath] = useState("")
  const [scanning, setScanning] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")

  useEffect(() => {
    fetchStats()
    fetchPatterns()
  }, [])

  const fetchStats = async () => {
    const res = await axios.get(`${API}/stats`)
    setStats(res.data)
  }

  const fetchPatterns = async () => {
    const res = await axios.get(`${API}/patterns`)
    setPatterns(res.data)
  }

  const handleScan = async () => {
    if (!repoPath) return
    setScanning(true)
    await axios.post(`${API}/scan`, { repo_path: repoPath })
    await fetchStats()
    await fetchPatterns()
    setScanning(false)
  }

  const handleSearch = async () => {
    if (!searchQuery) return fetchPatterns()
    const res = await axios.get(`${API}/search?q=${searchQuery}`)
    setPatterns(res.data)
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e2e8f0", fontFamily: "monospace" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #1e293b", padding: "16px 32px", display: "flex", alignItems: "center", gap: 12 }}>
        <GitBranch size={24} color="#6ee7b7" />
        <span style={{ fontSize: 20, fontWeight: "bold", color: "#6ee7b7" }}>ECHO</span>
        <span style={{ color: "#475569", fontSize: 13 }}>— AI Regression Memory</span>
      </div>

      <div style={{ padding: "32px", maxWidth: 1100, margin: "0 auto" }}>
        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Bug Patterns Stored", value: stats.total, color: "#6ee7b7" },
            { label: "Authors Tracked", value: stats.authors.length, color: "#818cf8" },
            { label: "Active Warnings", value: patterns.filter(p => p.message.includes("fix")).length, color: "#f87171" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 32, fontWeight: "bold", color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Scan Input */}
        <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 12 }}>Scan a Git Repository</div>
          <div style={{ display: "flex", gap: 12 }}>
            <input
              value={repoPath}
              onChange={e => setRepoPath(e.target.value)}
              placeholder="Paste full repo path e.g. /Users/you/myproject"
              style={{ flex: 1, background: "#0a0a0f", border: "1px solid #1e293b", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 13 }}
            />
            <button
              onClick={handleScan}
              disabled={scanning}
              style={{ background: "#6ee7b7", color: "#0a0a0f", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
            >
              <RefreshCw size={16} /> {scanning ? "Scanning..." : "Scan"}
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search patterns..."
            style={{ flex: 1, background: "#111827", border: "1px solid #1e293b", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 13 }}
          />
          <button
            onClick={handleSearch}
            style={{ background: "#818cf8", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
          >
            <Search size={16} /> Search
          </button>
        </div>

        {/* Patterns List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {patterns.length === 0 && (
            <div style={{ textAlign: "center", color: "#475569", padding: 48 }}>No patterns yet. Scan a repo to get started.</div>
          )}
          {patterns.map((p, i) => (
            <div key={i} style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <AlertTriangle size={16} color="#f87171" />
                <span style={{ color: "#f87171", fontSize: 12, fontWeight: "bold" }}>#{p.hash}</span>
                <span style={{ color: "#94a3b8", fontSize: 12 }}>{p.author}</span>
                <span style={{ color: "#475569", fontSize: 11, marginLeft: "auto" }}>{new Date(p.date).toLocaleDateString()}</span>
              </div>
              <div style={{ color: "#e2e8f0", fontSize: 14, marginBottom: 8 }}>{p.message}</div>
              {p.diff_preview && (
                <pre style={{ background: "#0a0a0f", borderRadius: 6, padding: 12, fontSize: 11, color: "#64748b", overflow: "auto", maxHeight: 120 }}>{p.diff_preview}</pre>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}