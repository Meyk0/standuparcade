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
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const inputClass =
    "px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-yellow-500 text-sm backdrop-blur-sm";

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

      {/* Member list */}
      <div className="space-y-2">
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-2 p-3 rounded-lg bg-black/30 border border-white/10">
            {editingId === member.id ? (
              <>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} maxLength={50} className={`flex-1 ${inputClass}`} />
                <input type="text" value={editTagline} onChange={(e) => setEditTagline(e.target.value)} maxLength={60} placeholder="Tagline" className={`flex-1 ${inputClass}`} />
                <button onClick={() => handleSaveEdit(member.id)} className="text-[10px] px-2 py-1 text-yellow-400 hover:text-yellow-300">SAVE</button>
                <button onClick={() => setEditingId(null)} className="text-[10px] px-2 py-1 text-white/50 hover:text-white">CANCEL</button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm text-white font-bold">{member.name}</span>
                <span className="text-xs text-white/40 italic">{member.tagline || "—"}</span>
                <button onClick={() => handleStartEdit(member)} className="text-[10px] px-2 py-1 text-white/50 hover:text-yellow-400">EDIT</button>
                <button onClick={() => handleRemove(member.id)} className="text-[10px] px-2 py-1 text-red-400/70 hover:text-red-400">REMOVE</button>
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
