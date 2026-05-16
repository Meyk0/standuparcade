"use client";

import { useState } from "react";
import { Member } from "@/lib/types";
import { createClient } from "@/lib/supabase";
import { getRandomTagline } from "@/lib/skins";

interface RosterManagerProps {
  teamId: string;
  members: Member[];
  onMembersChange: () => void;
}

export default function RosterManager({
  teamId,
  members,
  onMembersChange,
}: RosterManagerProps) {
  const [newName, setNewName] = useState("");
  const [newTagline, setNewTagline] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editTagline, setEditTagline] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [bulkMessage, setBulkMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const inputClass =
    "px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-yellow-500 text-sm backdrop-blur-sm";

  const parseRosterLine = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed) return null;

    const separator = trimmed.includes("\t")
      ? "\t"
      : trimmed.includes(",")
        ? ","
        : trimmed.includes(" - ")
          ? " - "
          : "";

    if (!separator) {
      return { name: trimmed.slice(0, 50), tagline: getRandomTagline() };
    }

    const [rawName, ...rest] = trimmed.split(separator);
    const name = rawName.trim().slice(0, 50);
    const tagline = rest.join(separator).trim().slice(0, 60) || getRandomTagline();
    if (!name) return null;
    return { name, tagline };
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setLoading(true);
    await supabase.from("members").insert({
      team_id: teamId,
      name: newName.trim(),
      tagline: newTagline.trim() || getRandomTagline(),
    });
    setNewName("");
    setNewTagline("");
    setLoading(false);
    onMembersChange();
  };

  const handleBulkAdd = async () => {
    setBulkMessage("");
    const existingNames = new Set(members.map((member) => member.name.toLowerCase()));
    const seenNames = new Set(existingNames);
    const rows = bulkText
      .split(/\r?\n/)
      .map(parseRosterLine)
      .filter((row): row is { name: string; tagline: string } => {
        if (!row) return false;
        const key = row.name.toLowerCase();
        if (seenNames.has(key)) return false;
        seenNames.add(key);
        return true;
      })
      .map((row) => ({
        team_id: teamId,
        name: row.name,
        tagline: row.tagline,
      }));

    if (rows.length === 0) {
      setBulkMessage("Paste one name per line, or use Name, Tagline.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("members").insert(rows);
    setLoading(false);

    if (error) {
      setBulkMessage("Could not add roster. Try a smaller paste.");
      return;
    }

    setBulkText("");
    setBulkMessage(`Added ${rows.length} member${rows.length === 1 ? "" : "s"}.`);
    onMembersChange();
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm("Remove this member?")) return;
    await supabase.from("members").update({ is_active: false }).eq("id", memberId);
    onMembersChange();
  };

  const handleStartEdit = (member: Member) => {
    setEditingId(member.id);
    setEditName(member.name);
    setEditTagline(member.tagline || "");
  };

  const handleSaveEdit = async (memberId: string) => {
    if (!editName.trim()) return;
    await supabase.from("members").update({ name: editName.trim(), tagline: editTagline.trim() || null }).eq("id", memberId);
    setEditingId(null);
    onMembersChange();
  };

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-bold text-yellow-400 uppercase tracking-widest">
        Roster
      </h2>

      {/* Add member */}
      <form onSubmit={handleAdd} className="space-y-2">
        <div className="flex gap-2">
          <input type="text" placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={50} className={`flex-1 ${inputClass}`} />
          <input type="text" placeholder="Tagline (optional)" value={newTagline} onChange={(e) => setNewTagline(e.target.value)} maxLength={60} className={`flex-1 ${inputClass}`} />
        </div>
        <button
          type="submit"
          disabled={loading || !newName.trim()}
          className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-gradient-to-b from-yellow-400 to-yellow-600 text-black disabled:opacity-40"
        >
          Add Member
        </button>
      </form>

      {/* Bulk member import */}
      <div className="rounded-lg border border-white/10 bg-black/20 p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-white/60">
              Bulk Paste
            </h3>
            <p className="mt-1 text-[10px] leading-relaxed text-white/40">
              One name per line, or Name, Tagline.
            </p>
          </div>
          <button
            type="button"
            onClick={handleBulkAdd}
            disabled={loading || !bulkText.trim()}
            className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-white/20 text-white/80 hover:bg-white/10 disabled:opacity-40"
          >
            Add All
          </button>
        </div>
        <textarea
          value={bulkText}
          onChange={(event) => {
            setBulkText(event.target.value);
            setBulkMessage("");
          }}
          placeholder={"Alice\nBob, Backend updates\nCharlie - Customer calls"}
          rows={4}
          className={`mt-3 w-full resize-y ${inputClass}`}
        />
        {bulkMessage && (
          <p className="mt-2 text-[10px] text-white/50">{bulkMessage}</p>
        )}
      </div>

      {/* Member list */}
      <div className="space-y-2">
        {members.map((member) => (
          <div key={member.id} className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-black/30 border border-white/10">
            {editingId === member.id ? (
              <>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} maxLength={50} className={`flex-1 ${inputClass}`} />
                <input type="text" value={editTagline} onChange={(e) => setEditTagline(e.target.value)} maxLength={60} placeholder="Tagline" className={`flex-1 ${inputClass}`} />
                <button onClick={() => handleSaveEdit(member.id)} className="text-[10px] px-3 py-1.5 rounded border border-yellow-400/30 text-yellow-400 hover:text-yellow-300">SAVE</button>
                <button onClick={() => setEditingId(null)} className="text-[10px] px-3 py-1.5 rounded border border-white/10 text-white/50 hover:text-white">CANCEL</button>
              </>
            ) : (
              <>
                <span className="min-w-[120px] flex-1 text-sm text-white font-bold">{member.name}</span>
                <span className="text-xs text-white/40 italic">{member.tagline || "—"}</span>
                <button onClick={() => handleStartEdit(member)} className="text-[10px] px-3 py-1.5 rounded border border-white/10 text-white/50 hover:text-yellow-400">EDIT</button>
                <button onClick={() => handleRemove(member.id)} className="text-[10px] px-3 py-1.5 rounded border border-red-400/20 text-red-400/70 hover:text-red-400">REMOVE</button>
              </>
            )}
          </div>
        ))}
        {members.length === 0 && (
          <p className="text-white/40 text-xs italic">No members yet. Add your first one above!</p>
        )}
      </div>
    </div>
  );
}
