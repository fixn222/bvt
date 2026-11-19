import { connectToDatabase } from "@/lib/mongodb";
import { DeviceVote } from "@/models/DeviceVote";
import { Team } from "@/models/Team";
import { EventModel } from "@/models/Event";
import { IResultsData, ITeamResult, VotingStatus } from "@/types";

export async function calculateLiveResults(): Promise<IResultsData> {
  await connectToDatabase();

  const [eventDoc, allTeams, voteCountsByTeam] = await Promise.all([
    EventModel.findOne().lean(),
    Team.find().lean(),
    DeviceVote.aggregate([
      {
        $group: {
          _id: "$currentTeamId",
          votes: { $sum: 1 },
        },
      },
    ]),
  ]);

  const status: VotingStatus = (eventDoc?.status as VotingStatus) || "open";
  const resultsVisible = !!eventDoc?.resultsVisible;

  // Build a map of teamId -> vote count
  const votesMap = new Map<string, number>();
  for (const item of voteCountsByTeam) {
    if (item._id) {
      votesMap.set(item._id.toString(), item.votes);
    }
  }

  // Calculate total valid votes for registered teams
  let totalDevices = 0;
  for (const team of allTeams) {
    totalDevices += votesMap.get(team._id.toString()) || 0;
  }

  // Format team results
  const teamResults: ITeamResult[] = allTeams.map((team) => {
    const votes = votesMap.get(team._id.toString()) || 0;
    const percentage =
      totalDevices > 0 ? Number(((votes / totalDevices) * 100).toFixed(1)) : 0;

    return {
      teamId: team._id.toString(),
      name: team.name,
      description: team.description,
      image: team.image,
      color: team.color || "yellow",
      votes,
      percentage,
      isWinner: false,
    };
  });

  // Sort teams descending by votes, then by name
  teamResults.sort((a, b) => b.votes - a.votes || a.name.localeCompare(b.name));

  // Determine winner(s) and tie
  let winners: ITeamResult[] = [];
  let isTie = false;

  if (totalDevices > 0 && teamResults.length > 0) {
    const highestVotes = teamResults[0].votes;
    if (highestVotes > 0) {
      winners = teamResults.filter((t) => t.votes === highestVotes);
      if (winners.length > 1) {
        isTie = true;
      }
      for (const w of winners) {
        w.isWinner = true;
      }
    }
  }

  return {
    status,
    resultsVisible,
    totalDevices,
    teams: teamResults,
    winners,
    isTie,
  };
}
