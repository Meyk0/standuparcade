"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

// Cosmetic animated reel for the landing page
function DemoReel() {
  const names = [
    "ALICE",
    "BOB",
    "CHARLIE",
    "DIANA",
    "EVE",
    "FRANK",
    "GRACE",
    "???",
  ];
  const [current, setCurrent] = useState(0);
  const [isSpinning, setIsSpinning] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isSpinning) {
        setCurrent((c) => (c + 1) % names.length);
      }
    }, 150);

    // Stop spinning after 2s, restart after 3s
    const cycle = setInterval(() => {
      setIsSpinning(false);
      setTimeout(() => setIsSpinning(true), 3000);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(cycle);
    };
  }, [isSpinning, names.length]);

  return (
    <div className="border-4 border-skin-border rounded-lg bg-skin-reel-bg p-6 sm:p-8 inline-block">
      <div className="flex justify-center gap-2 mb-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              isSpinning
                ? "bg-skin-accent animate-pulse"
                : "bg-skin-accent"
            }`}
          />
        ))}
      </div>
      <span
        className={`text-3xl sm:text-5xl font-bold tracking-wider ${
          isSpinning
            ? "text-skin-text"
            : "text-skin-accent animate-winner-flash"
        }`}
      >
        {names[current]}
      </span>
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

  // Auto-generate slug from team name
  useEffect(() => {
    if (!slugEdited) {
      setSlug(generateSlug(teamName));
    }
  }, [teamName, slugEdited]);

  // Check slug availability (debounced)
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

  const handleSlugBlur = () => {
    if (slug.length >= 3) {
      checkSlug(slug);
    }
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
    if (findSlug.trim()) {
      router.push(`/team/${findSlug.trim().toLowerCase()}`);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12">
      <div className="max-w-xl w-full space-y-12 text-center">
        {/* Hero */}
        <div className="space-y-6">
          <h1 className="text-3xl sm:text-5xl font-bold text-skin-accent">
            STANDUP SLOTS
          </h1>
          <p className="text-skin-text-secondary text-sm sm:text-lg">
            Stop deciding who goes next. Let the machine pick.
          </p>

          {/* Demo reel */}
          <div className="flex justify-center">
            <DemoReel />
          </div>
        </div>

        {/* Create team */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-skin-text uppercase tracking-wider">
            Create Your Team
          </h2>

          <form onSubmit={handleCreate} className="space-y-4 text-left">
            <div>
              <label className="block text-xs text-skin-text-secondary mb-1 uppercase tracking-wider">
                Team Name
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Connectly Engineering"
                maxLength={80}
                className="w-full px-4 py-3 bg-skin-bg-secondary border border-skin-border rounded-lg text-skin-text placeholder:text-skin-text-secondary focus:outline-none focus:border-skin-accent text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-skin-text-secondary mb-1 uppercase tracking-wider">
                Team Slug
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-skin-text-secondary hidden sm:inline">
                  /team/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  onBlur={handleSlugBlur}
                  placeholder="your-team-slug"
                  maxLength={40}
                  className="flex-1 px-4 py-3 bg-skin-bg-secondary border border-skin-border rounded-lg text-skin-text placeholder:text-skin-text-secondary focus:outline-none focus:border-skin-accent text-sm font-mono"
                />
              </div>
              {/* Slug status */}
              <div className="mt-1 h-5">
                {slugChecking && (
                  <span className="text-xs text-skin-text-secondary">
                    Checking...
                  </span>
                )}
                {!slugChecking && slugAvailable === true && slug.length >= 3 && (
                  <span className="text-xs text-green-500">Available!</span>
                )}
                {!slugChecking && slugError && (
                  <span className="text-xs text-skin-danger">{slugError}</span>
                )}
              </div>
            </div>

            {createError && (
              <p className="text-xs text-skin-danger">{createError}</p>
            )}

            <button
              type="submit"
              disabled={creating || !teamName.trim() || slug.length < 3 || slugAvailable === false}
              className="w-full px-6 py-4 text-lg font-bold bg-skin-button-bg text-skin-button-text rounded-lg hover:bg-skin-button-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? "CREATING..." : "CREATE YOUR TEAM →"}
            </button>
          </form>
        </div>

        {/* Find your team */}
        <div className="border-t border-skin-border pt-8 space-y-3">
          <p className="text-sm text-skin-text-secondary">
            Already have a team? Enter your slug to rejoin.
          </p>
          <form onSubmit={handleFind} className="flex gap-2 max-w-sm mx-auto">
            <input
              type="text"
              value={findSlug}
              onChange={(e) =>
                setFindSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
              }
              placeholder="your-team-slug"
              className="flex-1 px-3 py-2 bg-skin-bg-secondary border border-skin-border rounded text-skin-text text-sm placeholder:text-skin-text-secondary focus:outline-none focus:border-skin-accent font-mono"
            />
            <button
              type="submit"
              disabled={!findSlug.trim()}
              className="px-4 py-2 text-sm font-bold border border-skin-border rounded hover:bg-skin-muted transition-colors disabled:opacity-50"
            >
              GO
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
