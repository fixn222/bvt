"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  Users2,
  Plus,
  Edit2,
  Trash2,
  Search,
  Sparkles,
  Check,
  X,
  Vote,
} from "lucide-react";
import { ITeam } from "@/types";

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [isLoading, setIsLoading] = useState(true);

  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<ITeam | null>(null);
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formMembers, setFormMembers] = useState("");
  const [formDisplayOrder, setFormDisplayOrder] = useState(0);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete dialog state
  const [deletingTeam, setDeletingTeam] = useState<ITeam | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTeams = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/teams");
      const data = await res.json();
      if (data.teams) {
        setTeams(data.teams);
      }
    } catch (err) {
      console.error("Failed to fetch admin teams:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const openCreateModal = () => {
    setEditingTeam(null);
    setFormName("");
    setFormSlug("");
    setFormDescription("");
    setFormImage(
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80"
    );
    setFormMembers("");
    setFormDisplayOrder(teams.length + 1);
    setFormIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (team: ITeam) => {
    setEditingTeam(team);
    setFormName(team.name);
    setFormSlug(team.slug);
    setFormDescription(team.description || "");
    setFormImage(team.image || "");
    setFormMembers(team.members ? team.members.join(", ") : "");
    setFormDisplayOrder(team.displayOrder || 0);
    setFormIsActive(team.isActive);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim()) {
      setFormError("Team name is required.");
      return;
    }

    if (!formImage.trim()) {
      setFormError("Team image URL is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const membersArray = formMembers
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean);

      const payload = {
        name: formName.trim(),
        slug: formSlug.trim() || undefined,
        description: formDescription.trim(),
        image: formImage.trim(),
        members: membersArray,
        displayOrder: Number(formDisplayOrder),
        isActive: formIsActive,
      };

      const url = editingTeam
        ? `/api/admin/teams/${editingTeam._id}`
        : "/api/admin/teams";

      const method = editingTeam ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to save team");
        return;
      }

      setIsModalOpen(false);
      fetchTeams();
    } catch (err) {
      console.error("Save team error:", err);
      setFormError("An unexpected network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!deletingTeam) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/teams/${deletingTeam._id}`, {
        method: "DELETE",
      });
      await res.json();
      setDeletingTeam(null);
      fetchTeams();
    } catch (err) {
      console.error("Delete team error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredTeams = teams.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterActive === "active") return t.isActive;
    if (filterActive === "inactive") return !t.isActive;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Users2 className="w-6 h-6 text-party-neonPink" />
            <span>Teams Management</span>
          </h2>
          <p className="text-xs text-gray-400">
            Configure participating performers, display order, artwork, and active status
          </p>
        </div>

        <Button
          size="md"
          variant="primary"
          onClick={openCreateModal}
          className="shadow-glow-pink text-xs"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add New Team</span>
        </Button>
      </div>

      {/* Filter and search bar */}
      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Input
            placeholder="Search teams by name, style..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 py-2 text-xs"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-gray-400 font-semibold mr-1">Status:</span>
          {(["all", "active", "inactive"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterActive(mode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filterActive === mode
                  ? "bg-party-neonPurple text-white"
                  : "bg-party-surface text-gray-400 hover:text-white"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </Card>

      {/* Teams Grid / Table */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-party-surface/40 animate-pulse border border-party-border/50"
            />
          ))}
        </div>
      ) : filteredTeams.length === 0 ? (
        <Card className="p-12 text-center">
          <Users2 className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Teams Found</h3>
          <p className="text-xs text-gray-400 mb-6">
            No teams match your filter criteria or roster is currently empty.
          </p>
          <Button size="sm" variant="outline" onClick={openCreateModal}>
            Add First Team
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <Card
              key={team._id}
              className="overflow-hidden flex flex-col justify-between border-party-border/70 hover:border-party-neonPurple/50 transition-all group"
            >
              <div>
                <div className="relative w-full h-44 bg-black">
                  {team.image ? (
                    <Image
                      src={team.image}
                      alt={team.name}
                      fill
                      sizes="400px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-party-neonPurple" />
                    </div>
                  )}

                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono font-bold text-party-neonCyan border border-party-border">
                    Order #{team.displayOrder}
                  </div>

                  <div className="absolute top-3 right-3">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        team.isActive
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-gray-500/20 text-gray-400 border-gray-500/40"
                      }`}
                    >
                      {team.isActive ? (
                        <>
                          <Check className="w-3 h-3 stroke-[3]" /> Active
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3" /> Inactive
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-lg font-black text-white group-hover:text-party-neonPink transition-colors">
                      {team.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs font-mono font-bold text-party-neonCyan bg-party-surface px-2 py-1 rounded border border-party-border">
                      <Vote className="w-3.5 h-3.5" />
                      <span>{team.voteCount || 0}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                    {team.description || "No description provided."}
                  </p>

                  {team.members && team.members.length > 0 && (
                    <div className="text-[11px] text-gray-500 truncate">
                      <span className="text-gray-400 font-semibold">Cast: </span>
                      {team.members.join(", ")}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-party-border/50 flex items-center justify-end gap-2 mt-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => openEditModal(team)}
                  className="text-xs px-3 py-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1 text-party-neonCyan" />
                  <span>Edit</span>
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => setDeletingTeam(team)}
                  className="text-xs px-3 py-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  <span>Delete</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Team Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTeam ? "Edit Team" : "Create New Team"}
        description="Provide performance details and artwork for this competing act."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveTeam} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs rounded-xl font-semibold">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Team / Act Name *"
              placeholder="e.g. Neon Pulse"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />

            <Input
              label="URL Slug (Optional)"
              placeholder="e.g. neon-pulse"
              value={formSlug}
              onChange={(e) => setFormSlug(e.target.value)}
            />
          </div>

          <Input
            label="Image URL *"
            placeholder="https://..."
            value={formImage}
            onChange={(e) => setFormImage(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              className="w-full px-4 py-3 bg-party-surface/80 border border-party-border/80 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-party-neonPurple focus:border-party-neonPink text-xs h-24"
              placeholder="Brief description of the performance or style..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </div>

          <Input
            label="Cast Members (comma separated)"
            placeholder="e.g. Maya Chen, Alex Rivera, Leo Vance"
            value={formMembers}
            onChange={(e) => setFormMembers(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <Input
              type="number"
              label="Display Order"
              value={formDisplayOrder}
              onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
            />

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="isActiveCheck"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-party-neonPurple focus:ring-party-neonPurple bg-party-surface border-party-border"
              />
              <label
                htmlFor="isActiveCheck"
                className="text-xs font-semibold text-white select-none cursor-pointer"
              >
                Team is Active & Eligible for Votes
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-party-border/60">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              className="shadow-glow"
            >
              {editingTeam ? "Update Team" : "Create Team"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete / Archive Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingTeam}
        title="Delete / Archive Team?"
        message={`Are you sure you want to remove "${deletingTeam?.name}"? If this team has recorded votes, it will be safely deactivated/archived to preserve vote integrity.`}
        confirmLabel="Confirm Delete / Archive"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteTeam}
        onCancel={() => setDeletingTeam(null)}
      />
    </div>
  );
}
