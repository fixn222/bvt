"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import {
  Users2,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  AlertCircle,
  Mic2,
  CheckCircle2,
  Clock,
  Radio,
} from "lucide-react";
import { ITeam } from "@/types";

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<Array<ITeam & { voteCount?: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<ITeam | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [color, setColor] = useState("yellow");
  const [performanceOrder, setPerformanceOrder] = useState<number>(1);
  const [hasPerformed, setHasPerformed] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirm State
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
      console.error("Failed to fetch teams:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const openCreateModal = () => {
    setEditingTeam(null);
    setName("");
    setDescription("");
    setImage("https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80");
    setColor("yellow");
    setPerformanceOrder(teams.length + 1);
    setHasPerformed(false);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (team: ITeam) => {
    setEditingTeam(team);
    setName(team.name);
    setDescription(team.description || "");
    setImage(team.image);
    setColor(team.color || "yellow");
    setPerformanceOrder(team.performanceOrder ?? 0);
    setHasPerformed(!!team.hasPerformed);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError("Please enter a team name!");
      return;
    }

    if (!image.trim()) {
      setFormError("Please enter an image URL!");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: name.trim(),
        description: description.trim(),
        image: image.trim(),
        color,
        performanceOrder: Number(performanceOrder) || 0,
        hasPerformed: Boolean(hasPerformed),
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
      setFormError("Network error. Try again!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePerformed = async (team: ITeam) => {
    try {
      const res = await fetch(`/api/admin/teams/${team._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hasPerformed: !team.hasPerformed }),
      });
      if (res.ok) fetchTeams();
    } catch (err) {
      console.error("Toggle performed error:", err);
    }
  };

  const handleToggleStage = async (team: ITeam) => {
    try {
      const nextId = team.isPerforming ? null : team._id;
      const res = await fetch("/api/admin/event/performing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: nextId }),
      });
      if (res.ok) fetchTeams();
    } catch (err) {
      console.error("Toggle stage error:", err);
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

  const colorOptions = [
    { label: "Yellow", value: "yellow", bg: "bg-party-yellow text-black" },
    { label: "Pink", value: "pink", bg: "bg-party-pink text-white" },
    { label: "Cyan", value: "cyan", bg: "bg-party-cyan text-black" },
    { label: "Lime", value: "lime", bg: "bg-party-lime text-black" },
    { label: "Orange", value: "orange", bg: "bg-party-orange text-white" },
    { label: "Purple", value: "purple", bg: "bg-party-purple text-white" },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white font-cartoon uppercase flex items-center gap-2">
            <Users2 className="w-7 h-7 text-party-yellow" />
            <span>TEAMS ROSTER</span>
          </h1>
          <p className="text-xs text-gray-300 font-bold mt-1">
            Add performing acts, manage performance order, set live stage performers, and update themes
          </p>
        </div>

        <Button
          size="md"
          variant="yellow"
          onClick={openCreateModal}
          className="text-xs font-black shadow-cartoon"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add New Performer</span>
        </Button>
      </div>

      {/* Teams Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-3xl bg-party-card border-3 border-black shadow-cartoon animate-pulse"
            />
          ))}
        </div>
      ) : teams.length === 0 ? (
        <div className="text-center py-16 bg-party-card border-3 border-black rounded-3xl shadow-cartoon max-w-lg mx-auto">
          <Sparkles className="w-12 h-12 text-party-yellow mx-auto mb-3" />
          <h3 className="text-xl font-black text-white font-cartoon">
            No Teams on Roster!
          </h3>
          <p className="text-xs text-gray-400 mt-1 mb-6">
            Get the talent show started by creating your first performing act!
          </p>
          <Button size="sm" variant="yellow" onClick={openCreateModal}>
            Add First Team
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div
              key={team._id}
              className={`bg-party-card border-3 rounded-3xl shadow-cartoon overflow-hidden flex flex-col justify-between transition-all ${
                team.isPerforming
                  ? "border-party-cyan ring-4 ring-party-cyan/50 shadow-cartoon-cyan"
                  : "border-black"
              }`}
            >
              <div>
                <div className="relative w-full h-44 bg-party-bg border-b-3 border-black">
                  {team.image ? (
                    <Image
                      src={team.image}
                      alt={team.name}
                      fill
                      sizes="350px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-party-yellow" />
                    </div>
                  )}

                  {/* Top-left Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                    <span className="bg-black/85 text-white font-black text-[10px] px-2.5 py-1 rounded-full border border-white/30 backdrop-blur-sm">
                      Act #{team.performanceOrder ?? 1}
                    </span>

                    {team.isPerforming ? (
                      <span className="bg-party-cyan text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-full border-2 border-black shadow-cartoon-sm flex items-center gap-1 animate-bounce-subtle">
                        <Radio className="w-3 h-3 text-party-pink animate-pulse" /> LIVE ON STAGE
                      </span>
                    ) : team.hasPerformed ? (
                      <span className="bg-party-lime text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full border-2 border-black flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Performed
                      </span>
                    ) : (
                      <span className="bg-slate-800 text-gray-300 font-black text-[10px] px-2 py-0.5 rounded-full border border-slate-600 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-party-yellow" /> Upcoming
                      </span>
                    )}
                  </div>

                  {/* Top-right Votes Badge */}
                  <div className="absolute top-3 right-3 bg-party-yellow text-slate-950 font-black text-xs px-3 py-1 rounded-full border-2 border-black shadow-cartoon-sm">
                    {team.voteCount || 0} Votes
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-black text-white font-cartoon mb-1.5">
                    {team.name}
                  </h3>
                  <p className="text-xs text-gray-300 font-medium line-clamp-2">
                    {team.description || "No description provided."}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 border-t-2 border-party-border flex flex-col gap-2 mt-2">
                {/* Stage Performance Controls */}
                <div className="flex items-center gap-2 pt-3">
                  <Button
                    size="sm"
                    variant={team.isPerforming ? "pink" : "yellow"}
                    onClick={() => handleToggleStage(team)}
                    className="flex-1 text-[11px] font-black py-1.5"
                  >
                    <Mic2 className="w-3.5 h-3.5 mr-1" />
                    <span>{team.isPerforming ? "End Stage Act" : "Put on Stage 🎤"}</span>
                  </Button>

                  <Button
                    size="sm"
                    variant={team.hasPerformed ? "ghost" : "cyan"}
                    onClick={() => handleTogglePerformed(team)}
                    className="text-[11px] font-black py-1.5"
                    title={team.hasPerformed ? "Mark as upcoming" : "Mark as performed"}
                  >
                    {team.hasPerformed ? "Mark Upcoming" : "Mark Performed ✅"}
                  </Button>
                </div>

                {/* Edit & Delete */}
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-party-border/50">
                  <Button
                    size="sm"
                    variant="cyan"
                    onClick={() => openEditModal(team)}
                    className="text-xs px-3 py-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1" />
                    <span>Edit</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="pink"
                    onClick={() => setDeletingTeam(team)}
                    className="text-xs px-3 py-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    <span>Delete</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTeam ? "Edit Performer Act" : "Add New Performer Act"}
        description="Enter the team details and image to display on the voting board."
        maxWidth="md"
      >
        <form onSubmit={handleSaveTeam} className="space-y-4">
          {formError && (
            <div className="p-3 bg-party-pink text-white rounded-2xl border-2 border-black text-xs font-black flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-party-yellow uppercase tracking-wider mb-1.5">
              Team / Act Name *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Disco Dragons"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black text-party-yellow uppercase tracking-wider mb-1.5">
              Image URL *
            </label>
            <Input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-party-yellow uppercase tracking-wider mb-1.5">
                Performance Order (#)
              </label>
              <Input
                type="number"
                min="1"
                max="99"
                value={performanceOrder}
                onChange={(e) => setPerformanceOrder(parseInt(e.target.value) || 1)}
                placeholder="1"
                required
              />
            </div>

            <div className="flex flex-col justify-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer bg-party-surface p-2.5 rounded-2xl border-2 border-black">
                <input
                  type="checkbox"
                  checked={hasPerformed}
                  onChange={(e) => setHasPerformed(e.target.checked)}
                  className="w-4 h-4 rounded text-party-yellow focus:ring-party-yellow cursor-pointer"
                />
                <span className="text-xs font-black text-white">Has Performed</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-party-yellow uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              className="w-full px-4 py-3 bg-party-surface border-2 border-black rounded-2xl text-white placeholder-gray-500 text-xs h-20 focus:outline-none focus:ring-2 focus:ring-party-yellow"
              placeholder="Fun description of their performance..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-black text-party-yellow uppercase tracking-wider mb-2">
              Card Theme Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setColor(opt.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black border-2 border-black transition-all ${
                    opt.bg
                  } ${
                    color === opt.value
                      ? "ring-4 ring-white shadow-cartoon-sm scale-105"
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-party-border">
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
              variant="yellow"
              isLoading={isSubmitting}
              className="shadow-cartoon"
            >
              {editingTeam ? "Save Changes" : "Create Team"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingTeam}
        onClose={() => setDeletingTeam(null)}
        title="Delete Performer Act?"
        description={`Are you sure you want to delete "${deletingTeam?.name}"? Any active votes backing this team will be removed.`}
        maxWidth="sm"
      >
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            variant="ghost"
            onClick={() => setDeletingTeam(null)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="pink"
            onClick={handleDeleteTeam}
            isLoading={isDeleting}
            className="shadow-cartoon"
          >
            Yes, Delete Team
          </Button>
        </div>
      </Modal>
    </div>
  );
}
