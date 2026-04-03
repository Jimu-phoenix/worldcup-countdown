import { useRef, useState, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { useGLTF, Stage, OrbitControls } from "@react-three/drei"
import * as THREE from "three"

// ─── Font ─────────────────────────────────────────────
function useGoogleFont() {
  useEffect(() => {
    const link = document.createElement("link")
    link.href = "https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap"
    link.rel = "stylesheet"
    document.head.appendChild(link)
    
    return () => {
      document.head.removeChild(link)
    }
  }, [])
}

// ─── Trophy ───────────────────────────────────────────
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

// ─── Countdown ────────────────────────────────────────
const WORLD_CUP_DATE = new Date("2026-06-11T00:00:00")
function getTimeLeft() {
  const diff = WORLD_CUP_DATE.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

// ─── Photos ───────────────────────────────────────────
const LEFT_PHOTOS = [
  "/wc5.jpg",
  "/wc1.jpg", "/wc3.jpg",
  "/wc9.jpg",
  "/wc4.jpg",
]
const RIGHT_PHOTOS = [
  "/wc8.jpg",
  "/wc1.jpg",
  "/wc4.jpg", "/wc5.jpg",
  "/wc7.jpg",
]

function PhotoStrip({ photos, direction = "up" }: { photos: string[]; direction?: "up" | "down" }) {
  return (
    <div className="overflow-hidden h-full w-full relative">
      <div
        className="flex flex-col gap-2"
        style={{ animation: `scroll-${direction} 35s linear infinite` }}
      >
        {[...photos, ...photos].map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            className="w-full object-cover rounded-sm opacity-50 hover:opacity-80 transition-opacity duration-500"
            style={{ height: "160px" }}
            onError={(e) => {
              e.currentTarget.src = `https://picsum.photos/400/600?random=${i + Math.floor(Math.random() * 100)}`
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Flags ────────────────────────────────────────────
const HOST_COUNTRIES = [
  { code: "us", name: "USA" },
  { code: "ca", name: "Canada" },
  { code: "mx", name: "Mexico" },
]

function Flags() {
  return (
    <div className="flex items-center justify-center gap-6 md:gap-10">
      {HOST_COUNTRIES.map(({ code, name }) => (
        <div key={code} className="flex flex-col items-center gap-2 group">
          <div
            className="overflow-hidden rounded shadow-lg shadow-yellow-500/20 group-hover:shadow-yellow-400/50 transition-shadow duration-300"
            style={{ width: 56, height: 38 }}
          >
            <img
              src={`https://flagcdn.com/w160/${code}.png`}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <span className="text-yellow-500/60 text-[10px] tracking-[0.25em] uppercase">
            {name}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────
export default function TrophyScene() {
  useGoogleFont()
  const [timeLeft, setTimeLeft] = useState(getTimeLeft())

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <style>{`
        @keyframes scroll-up {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes scroll-down {
          0%   { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { text-shadow: 0 0 15px rgba(234,179,8,0.2); }
          50%       { text-shadow: 0 0 40px rgba(234,179,8,0.7), 0 0 80px rgba(234,179,8,0.2); }
        }
        @keyframes flicker {
          0%,100% { opacity:1; }
          92%     { opacity:1; }
          93%     { opacity:0.75; }
          94%     { opacity:1; }
          97%     { opacity:1; }
          98%     { opacity:0.85; }
        }
        @keyframes fade-in-up {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      <div
        className="relative flex w-full min-h-screen bg-black overflow-hidden"
        style={{ fontFamily: "Oswald, sans-serif" }}
      >
        {/* Grain overlay */}
        <div
          className="pointer-events-none fixed inset-0 z-50 opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: "200px 200px",
          }}
        />

        {/* Top / Bottom gold lines */}
        <div className="pointer-events-none fixed inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50 z-40" />
        <div className="pointer-events-none fixed inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50 z-40" />

        {/* Radial glow behind trophy */}
        <div
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(180,130,0,0.08) 0%, transparent 70%)",
          }}
        />

        {/* Left photo strip */}
        <div className="hidden md:block w-24 lg:w-32 shrink-0 h-screen sticky top-0 py-2 pl-2 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 w-full z-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(to right, #000 0%, transparent 40%), linear-gradient(to bottom, #000 0%, transparent 10%, transparent 90%, #000 100%)",
            }}
          />
          <PhotoStrip photos={LEFT_PHOTOS} direction="up" />
        </div>

        {/* ── Center ── */}
        <div className="flex-1 flex flex-col items-center justify-between py-6 px-4 min-h-screen gap-2 z-10">

          {/* Logo + Title */}
          <div
            className="text-center flex flex-col items-center gap-1"
            style={{ animation: "fade-in-up 0.8s ease both" }}
          >
            <img
              src="/wc-logo.png"
              alt="FIFA World Cup 2026"
              className="h-14 md:h-20 object-contain"
              onError={(e) => { e.currentTarget.style.display = "none" }}
            />
            <h1
              className="text-yellow-400 text-3xl md:text-5xl font-bold uppercase tracking-widest leading-none"
              style={{ animation: "flicker 9s infinite" }}
            >
              World Cup 2026
            </h1>
            <p className="text-white/30 text-xs uppercase tracking-[0.35em] mt-1">
              The Greatest Show on Earth
            </p>
          </div>

          {/* Trophy Canvas */}
          <div
            className="w-full flex-1"
            style={{ minHeight: 260, maxHeight: 460, animation: "fade-in-up 1s ease 0.2s both" }}
          >
            <Canvas camera={{ position: [0, 1, 5] }}>
              <color attach="background" args={["#000000"]} />
              <Stage environment="city" intensity={0.7}>
                <Trophy />
              </Stage>
              <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
            </Canvas>
          </div>

          {/* Host countries flags */}
          <div style={{ animation: "fade-in-up 1s ease 0.4s both" }}>
            <p className="text-center text-white/25 text-[10px] uppercase tracking-[0.3em] mb-3">
              Hosted By
            </p>
            <Flags />
          </div>

          {/* Divider */}
          <div className="w-full max-w-xs md:max-w-sm h-px bg-gradient-to-r from-transparent via-yellow-600/40 to-transparent" />

          {/* Countdown */}
          <div
            className="flex flex-col items-center gap-3 pb-4 w-full"
            style={{ animation: "fade-in-up 1s ease 0.6s both" }}
          >
            <p className="text-yellow-500/50 uppercase tracking-[0.4em] text-[10px] md:text-xs">
              Kickoff · June 11, 2026
            </p>
            <div className="flex items-end justify-center gap-1 md:gap-3 w-full">
              {[
                { value: timeLeft.days,    label: "Days" },
                { value: timeLeft.hours,   label: "Hours" },
                { value: timeLeft.minutes, label: "Min" },
                { value: timeLeft.seconds, label: "Sec" },
              ].map(({ value, label }, i) => (
                <div key={label} className="flex items-end gap-1 md:gap-3">
                  <div className="flex flex-col items-center min-w-[52px] md:min-w-[72px]">
                    <div
                      className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tabular-nums leading-none"
                      style={{
                        animation: "pulse-glow 3s ease-in-out infinite",
                        animationDelay: `${i * 0.25}s`,
                      }}
                    >
                      {String(value).padStart(2, "0")}
                    </div>
                    <div className="text-yellow-600/70 text-[9px] md:text-[11px] tracking-[0.25em] uppercase mt-1">
                      {label}
                    </div>
                  </div>
                  {i < 3 && (
                    <span className="text-yellow-600/50 text-2xl md:text-4xl font-bold pb-5 leading-none">
                      :
                    </span>
                  )}
                </div>
              ))}
              <br />
              
            </div>
            <p className="text-white/15 ">developed by <a href="">VISION</a></p>
          </div>
        </div>

        {/* Right photo strip */}
        <div className="hidden md:block w-24 lg:w-32 shrink-0 h-screen sticky top-0 py-2 pr-2 overflow-hidden">
          <div
            className="absolute inset-y-0 right-0 w-full z-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(to left, #000 0%, transparent 40%), linear-gradient(to bottom, #000 0%, transparent 10%, transparent 90%, #000 100%)",
            }}
          />
          <PhotoStrip photos={RIGHT_PHOTOS} direction="down" />
        </div>
      </div>
    </>
  )
}