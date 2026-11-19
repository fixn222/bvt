import { describe, it, expect } from "vitest";
import { VotingStatus } from "../types";

describe("Party Voting Engine and Integrity Tests", () => {
  interface SimulatedDeviceVote {
    deviceIdHash: string;
    currentTeamId: string;
    updatedAt: Date;
  }

  interface SimulatedTeam {
    id: string;
    name: string;
  }

  // Simulated voting engine that replicates MongoDB atomic upsert logic
  class VotingEngine {
    private votes = new Map<string, SimulatedDeviceVote>();
    public status: VotingStatus = "open";
    public resultsVisible: boolean = false;
    public teams: SimulatedTeam[] = [
      { id: "team-a", name: "Team Alpha" },
      { id: "team-b", name: "Team Bravo" },
      { id: "team-c", name: "Team Charlie" },
      { id: "team-d", name: "Team Delta" },
    ];

    public castVote(deviceIdHash: string, teamId: string): { success: boolean; error?: string } {
      if (this.status === "upcoming") {
        return { success: false, error: "Voting is upcoming. Not open yet." };
      }
      if (this.status === "closed") {
        return { success: false, error: "Voting is closed. Votes are locked." };
      }

      const teamExists = this.teams.some((t) => t.id === teamId);
      if (!teamExists) {
        return { success: false, error: "Selected team does not exist." };
      }

      // Upsert: exactly 1 entry per deviceIdHash
      this.votes.set(deviceIdHash, {
        deviceIdHash,
        currentTeamId: teamId,
        updatedAt: new Date(),
      });

      return { success: true };
    }

    public getDeviceSelection(deviceIdHash: string) {
      const vote = this.votes.get(deviceIdHash);
      if (!vote) return { hasVoted: false, currentTeamId: null };
      return { hasVoted: true, currentTeamId: vote.currentTeamId };
    }

    public getResults() {
      const totalDevices = this.votes.size;
      const countMap = new Map<string, number>();

      for (const t of this.teams) {
        countMap.set(t.id, 0);
      }

      for (const vote of this.votes.values()) {
        const curr = countMap.get(vote.currentTeamId) || 0;
        countMap.set(vote.currentTeamId, curr + 1);
      }

      const teamResults = this.teams.map((t) => {
        const votes = countMap.get(t.id) || 0;
        const percentage = totalDevices > 0 ? Number(((votes / totalDevices) * 100).toFixed(1)) : 0;
        return {
          teamId: t.id,
          name: t.name,
          votes,
          percentage,
        };
      });

      teamResults.sort((a, b) => b.votes - a.votes);

      let winners: typeof teamResults = [];
      let isTie = false;

      if (totalDevices > 0 && teamResults[0].votes > 0) {
        const topVotes = teamResults[0].votes;
        winners = teamResults.filter((t) => t.votes === topVotes);
        isTie = winners.length > 1;
      }

      return {
        totalDevices,
        teams: teamResults,
        winners,
        isTie,
      };
    }
  }

  it("should record a new vote for a new device", () => {
    const engine = new VotingEngine();
    const res = engine.castVote("hash-device-1", "team-a");

    expect(res.success).toBe(true);
    const selection = engine.getDeviceSelection("hash-device-1");
    expect(selection.hasVoted).toBe(true);
    expect(selection.currentTeamId).toBe("team-a");

    const results = engine.getResults();
    expect(results.totalDevices).toBe(1);
    expect(results.teams.find((t) => t.teamId === "team-a")?.votes).toBe(1);
  });

  it("should update existing vote when the same device changes team without increasing total voter count", () => {
    const engine = new VotingEngine();

    // 1. Initial vote for Alpha
    engine.castVote("hash-device-1", "team-a");
    expect(engine.getResults().totalDevices).toBe(1);
    expect(engine.getResults().teams.find((t) => t.teamId === "team-a")?.votes).toBe(1);

    // 2. Switch to Bravo
    const res2 = engine.castVote("hash-device-1", "team-b");
    expect(res2.success).toBe(true);
    expect(engine.getResults().totalDevices).toBe(1); // STILL 1 voter!
    expect(engine.getResults().teams.find((t) => t.teamId === "team-a")?.votes).toBe(0);
    expect(engine.getResults().teams.find((t) => t.teamId === "team-b")?.votes).toBe(1);

    // 3. Switch to Charlie
    const res3 = engine.castVote("hash-device-1", "team-c");
    expect(res3.success).toBe(true);
    expect(engine.getResults().totalDevices).toBe(1); // STILL 1 voter!
    expect(engine.getResults().teams.find((t) => t.teamId === "team-b")?.votes).toBe(0);
    expect(engine.getResults().teams.find((t) => t.teamId === "team-c")?.votes).toBe(1);

    // Verify latest selection stored
    const selection = engine.getDeviceSelection("hash-device-1");
    expect(selection.currentTeamId).toBe("team-c");
  });

  it("should allow another device to vote independently", () => {
    const engine = new VotingEngine();
    engine.castVote("hash-device-1", "team-a");
    engine.castVote("hash-device-2", "team-b");

    const results = engine.getResults();
    expect(results.totalDevices).toBe(2);
    expect(results.teams.find((t) => t.teamId === "team-a")?.votes).toBe(1);
    expect(results.teams.find((t) => t.teamId === "team-b")?.votes).toBe(1);
  });

  it("should reject voting when status is upcoming", () => {
    const engine = new VotingEngine();
    engine.status = "upcoming";

    const res = engine.castVote("hash-device-1", "team-a");
    expect(res.success).toBe(false);
    expect(res.error).toContain("upcoming");
    expect(engine.getResults().totalDevices).toBe(0);
  });

  it("should reject voting and vote changes when status is closed", () => {
    const engine = new VotingEngine();
    // Vote while open
    engine.castVote("hash-device-1", "team-a");

    // Close voting
    engine.status = "closed";

    // Attempt to change vote
    const res = engine.castVote("hash-device-1", "team-b");
    expect(res.success).toBe(false);
    expect(res.error).toContain("closed");

    // Attempt to cast new vote
    const resNew = engine.castVote("hash-device-new", "team-c");
    expect(resNew.success).toBe(false);
    expect(resNew.error).toContain("closed");

    // Results remain locked on original selection
    expect(engine.getResults().teams.find((t) => t.teamId === "team-a")?.votes).toBe(1);
  });

  it("should reject invalid team ID", () => {
    const engine = new VotingEngine();
    const res = engine.castVote("hash-device-1", "non-existent-team");
    expect(res.success).toBe(false);
    expect(res.error).toContain("does not exist");
  });

  it("should correctly handle ties without arbitrarily picking a single winner", () => {
    const engine = new VotingEngine();
    // Device 1 & 2 vote for Alpha (2 votes)
    engine.castVote("hash-device-1", "team-a");
    engine.castVote("hash-device-2", "team-a");

    // Device 3 & 4 vote for Bravo (2 votes)
    engine.castVote("hash-device-3", "team-b");
    engine.castVote("hash-device-4", "team-b");

    const results = engine.getResults();
    expect(results.totalDevices).toBe(4);
    expect(results.isTie).toBe(true);
    expect(results.winners).toHaveLength(2);
    expect(results.winners.map((w) => w.teamId)).toEqual(expect.arrayContaining(["team-a", "team-b"]));
  });

  it("should compute accurate percentages for vote distribution", () => {
    const engine = new VotingEngine();
    // 3 votes for Alpha (60%), 2 votes for Bravo (40%)
    engine.castVote("d1", "team-a");
    engine.castVote("d2", "team-a");
    engine.castVote("d3", "team-a");
    engine.castVote("d4", "team-b");
    engine.castVote("d5", "team-b");

    const results = engine.getResults();
    expect(results.totalDevices).toBe(5);
    const alpha = results.teams.find((t) => t.teamId === "team-a");
    const bravo = results.teams.find((t) => t.teamId === "team-b");

    expect(alpha?.percentage).toBe(60.0);
    expect(bravo?.percentage).toBe(40.0);
    expect(results.isTie).toBe(false);
    expect(results.winners[0].teamId).toBe("team-a");
  });
});
