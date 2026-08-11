import { useState, useEffect, useRef } from "react"
 
function CareerLadder() {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: -1, y: -1 })
 
  useEffect(() => {
    const canvas = canvasRef.current
    const dpr = window.devicePixelRatio || 1
    canvas.width = 360 * dpr
    canvas.height = 360 * dpr
    canvas.style.width = "360px"
    canvas.style.height = "360px"
    const ctx = canvas.getContext("2d")
    ctx.scale(dpr, dpr)
 
    let animId, progress = 0
 
    const steps = [
      { label: "Student",    x: 30,  y: 330 },
      { label: "Intern",     x: 90,  y: 270 },
      { label: "Junior Dev", x: 150, y: 210 },
      { label: "Mid Level",  x: 210, y: 150 },
      { label: "Senior Dev", x: 270, y: 90  },
     
    ]
 
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    canvas.addEventListener("mousemove", handleMouseMove)
 
    function getPathPoint(t) {
      const total = steps.length - 1
      const seg   = Math.min(Math.floor(t * total), total - 1)
      const frac  = (t * total) % 1
      const from  = steps[seg]
      const to    = steps[seg + 1]
      if (frac < 0.5) {
        return { x: from.x + (to.x - from.x) * (frac * 2), y: from.y }
      } else {
        return { x: to.x, y: from.y + (to.y - from.y) * ((frac - 0.5) * 2) }
      }
    }
 
    function draw() {
      ctx.clearRect(0, 0, 360, 360)
      const mouse = mouseRef.current
 
      ctx.beginPath()
      ctx.moveTo(steps[0].x, steps[0].y)
      for (let i = 1; i < steps.length; i++) {
        ctx.lineTo(steps[i].x, steps[i - 1].y)
        ctx.lineTo(steps[i].x, steps[i].y)
      }
      ctx.strokeStyle = "rgba(196,148,106,0.18)"
      ctx.lineWidth = 1.5
      ctx.stroke()
 
      const trailStart = Math.max(0, progress - 0.25)
      ctx.beginPath()
      const startPt = getPathPoint(trailStart)
      ctx.moveTo(startPt.x, startPt.y)
      for (let i = 1; i <= 60; i++) {
        const t  = trailStart + (progress - trailStart) * (i / 60)
        const pt = getPathPoint(Math.min(t, 1))
        ctx.lineTo(pt.x, pt.y)
      }
      ctx.strokeStyle = "rgba(196,148,106,0.75)"
      ctx.lineWidth = 2
      ctx.stroke()
 
      steps.forEach((step, i) => {
        const dist    = Math.sqrt((mouse.x - step.x) ** 2 + (mouse.y - step.y) ** 2)
        const hovered = dist < 28
 
        const grd = ctx.createRadialGradient(step.x, step.y, 0, step.x, step.y, hovered ? 22 : 14)
        grd.addColorStop(0, `rgba(196,148,106,${hovered ? 0.65 : 0.28})`)
        grd.addColorStop(1, "rgba(196,148,106,0)")
        ctx.beginPath()
        ctx.arc(step.x, step.y, hovered ? 22 : 14, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()
 
        ctx.beginPath()
        ctx.arc(step.x, step.y, hovered ? 5.5 : 3.5, 0, Math.PI * 2)
        ctx.fillStyle = hovered ? "#F5EDD6" : "#C4946A"
        ctx.fill()
 
        ctx.font = `${hovered ? "700 12px" : "500 11px"} DM Sans`
        ctx.fillStyle = hovered ? "rgba(245,237,214,0.95)" : "rgba(245,237,214,0.6)"
        ctx.textAlign = "left"
        ctx.fillText(step.label, step.x + 12, step.y + 18)
      })
 
      if (progress < 1) {
        const dot     = getPathPoint(progress)
        const dotGlow = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, 22)
        dotGlow.addColorStop(0, "rgba(245,237,214,0.5)")
        dotGlow.addColorStop(1, "rgba(196,148,106,0)")
        ctx.beginPath()
        ctx.arc(dot.x, dot.y, 22, 0, Math.PI * 2)
        ctx.fillStyle = dotGlow
        ctx.fill()
 
        ctx.beginPath()
        ctx.arc(dot.x, dot.y, 6, 0, Math.PI * 2)
        ctx.fillStyle = "#F5EDD6"
        ctx.shadowColor = "#C4946A"
        ctx.shadowBlur  = 16
        ctx.fill()
        ctx.shadowBlur = 0
      }
 
      progress += 0.003
      if (progress > 1.1) progress = 0
      animId = requestAnimationFrame(draw)
    }
 
    draw()
    return () => {
      cancelAnimationFrame(animId)
      canvas.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])
 
  return <canvas ref={canvasRef} style={{ width: "360px", height: "360px" }} />
}
 
