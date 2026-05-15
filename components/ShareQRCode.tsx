"use client";

import { useMemo, useState } from "react";
import { generateQrMatrix } from "@/lib/qr";

interface ShareQRCodeProps {
  teamName: string;
  teamSlug: string;
}

const QUIET_ZONE = 4;

function getTeamUrl(teamSlug: string) {
  if (typeof window === "undefined") return `/team/${teamSlug}`;
  return `${window.location.origin}/team/${teamSlug}`;
}

function QrSvg({ value }: { value: string }) {
  const matrix = useMemo(() => {
    try {
      return generateQrMatrix(value);
    } catch {
      return null;
    }
  }, [value]);

  if (!matrix) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg bg-white p-4 text-center text-xs font-bold uppercase tracking-wider text-black">
        Link too long for QR
      </div>
    );
  }

  const size = matrix.length + QUIET_ZONE * 2;
  const path = matrix
    .flatMap((row, y) =>
      row.map((dark, x) =>
        dark ? `M${x + QUIET_ZONE},${y + QUIET_ZONE}h1v1h-1z` : ""
      )
    )
    .filter(Boolean)
    .join("");

  return (
    <svg
      aria-label="Team QR code"
      role="img"
      viewBox={`0 0 ${size} ${size}`}
      className="w-full h-full rounded-lg bg-white p-2"
      shapeRendering="crispEdges"
    >
      <path d={path} fill="#050505" />
    </svg>
  );
}

export default function ShareQRCode({ teamName, teamSlug }: ShareQRCodeProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const teamUrl = getTeamUrl(teamSlug);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(teamUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 text-xs border border-skin-border rounded hover:bg-skin-muted transition-colors"
      >
        QR CODE
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-qr-title"
        >
          <div className="w-full max-w-sm rounded-xl border border-skin-border bg-skin-bg-secondary p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="share-qr-title"
                  className="text-sm font-bold uppercase tracking-wider text-skin-accent"
                >
                  Join {teamName}
                </h2>
                <p className="mt-1 text-xs text-skin-text-secondary">
                  Scan to open this team room.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-lg leading-none text-skin-text-secondary hover:text-skin-text"
                aria-label="Close QR code"
              >
                x
              </button>
            </div>

            <div className="mx-auto my-5 aspect-square w-full max-w-[260px]">
              <QrSvg value={teamUrl} />
            </div>

            <div className="rounded-lg border border-skin-border bg-black/30 px-3 py-2">
              <p className="truncate font-mono text-[10px] text-skin-text-secondary">
                {teamUrl}
              </p>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 rounded-lg bg-skin-button-bg px-4 py-2 text-xs font-bold uppercase tracking-wider text-skin-button-text hover:bg-skin-button-hover"
              >
                {copied ? "COPIED!" : "COPY LINK"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-skin-border px-4 py-2 text-xs font-bold uppercase tracking-wider text-skin-text-secondary hover:bg-skin-muted"
              >
                DONE
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
