export type VotingStatus = "UPCOMING" | "OPEN" | "PAUSED" | "CLOSED";

export interface ITeam {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  members?: string[];
  isActive: boolean;
  displayOrder: number;
  voteCount?: number;
  percentage?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface IVoter {
  _id: string;
  codeHash: string;
  hasVoted: boolean;
  votedAt: string | Date | null;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface IVote {
  _id: string;
  voterId: string;
  teamId: string;
  createdAt: string | Date;
}

export interface IEventSettings {
  _id?: string;
  name: string;
  description: string;
  eventDate: string | Date | null;
  status: VotingStatus;
  votingOpen: boolean;
  votingPaused: boolean;
  votingClosed: boolean;
  showResults: boolean;
  showVoteCounts: boolean;
  showLeaderboard: boolean;
  updatedAt?: string | Date;
}

export interface IAdminUser {
  id: string;
  username: string;
  email?: string;
  role: "superadmin" | "admin";
}

export interface IAuditLog {
  _id: string;
  adminId: string;
  adminUsername: string;
  action: string;
  details: Record<string, unknown>;
  createdAt: string | Date;
}

export interface IAnalyticsOverview {
  totalVotes: number;
  totalVoters: number;
  usedVoters: number;
  remainingVoters: number;
  participationRate: number;
  teamCount: number;
  status: VotingStatus;
  peakInterval?: {
    interval: string;
    votes: number;
  } | null;
}

export interface ITeamLeaderboardEntry {
  rank: number;
  teamId: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  votes: number;
  voteShare: number;
  diffFromPrev: number;
}
