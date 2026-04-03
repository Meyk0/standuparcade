"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import CasinoBackground from "@/components/CasinoBackground";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

// Cosmetic animated reel for the hero
function DemoReel() {
  const symbols = ["🍒", "7️⃣", "💎", "🔔", "🍋", "⭐", "🎰", "🍀"];
  const [current, setCurrent] = useState(0);
  const [isSpinning, setIsSpinning] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isSpinning) setCurrent((c) => (c + 1) % symbols.length);
    }, 120);
    const cycle = setInterval(() => {
      setIsSpinning(false);
      setTimeout(() => setIsSpinning(true), 2500);
    }, 4500);
    return () => { clearInterval(interval); clearInterval(cycle); };
  }, [isSpinning, symbols.length]);

  return (
    <div className="flex gap-3">
      {[0, 1, 2].map((offset) => (
        <div
          key={offset}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 border-yellow-500/50 bg-black/60 flex items-center justify-center text-3xl sm:text-4xl"
        >
          {isSpinning
            ? symbols[(current + offset * 3) % symbols.length]
            : "7️⃣"}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugError, setSlugError] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [findSlug, setFindSlug] = useState("");

  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!slugEdited) setSlug(generateSlug(teamName));
  }, [teamName, slugEdited]);

  const checkSlug = (s: string) => {
    if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    if (s.length < 3) {
      setSlugAvailable(null);
      setSlugError(s.length > 0 ? "Slug must be at least 3 characters" : "");
      return;
    }
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(s) && s.length >= 3) {
      setSlugAvailable(false);
      setSlugError("Lowercase letters, numbers, and hyphens only");
      return;
    }
    setSlugChecking(true);
    checkTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/teams/check?slug=${encodeURIComponent(s)}`);
        const data = await res.json();
        setSlugAvailable(data.available);
        setSlugError(data.available ? "" : "This slug is taken");
        if (!data.available && data.suggestions) {
          setSlugError(`Taken — try: ${data.suggestions.join(", ")}`);
        }
      } catch {
        setSlugError("Could not check availability");
      }
      setSlugChecking(false);
    }, 400);
  };

  const handleSlugChange = (value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40);
    setSlug(cleaned);
    setSlugEdited(true);
    checkSlug(cleaned);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !slug || slugAvailable === false) return;
    setCreating(true);
    setCreateError("");
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: teamName.trim(), slug }),
      });
      if (!res.ok) {
        const data = await res.json();
        setCreateError(data.error || "Failed to create team");
        setCreating(false);
        return;
      }
      const data = await res.json();
      router.push(`/team/${data.slug}`);
    } catch {
      setCreateError("Something went wrong. Try again.");
      setCreating(false);
    }
  };

  const handleFind = (e: React.FormEvent) => {
    e.preventDefault();
    if (findSlug.trim()) router.push(`/team/${findSlug.trim().toLowerCase()}`);
  };

  const inputClass =
    "w-full px-4 py-3 bg-black/40 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-yellow-500 text-sm backdrop-blur-sm";

  return (
    <CasinoBackground>
      <main className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="max-w-md w-full space-y-8 text-center">

          {/* Hero */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-bold text-white drop-shadow-lg" style={{ fontFamily: "'Press Start 2P', monospace", textShadow: "0 0 30px rgba(255,215,0,0.4)" }}>
              <span className="text-yellow-400">STANDUP</span>
              <br />
              <span className="text-pink-400">ARCADE</span>
            </h1>
            <p className="text-white/70 text-sm sm:text-base">
              Stop deciding who goes next. Let the machine pick.
            </p>
            <div className="flex justify-center pt-2">
              <DemoReel />
            </div>
          </div>

          {/* Create team card */}
          <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-4 text-left shadow-2xl">
            <h2 className="text-sm font-bold text-yellow-400 uppercase tracking-widest text-center">
              Create Your Team
            </h2>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-[10px] text-white/50 mb-1 uppercase tracking-wider">
                  Team Name
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Your team name"
                  maxLength={80}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-[10px] text-white/50 mb-1 uppercase tracking-wider">
                  Team Slug
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/30 hidden sm:inline">/team/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    onBlur={() => slug.length >= 3 && checkSlug(slug)}
                    placeholder="your-team-slug"
                    maxLength={40}
                    className={`flex-1 ${inputClass} font-mono`}
                  />
                </div>
                <div className="mt-1 h-4">
                  {slugChecking && <span className="text-[10px] text-white/40">Checking...</span>}
                  {!slugChecking && slugAvailable === true && slug.length >= 3 && (
                    <span className="text-[10px] text-green-400">Available!</span>
                  )}
                  {!slugChecking && slugError && (
                    <span className="text-[10px] text-red-400">{slugError}</span>
                  )}
                </div>
              </div>

              {createError && <p className="text-[10px] text-red-400">{createError}</p>}

              <button
                type="submit"
                disabled={creating || !teamName.trim() || slug.length < 3 || slugAvailable === false}
                className="w-full py-3 text-sm font-bold uppercase tracking-wider rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-b from-yellow-400 to-yellow-600 text-black hover:from-yellow-300 hover:to-yellow-500 shadow-lg shadow-yellow-500/20"
              >
                {creating ? "CREATING..." : "CREATE YOUR TEAM →"}
              </button>
            </form>
          </div>

          {/* Find team */}
          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-5 shadow-xl">
            <p className="text-xs text-white/50 mb-3">
              Already have a team? Enter your slug to rejoin.
            </p>
            <form onSubmit={handleFind} className="flex gap-2">
              <input
                type="text"
                value={findSlug}
                onChange={(e) =>
                  setFindSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                }
                placeholder="your-team-slug"
                className={`flex-1 ${inputClass} font-mono`}
              />
              <button
                type="submit"
                disabled={!findSlug.trim()}
                className="px-5 py-3 text-xs font-bold uppercase rounded-lg border border-white/20 text-white/80 hover:bg-white/10 transition-colors disabled:opacity-40"
              >
                GO
              </button>
            </form>
          </div>

        </div>
      </main>
    </CasinoBackground>
  );
}
