"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Settings,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { IAuditLog } from "@/types";

export default function AdminSettingsPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [showResults, setShowResults] = useState(true);
  const [showVoteCounts, setShowVoteCounts] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(true);

  const [auditLogs, setAuditLogs] = useState<IAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.event) {
        setName(data.event.name || "");
        setDescription(data.event.description || "");
        if (data.event.eventDate) {
          const d = new Date(data.event.eventDate);
          setEventDate(d.toISOString().slice(0, 16));
        }
        setShowResults(data.event.showResults ?? true);
        setShowVoteCounts(data.event.showVoteCounts ?? true);
        setShowLeaderboard(data.event.showLeaderboard ?? true);
      }
      if (data.auditLogs) {
        setAuditLogs(data.auditLogs);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      setIsSaving(true);
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          eventDate: eventDate ? new Date(eventDate).toISOString() : null,
          showResults,
          showVoteCounts,
          showLeaderboard,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to save settings");
        return;
      }

      setSuccessMessage("Event settings updated successfully!");
      fetchSettings();
    } catch (err) {
      console.error("Save settings error:", err);
      setErrorMessage("Network error while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-party-neonCyan" />
          <span>Event Settings & Audit Log</span>
        </h2>
        <p className="text-xs text-gray-400">
          Configure branding, countdown dates, visibility permissions, and review security audits
        </p>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Configuration Form */}
      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Event Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. BVTalent Show 2026"
              required
            />

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Event Start Date / Countdown
              </label>
              <input
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-4 py-3 bg-party-surface/80 border border-party-border/80 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-party-neonPurple focus:border-party-neonPink text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Event Tagline & Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-party-surface/80 border border-party-border/80 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-party-neonPurple focus:border-party-neonPink text-xs"
              placeholder="Event slogan and description displayed in the hero..."
            />
          </div>

          {/* Visibility Checkboxes */}
          <div className="p-5 rounded-2xl bg-party-surface/50 border border-party-border space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Public Display & Visibility Controls
            </h4>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showResults}
                  onChange={(e) => setShowResults(e.target.checked)}
                  className="w-4 h-4 rounded text-party-neonPurple focus:ring-party-neonPurple bg-party-surface border-party-border"
                />
                <div>
                  <span className="text-xs font-bold text-white block">
                    Enable Public Results Page
                  </span>
                  <span className="text-[11px] text-gray-400">
                    When disabled, audience sees a &quot;Results Hidden by Organizers&quot; banner.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showVoteCounts}
                  onChange={(e) => setShowVoteCounts(e.target.checked)}
                  className="w-4 h-4 rounded text-party-neonPurple focus:ring-party-neonPurple bg-party-surface border-party-border"
                />
                <div>
                  <span className="text-xs font-bold text-white block">
                    Show Numerical Vote Totals
                  </span>
                  <span className="text-[11px] text-gray-400">
                    When disabled, public display only reveals percentage share to build suspense.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLeaderboard}
                  onChange={(e) => setShowLeaderboard(e.target.checked)}
                  className="w-4 h-4 rounded text-party-neonPurple focus:ring-party-neonPurple bg-party-surface border-party-border"
                />
                <div>
                  <span className="text-xs font-bold text-white block">
                    Show Ordered Rank Badges (#1, #2, #3)
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Displays gold, silver, and bronze podium badges for the leading acts.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSaving}
              className="shadow-glow px-8"
            >
              <Save className="w-4 h-4 mr-2" />
              <span>Save Configuration</span>
            </Button>
          </div>
        </form>
      </Card>

      {/* Audit Log Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-party-neonPink" />
              <span>Administrative Audit Trail</span>
            </h3>
            <p className="text-xs text-gray-400">
              Immutable record of voting state transitions and administrative actions
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-party-surface/80 border-b border-party-border text-gray-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Organizer</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-party-border/50 text-gray-300">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    No administrative audit actions recorded yet.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-party-surface/30">
                    <td className="px-4 py-3 font-mono text-gray-400">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">
                      {log.adminUsername}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-party-neonCyan font-bold bg-party-surface px-2 py-0.5 rounded border border-party-border">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-400 text-[11px] truncate max-w-xs">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
