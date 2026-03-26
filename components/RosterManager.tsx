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
    if (!confirm("Remove this member? They can be restored later.")) return;
    await supabase
      .from("members")
      .update({ is_active: false })
      .eq("id", memberId);
    onMembersChange();
  };

  const handleStartEdit = (member: Member) => {
    setEditingId(member.id);
    setEditName(member.name);
    setEditTagline(member.tagline || "");
  };

  const handleSaveEdit = async (memberId: string) => {
    if (!editName.trim()) return;
    await supabase
      .from("members")
      .update({
        name: editName.trim(),
        tagline: editTagline.trim() || null,
      })
      .eq("id", memberId);
    setEditingId(null);
    onMembersChange();
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-skin-accent uppercase tracking-wider">
        Roster
      </h2>

      {/* Add member form */}
      <form onSubmit={handleAdd} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            maxLength={50}
            className="flex-1 px-3 py-2 bg-skin-bg-secondary border border-skin-border rounded text-skin-text text-sm placeholder:text-skin-text-secondary focus:outline-none focus:border-skin-accent"
          />
          <input
            type="text"
            placeholder="Tagline (optional)"
            value={newTagline}
            onChange={(e) => setNewTagline(e.target.value)}
            maxLength={60}
            className="flex-1 px-3 py-2 bg-skin-bg-secondary border border-skin-border rounded text-skin-text text-sm placeholder:text-skin-text-secondary focus:outline-none focus:border-skin-accent"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !newName.trim()}
          className="px-4 py-2 text-sm font-bold bg-skin-button-bg text-skin-button-text rounded hover:bg-skin-button-hover transition-colors disabled:opacity-50"
        >
          ADD MEMBER
        </button>
      </form>

      {/* Member list */}
      <div className="space-y-2">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-3 p-3 border border-skin-border rounded bg-skin-bg-secondary"
          >
            {editingId === member.id ? (
              <>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={50}
                  className="flex-1 px-2 py-1 bg-skin-bg border border-skin-border rounded text-skin-text text-sm focus:outline-none focus:border-skin-accent"
                />
                <input
                  type="text"
                  value={editTagline}
                  onChange={(e) => setEditTagline(e.target.value)}
                  maxLength={60}
                  placeholder="Tagline"
                  className="flex-1 px-2 py-1 bg-skin-bg border border-skin-border rounded text-skin-text text-sm placeholder:text-skin-text-secondary focus:outline-none focus:border-skin-accent"
                />
                <button
                  onClick={() => handleSaveEdit(member.id)}
                  className="text-xs px-2 py-1 text-skin-accent hover:text-skin-button-hover"
                >
                  SAVE
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="text-xs px-2 py-1 text-skin-text-secondary hover:text-skin-text"
                >
                  CANCEL
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm text-skin-text font-bold">
                  {member.name}
                </span>
                <span className="text-xs text-skin-text-secondary italic">
                  {member.tagline || "—"}
                </span>
                <button
                  onClick={() => handleStartEdit(member)}
                  className="text-xs px-2 py-1 text-skin-text-secondary hover:text-skin-accent"
                >
                  EDIT
                </button>
                <button
                  onClick={() => handleRemove(member.id)}
                  className="text-xs px-2 py-1 text-skin-danger hover:text-skin-danger/80"
                >
                  REMOVE
                </button>
              </>
            )}
          </div>
        ))}
        {members.length === 0 && (
          <p className="text-skin-text-secondary text-sm italic">
            No members yet. Add your first one above!
          </p>
        )}
      </div>
    </div>
  );
}
