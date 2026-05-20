import { Link } from "react-router-dom";

const features = [
  {
    icon: "videocam",
    title: "AI-Powered Vital Tracking (rPPG)",
    desc: "Clinical-grade camera technology analyzes blood volume changes through your skin to deliver instant vitals — no hardware needed.",
    bg: "bg-purple-50",
  },
  {
    icon: "lock",
    title: "Secure Medical Records",
    desc: "End-to-end encrypted vault for your complete health history, prescriptions, and lab results.",
    bg: "bg-blue-50",
  },
  {
    icon: "stethoscope",
    title: "Expert Doctors On-Demand",
    desc: "Connect with verified specialists for video consultations, follow-ups, and second opinions — anytime.",
    bg: "bg-emerald-50",
  },
  {
    icon: "monitor_heart",
    title: "Continuous Health Monitoring",
    desc: "Track vitals over time with smart alerts that notify your care team before problems escalate.",
    bg: "bg-amber-50",
  },
];

const steps = [
  {
    n: "1",
    title: "Seamless Enrollment",
    desc: "Create your profile and secure your medical ID in less than 3 minutes. No hardware shipments required.",
  },
  {
    n: "2",
    title: "Capture Vitals Instantly",
    desc: "Look into your front-facing camera. Our rPPG algorithm tracks your heart rate, SpO2, and stress levels in real-time.",
  },
  {
    n: "3",
    title: "Concierge Review",
    desc: "Your data is instantly shared with your dedicated medical team for proactive intervention and wellness planning.",
  },
];

const stats = [
  { value: "50K+", label: "Active Patients" },
  { value: "200+", label: "Verified Doctors" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "24/7", label: "Support Available" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fdf7f9] font-sans">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-purple-50">
        <div className="max-w-7xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#632a7e] rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-base">
                stethoscope
              </span>
            </div>
            <span className="text-[#632a7e] font-bold text-lg">
              Tenaye Health
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-gray-600 hover:text-[#632a7e] transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm font-bold text-white bg-[#632a7e] px-5 py-2.5 rounded-full hover:bg-purple-900 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 bg-purple-100 px-4 py-1.5 rounded-full text-[#632a7e] text-sm font-semibold">
            <span className="material-symbols-outlined text-base">
              verified
            </span>
            Precision Health Monitoring
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-[#632a7e] leading-tight">
            Your Clinical <br />
            <span className="text-[#8b3d30]">Sanctuary,</span>
            <br />
            Anywhere.
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed max-w-md">
            Monitor vital signs with hospital-grade precision using nothing but
            your smartphone camera. No hardware, no wires — just advanced rPPG
            technology at your fingertips.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/register"
              className="bg-[#632a7e] text-white px-8 py-3.5 rounded-full font-bold text-base hover:bg-purple-900 shadow-lg transition-all"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="bg-purple-100 text-[#632a7e] px-8 py-3.5 rounded-full font-bold text-base hover:bg-purple-200 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Hero image + floating card */}
        <div className="relative">
          <div className="rounded-[40px] overflow-hidden shadow-2xl">
            <img
              src="https://i.pinimg.com/1200x/94/6e/cf/946ecf2091b6057cb2179e0d9c000f2d.jpg"
              alt="Doctor using tablet"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute bottom-[-20px] left-[-16px] bg-white p-5 rounded-3xl shadow-xl border border-gray-100 min-w-[180px]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-400 font-bold text-xs tracking-widest">
                HEART RATE
              </span>
              <span className="text-red-500 text-sm">❤️</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-gray-800">72</span>
              <span className="text-gray-400 font-bold text-sm">BPM</span>
            </div>
            <div className="mt-3 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#632a7e] w-[72%]" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-[#632a7e] py-12">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-3xl md:text-4xl font-black">{s.value}</p>
              <p className="text-purple-200 text-sm mt-1 font-medium">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-7xl mx-auto px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            Advanced Care Pillars
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            Combining medical expertise with cutting-edge optical vital
            detection.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className={`${f.bg} rounded-3xl p-6 flex flex-col gap-3`}
            >
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[#632a7e] text-xl">
                  {f.icon}
                </span>
              </div>
              <h3 className="font-bold text-gray-800 text-sm">{f.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Patient Journey ── */}
      <section className="max-w-7xl mx-auto px-8 py-16 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#632a7e] mb-8">
            The Patient Journey
          </h2>
          <div className="space-y-7">
            {steps.map((s) => (
              <div key={s.n} className="flex gap-4">
                <div className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full bg-purple-100 text-[#632a7e] font-bold text-sm">
                  {s.n}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{s.title}</h3>
                  <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 mt-8 bg-[#632a7e] text-white px-7 py-3 rounded-full font-bold text-sm hover:bg-purple-900 transition-all"
          >
            Start Your Journey
            <span className="material-symbols-outlined text-base">
              arrow_forward
            </span>
          </Link>
        </div>
        <div className="flex justify-center">
          <img
            src="https://i.pinimg.com/1200x/e0/e4/31/e0e43116340409b58609b9a1e69df512.jpg"
            alt="Patient journey"
            className="rounded-3xl shadow-2xl w-full max-w-sm object-cover"
          />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-7xl mx-auto px-8 pb-20">
        <div className="bg-[#632a7e] text-white rounded-3xl px-10 py-14 text-center shadow-xl">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Experience the Sanctuary.
          </h3>
          <p className="text-purple-200 mb-8 max-w-md mx-auto">
            Join Tenaye Health today and get your first consultation free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-[#632a7e] px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition"
            >
              Create Account
            </Link>
            <Link
              to="/login"
              className="bg-purple-800 text-white px-8 py-3 rounded-full font-bold hover:bg-purple-900 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-8 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#632a7e] rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm">
                stethoscope
              </span>
            </div>
            <span className="text-[#632a7e] font-bold">Tenaye Health</span>
          </div>
          <p className="text-xs text-gray-400">
            © 2025 Tenaye Health — Remote Patient Health Monitoring System
          </p>
        </div>
      </footer>
    </div>
  );
}
