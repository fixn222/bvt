"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import {
  Ticket,
  Plus,
  Download,
  Copy,
  Check,
  Power,
  RefreshCw,
  AlertCircle,
  FileText,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface VoterPass {
  _id: string;
  hasVoted: boolean;
  votedAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function AdminVotersPage() {
  const [voters, setVoters] = useState<VoterPass[]>([]);
  const [filter, setFilter] = useState<"all" | "unused" | "used" | "disabled">("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Pass Generation State
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [generateCount, setGenerateCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Newly generated codes modal
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [isCodeDisplayOpen, setIsCodeDisplayOpen] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const fetchVoters = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/admin/voters?page=${page}&limit=25&filter=${filter}`);
      const data = await res.json();
      if (data.voters) {
        setVoters(data.voters);
        setTotalPages(data.pagination.totalPages || 1);
        setTotalCount(data.pagination.total || 0);
      }
    } catch (err) {
      console.error("Failed to load voters:", err);
    } finally {
      setIsLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchVoters();
  }, [fetchVoters]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerateError(null);

    if (generateCount < 1 || generateCount > 1000) {
      setGenerateError("Please enter a count between 1 and 1000.");
      return;
    }

    try {
      setIsGenerating(true);
      const res = await fetch("/api/admin/voters/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: Number(generateCount) }),
      });

      const data = await res.json();
      if (!res.ok) {
        setGenerateError(data.error || "Failed to generate passes");
        return;
      }

      setIsGenerateOpen(false);
      setGeneratedCodes(data.codes || []);
      setIsCodeDisplayOpen(true);
      fetchVoters();
    } catch (err) {
      console.error("Generate error:", err);
      setGenerateError("Network error. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/voters/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (res.ok) {
        setVoters((prev) =>
          prev.map((v) => (v._id === id ? { ...v, isActive: !currentActive } : v))
        );
      }
    } catch (err) {
      console.error("Toggle pass error:", err);
    }
  };

  const handleExportCSV = () => {
    window.open("/api/admin/voters/export", "_blank");
  };

  const handleCopyCodes = () => {
    navigator.clipboard.writeText(generatedCodes.join("\n"));
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleDownloadTXT = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedCodes.join("\n")], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `bvtalent-passes-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Ticket className="w-6 h-6 text-party-neonPurple" />
            <span>Voter Pass Management</span>
          </h2>
          <p className="text-xs text-gray-400">
            Generate cryptographically secure voting pass codes for eligible audience members
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCSV}
            className="text-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            <span>Export CSV</span>
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              setGenerateCount(10);
              setGenerateError(null);
              setIsGenerateOpen(true);
            }}
            className="shadow-glow text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Generate Passes</span>
          </Button>
        </div>
      </div>

      {/* Filter and stats bar */}
      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-semibold mr-1">Filter:</span>
          {(["all", "unused", "used", "disabled"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setFilter(mode);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filter === mode
                  ? "bg-party-neonPurple text-white"
                  : "bg-party-surface text-gray-400 hover:text-white"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        <div className="text-xs text-gray-400 font-mono">
          Total in view: <strong className="text-white">{totalCount}</strong> passes
        </div>
      </Card>

      {/* Passes Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-party-surface/80 border-b border-party-border text-gray-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Pass Identifier</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Voted Date</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-party-border/50 text-gray-300">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-party-neonPurple" />
                    <span>Loading voting passes...</span>
                  </td>
                </tr>
              ) : voters.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    No voter passes found in this view.
                  </td>
                </tr>
              ) : (
                voters.map((voter) => (
                  <tr
                    key={voter._id}
                    className="hover:bg-party-surface/40 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-mono text-gray-300">
                      {voter._id}
                    </td>
                    <td className="px-5 py-3.5">
                      {!voter.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          Disabled
                        </span>
                      ) : voter.hasVoted ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                          <Check className="w-3 h-3 stroke-[3]" /> Redeemed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Ready / Unused
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 font-mono">
                      {formatDateTime(voter.votedAt)}
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 font-mono">
                      {formatDateTime(voter.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        size="sm"
                        variant={voter.isActive ? "ghost" : "cyan"}
                        onClick={() => handleToggleActive(voter._id, voter.isActive)}
                        className="text-[11px] px-2.5 py-1"
                        title={voter.isActive ? "Disable this pass" : "Enable this pass"}
                      >
                        <Power className="w-3 h-3 mr-1" />
                        <span>{voter.isActive ? "Disable" : "Enable"}</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-party-border/60 flex items-center justify-between text-xs text-gray-400">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Generate Passes Modal */}
      <Modal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        title="Generate Voting Passes"
        description="Passes are cryptographically random and stored securely as hashes."
        maxWidth="sm"
      >
        <form onSubmit={handleGenerate} className="space-y-4">
          {generateError && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{generateError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Quantity of Passes to Generate
            </label>
            <Input
              type="number"
              min={1}
              max={1000}
              value={generateCount}
              onChange={(e) => setGenerateCount(Number(e.target.value))}
              required
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Supports single or bulk generation up to 1,000 passes at once.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-party-border/60">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsGenerateOpen(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isGenerating}
              className="shadow-glow"
            >
              Generate Now
            </Button>
          </div>
        </form>
      </Modal>

      {/* Generated Codes Modal (Display plaintext codes once for distribution) */}
      <Modal
        isOpen={isCodeDisplayOpen}
        onClose={() => setIsCodeDisplayOpen(false)}
        title="Passes Generated Successfully!"
        description="Important: Plaintext codes are only displayed once. Please copy or download them now."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-party-surface border border-party-border max-h-56 overflow-y-auto font-mono text-xs text-party-neonCyan divide-y divide-white/5">
            {generatedCodes.map((c, i) => (
              <div key={i} className="py-1">
                {c}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <span className="text-xs text-gray-400">
              Total generated: <strong className="text-white">{generatedCodes.length}</strong>
            </span>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyCodes}
                className="text-xs"
              >
                {hasCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    <span>Copy All</span>
                  </>
                )}
              </Button>

              <Button
                size="sm"
                variant="cyan"
                onClick={handleDownloadTXT}
                className="text-xs"
              >
                <FileText className="w-3.5 h-3.5 mr-1" />
                <span>Download .TXT</span>
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
