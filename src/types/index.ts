export type VotingStatus = "upcoming" | "open" | "closed";

export interface ITeam {
  _id: string;
  name: string;
  description: string;
  image: string;
  color?: string;
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
}

export interface IResultsData {
  status: VotingStatus;
  resultsVisible: boolean;
  totalDevices: number;
  teams: ITeamResult[];
  winners: ITeamResult[];
  isTie: boolean;
}