function ResultCards({ text }) {
  const sections = [
    { key: "CAREER PATH",   number: "01", icon: "→" },
    { key: "SKILL GAPS",    number: "02", icon: "△" },
    { key: "ACTION PLAN",   number: "03", icon: "◎" },
    { key: "OPPORTUNITIES", number: "04", icon: "✦" },
  ]
 
  const parsed = sections.map((section, i) => {
    const upper       = text.toUpperCase()
    const nextSection = sections[i + 1]
    const start       = upper.indexOf(section.key)
    if (start === -1) return { ...section, content: "" }
    const end     = nextSection ? upper.indexOf(nextSection.key) : text.length
    const content = text.slice(start + section.key.length, end).trim()
    return { ...section, content }
  }).filter(s => s.content)
 
  if (parsed.length === 0) {
    return <p className="text-cream text-sm leading-8 whitespace-pre-wrap">{text}</p>
  }
 
  return (
    <div className="flex flex-col gap-0">
      {parsed.map((section) => (
        <div
          key={section.key}
          className="flex gap-8 py-8 border-b border-edge last:border-b-0"
          style={{ borderLeft: "2px solid #C4946A", paddingLeft: "28px" }}
        >
          <div className="flex flex-col items-center gap-2 min-w-[40px]">
            <span className="text-copper text-2xl">{section.icon}</span>
            <span className="text-muted text-xs tracking-widest"
              style={{ writingMode: "vertical-rl" }}>
              {section.number}
            </span>
          </div>
          <div>
            <h4 className="font-display text-xl text-cream mb-3">{section.key}</h4>
            <p className="text-muted text-sm leading-7">{section.content}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
 
const features = [
  { number: "01", title: "Career Path Mapping", desc: "Tell us where you are and where you want to go. Ascend AI draws the most direct route based on your actual profile — not generic advice." },
  { number: "02", title: "Skill Gap Detection", desc: "Know exactly what is missing between you and your goal. No guessing, no vague suggestions — specific skills you need to acquire." },
  { number: "03", title: "Action Plan", desc: "Three concrete next steps you can start today. Not someday goals — immediate, actionable moves tailored to your current situation." },
  { number: "04", title: "Opportunity Targeting", desc: "Discover exactly what roles, internships, or projects to pursue right now based on where you stand in your career journey." },
]
 
function App() {
  const [formData, setFormData] = useState({ education: "", experience: "", skills: "", goal: "" })
  const [result, setResult]   = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")
 
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }
 
  const handleSubmit = async () => {
    if (!formData.education || !formData.skills || !formData.goal) {
      setError("Please fill all fields before analysing.")
      return
    }
    setError("")
    setLoading(true)
    setResult("")
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/analyse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      setResult(data.result)
    } catch {
      setError("Could not connect to server. Make sure backend is running.")
    } finally {
      setLoading(false)
    }
  }
 
  return (
    <div className="min-h-screen bg-canvas font-sans text-cream">
 
      <header className="flex items-center justify-between px-10 py-6 border-b border-edge">
        <h1 className="font-display text-xl font-bold tracking-wide text-cream">
          Ascend<span className="text-copper"> AI</span>
        </h1>
        <nav className="flex items-center gap-8 text-sm text-muted">
          <a href="#features" className="hover:text-cream transition-colors duration-200">Features</a>
          <a href="#about" className="hover:text-cream transition-colors duration-200">About</a>
          <a href="#analyse" className="border border-edge text-cream text-sm px-5 py-2 hover:bg-edge transition-colors duration-200">Get Started</a>
        </nav>
      </header>
 
      <main className="max-w-5xl mx-auto px-10 pt-20 pb-20">
        <div className="grid grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-copper text-xs font-medium tracking-[0.25em] uppercase mb-8">AI-Powered Career Intelligence</p>
            <h2 className="font-display text-7xl font-black text-cream leading-[1.05] mb-6">
              Your Career,<br /><span className="text-copper">Elevated.</span>
            </h2>
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px w-16 bg-copper opacity-60"></div>
              <p className="font-refined italic text-xl text-muted">Because where you're headed matters more than where you've been.</p>
            </div>
            <p className="text-muted text-base leading-relaxed mb-12">
              Enter your skills, education, and goals. Ascend AI maps your ideal career path, identifies exactly what's missing, and connects you to real opportunities — fast.
            </p>
            <div className="flex items-center gap-6">
              <a href="#analyse" className="bg-copper text-canvas font-medium text-sm px-8 py-4 hover:opacity-90 transition-opacity duration-200 tracking-wide">Analyse My Career →</a>
              <a href="#features" className="text-muted text-sm hover:text-cream transition-colors duration-200 underline underline-offset-4">See how it works</a>
            </div>
          </div>
          <div className="flex items-center justify-center overflow-hidden">
            <CareerLadder />
          </div>
        </div>
      </main>
 
      <section id="features" className="max-w-5xl mx-auto px-10 pb-28">
        <div className="border-t border-edge pt-16 mb-14">
          <p className="text-copper text-xs tracking-[0.25em] uppercase mb-3">What We Do</p>
          <h3 className="font-display text-4xl text-cream max-w-lg leading-tight">Four things Ascend AI does better than guessing.</h3>
        </div>
        <div className="grid grid-cols-2 gap-8">
          {features.map((f) => (
            <div key={f.number} className="border border-edge p-8 hover:border-copper transition-colors duration-300">
              <p className="text-copper text-xs tracking-[0.2em] mb-4">{f.number}</p>
              <h4 className="font-display text-xl text-cream mb-3">{f.title}</h4>
              <p className="text-muted text-sm leading-7">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
 
      <section id="about" className="max-w-5xl mx-auto px-10 pb-28">
        <div className="border border-edge p-14">
          <div className="grid grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-copper text-xs tracking-[0.25em] uppercase mb-4">About Ascend AI</p>
              <h3 className="font-display text-4xl text-cream leading-tight mb-6">Built for students who refuse to figure it out alone.</h3>
              <div className="h-px w-16 bg-copper opacity-40 mb-6"></div>
              <p className="font-refined italic text-muted text-lg mb-6">Most career advice is generic. Ascend AI is not.</p>
              <p className="text-muted text-sm leading-7">We built Ascend AI because the gap between where students are and where they want to be is not a talent problem — it is an information problem. You do not need more motivation. You need a clear, honest map of exactly what to do next. That is what Ascend AI gives you.</p>
            </div>
            <div className="flex flex-col gap-6">
              {[
                { number: "100%", label: "AI-Powered Analysis" },
                { number: "4",    label: "Sections of Actionable Guidance" },
                { number: "0",    label: "Generic Advice" },
              ].map((stat) => (
                <div key={stat.label} className="border-b border-edge pb-6">
                  <p className="font-display text-5xl text-copper mb-1">{stat.number}</p>
                  <p className="text-muted text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
 
      <section id="analyse" className="max-w-5xl mx-auto px-10 pb-28">
        <div className="border border-edge p-10">
          <p className="text-copper text-xs tracking-[0.25em] uppercase mb-2">Step 01</p>
          <h3 className="font-display text-3xl text-cream mb-1">Tell Us About Yourself</h3>
          <p className="font-refined italic text-muted mb-10">The more honest you are, the sharper your results.</p>
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-copper text-xs tracking-[0.2em] uppercase">Education Level</label>
              <select name="education" onChange={handleChange} value={formData.education}
                className="bg-transparent border border-edge text-cream px-4 py-3 text-sm focus:outline-none focus:border-copper transition-colors duration-200">
                <option value="" className="bg-canvas">Select your level</option>
                <option value="intermediate" className="bg-canvas">Intermediate</option>
                <option value="bs" className="bg-canvas">BS / Bachelor's</option>
                <option value="ms" className="bg-canvas">MS / Master's</option>
                <option value="phd" className="bg-canvas">PhD</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-copper text-xs tracking-[0.2em] uppercase">Years of Experience</label>
              <select name="experience" onChange={handleChange} value={formData.experience}
                className="bg-transparent border border-edge text-cream px-4 py-3 text-sm focus:outline-none focus:border-copper transition-colors duration-200">
                <option value="" className="bg-canvas">Select experience</option>
                <option value="0" className="bg-canvas">No experience (Student)</option>
                <option value="1" className="bg-canvas">Less than 1 year</option>
                <option value="2" className="bg-canvas">1–3 years</option>
                <option value="3" className="bg-canvas">3+ years</option>
              </select>
            </div>
            <div className="flex flex-col gap-2 col-span-2">
              <label className="text-copper text-xs tracking-[0.2em] uppercase">Your Skills</label>
              <textarea name="skills" onChange={handleChange} value={formData.skills}
                rows={3} placeholder="e.g. React, Python, MongoDB, Figma..."
                className="bg-transparent border border-edge text-cream px-4 py-3 text-sm placeholder:text-muted focus:outline-none focus:border-copper transition-colors duration-200 resize-none" />
            </div>
            <div className="flex flex-col gap-2 col-span-2">
              <label className="text-copper text-xs tracking-[0.2em] uppercase">Career Goal</label>
              <textarea name="goal" onChange={handleChange} value={formData.goal}
                rows={3} placeholder="e.g. I want to become a full-stack developer and work remotely..."
                className="bg-transparent border border-edge text-cream px-4 py-3 text-sm placeholder:text-muted focus:outline-none focus:border-copper transition-colors duration-200 resize-none" />
            </div>
          </div>
          {error && <p className="text-red-400 text-sm mt-6">{error}</p>}
          <div className="flex items-center gap-6 mt-10">
            <button onClick={handleSubmit} disabled={loading}
              className="bg-copper text-canvas font-medium text-sm px-8 py-4 hover:opacity-90 transition-opacity duration-200 tracking-wide disabled:opacity-50">
              {loading ? "Analysing..." : "Analyse My Career →"}
            </button>
            <p className="text-muted text-xs">No account needed. Results in seconds.</p>
          </div>
        </div>
        {result && (
          <div className="border border-edge p-10 mt-8">
            <p className="text-copper text-xs tracking-[0.25em] uppercase mb-2">Your Analysis</p>
            <h3 className="font-display text-3xl text-cream mb-8">Here Is Your Path.</h3>
            <ResultCards text={result} />
          </div>
        )}
      </section>
 
      <footer className="border-t border-edge px-10 py-8">
        <div className="max-w-5xl mx-auto flex justify-center">
          <p className="text-muted text-xs">© 2026 Ascend AI. Built for students who refuse to settle.</p>
        </div>
      </footer>
 
    </div>
  )
}
 
export default App