import { useRef, useState, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { useGLTF, Stage, OrbitControls } from "@react-three/drei"
import * as THREE from "three"

// ─── Fonts ──────────────────────────────────────────────────────────────────
function useFonts() {
  useEffect(() => {
    const link = document.createElement("link")
    link.href =
      "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&display=swap"
    link.rel = "stylesheet"
    document.head.appendChild(link)
    return () => {document.head.removeChild(link)}
  }, [])
}

// ─── Trophy — entry spin, then orbit ────────────────────────────────────────
function Trophy() {
  const { scene } = useGLTF("/World_Cup_Trophy_R01.glb")
  const ref = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.rotation.y += delta * 0.5
  })

  return <primitive ref={ref} object={scene} scale={1.5} />
}
useGLTF.preload("/World_Cup_Trophy_R01.glb")

// ─── Countdown ───────────────────────────────────────────────────────────────
const WC_DATE = new Date("2026-06-11T00:00:00")
function getTimeLeft() {
  const diff = WC_DATE.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

// ─── Photos ──────────────────────────────────────────────────────────────────
const LEFT_PHOTOS  = ["/wc5.jpg", "/wc1.jpg", "/wc3.jpg", "/wc9.jpg", "/wc4.jpg"]
const RIGHT_PHOTOS = ["/wc8.jpg", "/wc6.jpg", "/wc4.jpg", "/wc2.jpg", "/wc7.jpg"]

function PhotoStrip({ photos, direction = "up" }: { photos: string[]; direction?: "up" | "down" }) {
  return (
    <div style={{ overflow: "hidden", height: "100%", position: "relative" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "3px",
        animation: `strip-${direction} 28s linear infinite` }}>
        {[...photos, ...photos].map((src, i) => (
          <div key={i} style={{ position: "relative", flexShrink: 0, height: "175px" }}>
            <img src={src} alt="" style={{
              width: "100%", height: "100%", objectFit: "cover", display: "block",
              filter: "grayscale(85%) brightness(0.45) contrast(1.3)",
              transition: "filter 0.5s ease",
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLImageElement).style.filter = "grayscale(20%) brightness(0.7) contrast(1.1)")}
            onMouseLeave={e => ((e.currentTarget as HTMLImageElement).style.filter = "grayscale(85%) brightness(0.45) contrast(1.3)")}
            onError={e => { (e.currentTarget as HTMLImageElement).src = `https://picsum.photos/300/500?random=${i + 50}` }} />
            {/* scan lines */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
              backgroundImage: "repeating-linear-gradient(0deg,rgba(0,0,0,0.18) 0,rgba(0,0,0,0.18) 1px,transparent 1px,transparent 4px)" }} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Decorative corner bracket ───────────────────────────────────────────────
type CornerPos = "tl" | "tr" | "bl" | "br"
function Bracket({ pos, color = "#FFB800", size = 18, thickness = 2 }: {
  pos: CornerPos; color?: string; size?: number; thickness?: number
}) {
  const style: React.CSSProperties = {
    position: "absolute", width: size, height: size, zIndex: 20,
    ...(pos === "tl" ? { top: -thickness, left: -thickness, borderTop: `${thickness}px solid ${color}`, borderLeft: `${thickness}px solid ${color}` } : {}),
    ...(pos === "tr" ? { top: -thickness, right: -thickness, borderTop: `${thickness}px solid ${color}`, borderRight: `${thickness}px solid ${color}` } : {}),
    ...(pos === "bl" ? { bottom: -thickness, left: -thickness, borderBottom: `${thickness}px solid ${color}`, borderLeft: `${thickness}px solid ${color}` } : {}),
    ...(pos === "br" ? { bottom: -thickness, right: -thickness, borderBottom: `${thickness}px solid ${color}`, borderRight: `${thickness}px solid ${color}` } : {}),
  }
  return <div style={style} />
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function TrophyScene() {
  useFonts()
  const [timeLeft, setTimeLeft] = useState(getTimeLeft())
  const [hint, setHint] = useState(true)
  const pad = (n: number) => String(n).padStart(2, "0")

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setHint(false), 3500)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes strip-up   { 0%{transform:translateY(0)}    100%{transform:translateY(-50%)} }
        @keyframes strip-down { 0%{transform:translateY(-50%)} 100%{transform:translateY(0)}    }

        @keyframes scanline-sweep {
          0%   { transform: translateY(-4px); opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }

        @keyframes glitch {
          0%,90%,100% { clip-path:none; transform:translate(0); color:#fff; }
          91%          { clip-path:inset(15% 0 55% 0); transform:translate(-4px, 1px); color:#00e5ff; }
          92%          { clip-path:inset(60% 0 8% 0);  transform:translate(4px,-1px);  color:#fff; }
          93%          { clip-path:none;               transform:translate(0);          color:#FFB800; }
          94%          { clip-path:none;               transform:translate(0);          color:#fff; }
        }

        @keyframes dot-blink {
          0%,100%{ opacity:1; transform:scale(1);   }
          50%    { opacity:0.3; transform:scale(0.5); }
        }

        @keyframes card-in {
          from { opacity:0; transform:translateY(36px) scale(0.96); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }

        @keyframes fade-up {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }

        @keyframes card-border-pulse {
          0%,100%{ box-shadow: 0 0 30px rgba(255,184,0,0.1), 0 0 80px rgba(255,184,0,0.03); }
          50%    { box-shadow: 0 0 55px rgba(255,184,0,0.2), 0 0 120px rgba(255,184,0,0.07), 0 0 200px rgba(0,229,255,0.03); }
        }

        @keyframes digit-tick {
          0%  { transform:translateY(0);    opacity:1; }
          40% { transform:translateY(-10px); opacity:0; }
          60% { transform:translateY(10px);  opacity:0; }
          100%{ transform:translateY(0);    opacity:1; }
        }

        @keyframes hint-fade {
          0%,70%  { opacity:1; }
          100%    { opacity:0; }
        }

        @keyframes hex-drift {
          0%   { background-position: 0 0; }
          100% { background-position: 56px 100px; }
        }

        .digit-block { animation: digit-tick 0.28s ease-in-out; }

        @media (max-width: 767px) {
          .side-strip { display: none !important; }
        }
      `}</style>

      <div style={{
        position: "relative", display: "flex", width: "100%", minHeight: "100vh",
        background: "#03040a", overflow: "hidden",
        fontFamily: "'Rajdhani', sans-serif",
      }}>

        {/* ── Hex grid ── */}
        <div style={{
          position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.055,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100'%3E%3Cpath d='M28 2L54 17v30L28 62 2 47V17z' fill='none' stroke='%23FFB800' stroke-width='0.6'/%3E%3C/svg%3E")`,
          backgroundSize: "56px 100px",
          animation: "hex-drift 40s linear infinite",
        }} />

        {/* ── Scanline sweep ── */}
        <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{
            position: "absolute", left: 0, right: 0, height: "3px",
            background: "linear-gradient(to right, transparent 0%, rgba(0,229,255,0.08) 20%, rgba(255,184,0,0.12) 50%, rgba(0,229,255,0.08) 80%, transparent 100%)",
            animation: "scanline-sweep 10s linear infinite",
          }} />
        </div>

        {/* ── Ambient glow ── */}
        <div style={{
          position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 60% 55% at 50% 52%, rgba(255,184,0,0.07) 0%, rgba(0,229,255,0.025) 38%, transparent 68%)",
        }} />
        <div style={{
          position: "fixed", top: 0, left: 0, width: "280px", height: "280px",
          background: "radial-gradient(circle at top left, rgba(0,229,255,0.06) 0%, transparent 65%)",
          zIndex: 0, pointerEvents: "none",
        }} />
        <div style={{
          position: "fixed", bottom: 0, right: 0, width: "280px", height: "280px",
          background: "radial-gradient(circle at bottom right, rgba(255,184,0,0.07) 0%, transparent 65%)",
          zIndex: 0, pointerEvents: "none",
        }} />

        {/* ── Top/bottom edge lines ── */}
        <div style={{ position: "fixed", top: 0, inset: "0 0 auto", height: "2px", zIndex: 30,
          background: "linear-gradient(to right, transparent 0%, #00e5ff 15%, #FFB800 50%, #00e5ff 85%, transparent 100%)",
          opacity: 0.75 }} />
        <div style={{ position: "fixed", bottom: 0, inset: "auto 0 0", height: "1px", zIndex: 30,
          background: "linear-gradient(to right, transparent 10%, rgba(255,184,0,0.5) 50%, transparent 90%)",
          opacity: 0.6 }} />

        {/* ── Grain ── */}
        <div style={{
          position: "fixed", inset: 0, zIndex: 2, pointerEvents: "none",
          opacity: 0.03, mixBlendMode: "overlay",
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px",
        }} />

        {/* ════ LEFT STRIP ════ */}
        <div className="side-strip" style={{
          width: "clamp(70px, 7.5vw, 108px)", flexShrink: 0,
          height: "100vh", position: "sticky", top: 0,
          overflow: "hidden", padding: "6px 3px 6px 6px", zIndex: 5,
        }}>
          <div style={{ position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none",
            background: "linear-gradient(to right, #03040a 0%, transparent 32%), linear-gradient(to bottom, #03040a 0%, transparent 8%, transparent 92%, #03040a 100%)" }} />
          {/* right edge accent */}
          <div style={{ position: "absolute", right: 3, top: "8%", bottom: "8%", width: "1px",
            background: "linear-gradient(to bottom, transparent, rgba(255,184,0,0.35) 40%, rgba(0,229,255,0.2) 60%, transparent)" }} />
          <PhotoStrip photos={LEFT_PHOTOS} direction="up" />
        </div>

        {/* ════ CENTER ════ */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          minHeight: "100vh", padding: "28px 16px",
          position: "relative", zIndex: 5,
        }}>

          {/* Live badge */}
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            marginBottom: "22px",
            animation: "fade-up 0.5s ease both",
          }}>
            <div style={{ height: "1px", width: "32px", background: "linear-gradient(to right, transparent, rgba(0,229,255,0.5))" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <div style={{
                width: "7px", height: "7px", borderRadius: "50%",
                background: "#00e5ff", boxShadow: "0 0 8px #00e5ff, 0 0 16px rgba(0,229,255,0.4)",
                animation: "dot-blink 1.1s ease-in-out infinite",
              }} />
              <span style={{ color: "#00e5ff", fontSize: "10px", fontWeight: 700, letterSpacing: "0.42em", textTransform: "uppercase" }}>
                Official Countdown
              </span>
            </div>
            <div style={{ height: "1px", width: "32px", background: "linear-gradient(to left, transparent, rgba(0,229,255,0.5))" }} />
          </div>

          {/* ─── CARD ─── */}
          <div style={{
            width: "100%", maxWidth: "430px",
            position: "relative",
            animation: "card-in 1s cubic-bezier(0.16,1,0.3,1) 0.15s both",
          }}>
            {/* corner brackets */}
            <Bracket pos="tl" color="#FFB800" size={22} thickness={2} />
            <Bracket pos="tr" color="#00e5ff" size={22} thickness={2} />
            <Bracket pos="bl" color="#00e5ff" size={22} thickness={2} />
            <Bracket pos="br" color="#FFB800" size={22} thickness={2} />

            {/* inner card */}
            <div style={{
              background: "linear-gradient(170deg, rgba(11,13,22,0.98) 0%, rgba(5,6,12,0.99) 100%)",
              border: "1px solid rgba(255,184,0,0.15)",
              borderRadius: "3px",
              overflow: "hidden",
              animation: "card-border-pulse 5s ease-in-out infinite",
            }}>

              {/* ── Header ── */}
              <div style={{
                position: "relative",
                background: "linear-gradient(106deg, rgba(255,184,0,0.09) 0%, rgba(0,229,255,0.03) 60%, transparent 100%)",
                borderBottom: "1px solid rgba(255,184,0,0.12)",
                padding: "20px 22px 18px",
                overflow: "hidden",
              }}>
                {/* diagonal slash */}
                <div style={{
                  position: "absolute", inset: 0, pointerEvents: "none",
                  clipPath: "polygon(62% 0%, 100% 0%, 100% 100%, 42% 100%)",
                  background: "linear-gradient(135deg, rgba(0,229,255,0.04) 0%, transparent 70%)",
                }} />
                {/* top inner shine */}
                <div style={{ position: "absolute", top: 0, left: "5%", right: "5%", height: "1px",
                  background: "linear-gradient(to right, transparent, rgba(255,210,80,0.45), transparent)" }} />

                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                  <div>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      marginBottom: "8px",
                      background: "rgba(255,184,0,0.08)",
                      border: "1px solid rgba(255,184,0,0.2)",
                      borderRadius: "2px",
                      padding: "3px 8px",
                    }}>
                      <div style={{ width: "5px", height: "5px", background: "#FFB800",
                        boxShadow: "0 0 5px #FFB800", clipPath: "polygon(50% 0%,100% 50%,50% 100%,0% 50%)" }} />
                      <span style={{ color: "#FFB800", fontSize: "9px", fontWeight: 700, letterSpacing: "0.38em", textTransform: "uppercase" }}>
                        FIFA Official
                      </span>
                    </div>
                    <h1 style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: "clamp(32px, 8.5vw, 46px)",
                      color: "#ffffff",
                      letterSpacing: "0.06em",
                      lineHeight: 0.95,
                      animation: "glitch 8s ease-in-out infinite",
                    }}>
                      WORLD CUP
                      <br />
                      <span style={{ color: "#FFB800" }}>2026</span>
                    </h1>
                    <p style={{ color: "rgba(255,255,255,0.28)", fontSize: "10px",
                      letterSpacing: "0.32em", textTransform: "uppercase", marginTop: "6px" }}>
                      The Greatest Show on Earth
                    </p>
                  </div>

                  {/* Flags */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "7px", alignItems: "flex-end", paddingTop: "4px" }}>
                    {[{ code: "us", name: "USA" }, { code: "ca", name: "CAN" }, { code: "mx", name: "MEX" }].map(({ code, name }) => (
                      <div key={code} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                        <span style={{ color: "rgba(255,255,255,0.28)", fontSize: "9px",
                          letterSpacing: "0.18em", fontWeight: 600, textTransform: "uppercase" }}>
                          {name}
                        </span>
                        <div style={{ width: 30, height: 20, overflow: "hidden", borderRadius: "2px",
                          border: "1px solid rgba(255,184,0,0.18)", flexShrink: 0 }}>
                          <img src={`https://flagcdn.com/w160/${code}.png`} alt={name}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Trophy canvas ── */}
              <div style={{
                position: "relative",
                height: "clamp(265px, 38vw, 330px)",
                background: "radial-gradient(ellipse 65% 55% at 50% 58%, rgba(255,184,0,0.09) 0%, rgba(0,229,255,0.02) 45%, transparent 70%)",
              }}>
                {/* crt scan lines */}
                <div style={{ position: "absolute", inset: 0, zIndex: 4, pointerEvents: "none",
                  backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.09) 0, rgba(0,0,0,0.09) 1px, transparent 1px, transparent 4px)" }} />
                {/* bottom fade into countdown */}
                <div style={{ position: "absolute", bottom: 0, inset: "auto 0 0", height: "80px", zIndex: 5, pointerEvents: "none",
                  background: "linear-gradient(to bottom, transparent, rgba(5,6,12,0.95))" }} />

                <Canvas camera={{ position: [0, 1, 5] }} style={{ position: "absolute", inset: 0 }}>
                  <color attach="background" args={["#060709"]} />
                  <Stage environment="sunset" intensity={0.95}>
                    <Trophy />
                  </Stage>
                  <OrbitControls enableZoom={false} enablePan={false} enableRotate />
                </Canvas>

                {/* interact hint */}
                {hint && (
                  <div style={{
                    position: "absolute", bottom: "18px", left: "50%", transform: "translateX(-50%)",
                    zIndex: 10, pointerEvents: "none",
                    display: "flex", alignItems: "center", gap: "6px",
                    animation: "hint-fade 3.5s ease forwards",
                  }}>
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "9px",
                      letterSpacing: "0.3em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                      ↺ Drag to rotate
                    </span>
                  </div>
                )}
              </div>

              {/* ── Countdown ── */}
              <div style={{
                borderTop: "1px solid rgba(255,184,0,0.1)",
                background: "linear-gradient(180deg, rgba(255,184,0,0.05) 0%, transparent 100%)",
                padding: "15px 18px 20px",
              }}>
                {/* countdown header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "6px", height: "6px", background: "#FFB800",
                      boxShadow: "0 0 6px #FFB800", borderRadius: "50%",
                      animation: "dot-blink 1.4s ease-in-out infinite" }} />
                    <span style={{ color: "#FFB800", fontSize: "10px", fontWeight: 700,
                      letterSpacing: "0.38em", textTransform: "uppercase" }}>
                      Match Begins
                    </span>
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.22)", fontSize: "10px",
                    letterSpacing: "0.2em", fontWeight: 600 }}>
                    JUN 11 · 2026
                  </span>
                </div>

                {/* digits row */}
                <div style={{ display: "flex", alignItems: "stretch", justifyContent: "center", gap: "5px" }}>
                  {([
                    { value: timeLeft.days,    label: "Days"  },
                    { value: timeLeft.hours,   label: "Hours" },
                    { value: timeLeft.minutes, label: "Mins"  },
                    { value: timeLeft.seconds, label: "Secs"  },
                  ] as const).map(({ value, label }, i) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <div style={{
                        background: "rgba(255,184,0,0.05)",
                        border: "1px solid rgba(255,184,0,0.16)",
                        borderRadius: "3px",
                        padding: "10px 6px 8px",
                        minWidth: "clamp(54px, 13.5vw, 72px)",
                        display: "flex", flexDirection: "column", alignItems: "center",
                        position: "relative", overflow: "hidden",
                      }}>
                        {/* top shine */}
                        <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: "1px",
                          background: "linear-gradient(to right, transparent, rgba(255,184,0,0.38), transparent)" }} />
                        {/* inner glow */}
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "30%", pointerEvents: "none",
                          background: "linear-gradient(to top, rgba(255,184,0,0.04), transparent)" }} />

                        <span
                          key={value}
                          className="digit-block"
                          style={{
                            fontFamily: "'Bebas Neue', sans-serif",
                            fontSize: "clamp(34px, 9.5vw, 50px)",
                            color: "#ffffff",
                            lineHeight: 1,
                            letterSpacing: "0.04em",
                            textShadow: "0 0 24px rgba(255,184,0,0.45), 0 2px 4px rgba(0,0,0,0.6)",
                            display: "block",
                          }}
                        >
                          {pad(value)}
                        </span>
                        <span style={{
                          color: "rgba(255,184,0,0.48)", fontSize: "8px", fontWeight: 700,
                          letterSpacing: "0.28em", textTransform: "uppercase", marginTop: "3px",
                        }}>
                          {label}
                        </span>
                      </div>

                      {i < 3 && (
                        <span style={{
                          fontFamily: "'Bebas Neue', sans-serif",
                          color: "rgba(255,184,0,0.28)", fontSize: "26px",
                          lineHeight: 1, alignSelf: "flex-start", marginTop: "9px",
                        }}>:</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* bottom inner shine */}
              <div style={{ height: "1px", background: "linear-gradient(to right, transparent, rgba(0,229,255,0.15), transparent)" }} />
            </div>
          </div>

          {/* Footer */}
          <div style={{
            marginTop: "22px", display: "flex", alignItems: "center", gap: "14px",
            animation: "fade-up 1s ease 0.9s both",
          }}>
            <div style={{ height: "1px", width: "36px",
              background: "linear-gradient(to right, transparent, rgba(0,229,255,0.3))" }} />
            <p style={{ color: "rgba(255,255,255,0.12)", fontSize: "9px",
              letterSpacing: "0.42em", textTransform: "uppercase" }}>
              Developed by{" "}
              <a href="" style={{
                color: "rgba(255,184,0,0.35)", textDecoration: "none",
                transition: "color 0.3s",
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,184,0,0.7)")}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,184,0,0.35)")}
              >
                VISION
              </a>
            </p>
            <div style={{ height: "1px", width: "36px",
              background: "linear-gradient(to left, transparent, rgba(255,184,0,0.3))" }} />
          </div>
        </div>

        {/* ════ RIGHT STRIP ════ */}
        <div className="side-strip" style={{
          width: "clamp(70px, 7.5vw, 108px)", flexShrink: 0,
          height: "100vh", position: "sticky", top: 0,
          overflow: "hidden", padding: "6px 6px 6px 3px", zIndex: 5,
        }}>
          <div style={{ position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none",
            background: "linear-gradient(to left, #03040a 0%, transparent 32%), linear-gradient(to bottom, #03040a 0%, transparent 8%, transparent 92%, #03040a 100%)" }} />
          {/* left edge accent */}
          <div style={{ position: "absolute", left: 3, top: "8%", bottom: "8%", width: "1px",
            background: "linear-gradient(to bottom, transparent, rgba(0,229,255,0.3) 40%, rgba(255,184,0,0.2) 60%, transparent)" }} />
          <PhotoStrip photos={RIGHT_PHOTOS} direction="down" />
        </div>

      </div>
    </>
  )
}