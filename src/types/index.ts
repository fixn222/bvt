export type VotingStatus = "upcoming" | "open" | "closed";

export interface ITeam {
  _id: string;
  name: string;
  description: string;
  image: string;
  color?: string;
  hasPerformed?: boolean;
  isPerforming?: boolean;
  performanceOrder?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IDeviceVote {
  _id: string;
  deviceIdHash: string;
  currentTeamId: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IEventSettings {
  _id?: string;
  name: string;
  description: string;
  status: VotingStatus;
  resultsVisible: boolean;
  winnerTeamId?: string | null;
  currentPerformingTeamId?: string | null;
  currentPerformingTeam?: ITeam | null;
  lockUnperformedTeams?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IAdminUser {
  id: string;
  username: string;
  role: "admin";
}

export interface ITeamResult {
  teamId: string;
  name: string;
  description: string;
  image: string;
  color: string;
  votes: number;
  percentage: number;
  isWinner: boolean;
  hasPerformed?: boolean;
  isPerforming?: boolean;
}

export interface IResultsData {
  status: VotingStatus;
  resultsVisible: boolean;
  totalDevices: number;
  teams: ITeamResult[];
  winners: ITeamResult[];
  isTie: boolean;
  currentPerformingTeamId?: string | null;
}
