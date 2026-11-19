import { Vote } from "@/models/Vote";
import { Voter } from "@/models/Voter";
import { Team } from "@/models/Team";
import { EventModel } from "@/models/Event";
import { IAnalyticsOverview, ITeamLeaderboardEntry } from "@/types";

export async function getAnalyticsOverview(): Promise<IAnalyticsOverview> {
  const [totalVotes, totalVoters, usedVoters, teamCount, eventDoc] = await Promise.all([
    Vote.countDocuments(),
    Voter.countDocuments(),
    Voter.countDocuments({ hasVoted: true }),
    Team.countDocuments({ isActive: true }),
    EventModel.findOne().lean(),
  ]);

  const remainingVoters = Math.max(0, totalVoters - usedVoters);
  const participationRate = totalVoters > 0 ? Number(((usedVoters / totalVoters) * 100).toFixed(1)) : 0;

  // Find peak 5-minute interval
  const peakAgg = await Vote.aggregate([
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d %H:%M",
            date: {
              $toDate: {
                $subtract: [
                  { $toLong: "$createdAt" },
                  { $mod: [{ $toLong: "$createdAt" }, 1000 * 60 * 5] },
                ],
              },
            },
          },
        },
        votes: { $sum: 1 },
      },
    },
    { $sort: { votes: -1 } },
    { $limit: 1 },
  ]);

  const peakInterval =
    peakAgg.length > 0
      ? {
          interval: peakAgg[0]._id,
          votes: peakAgg[0].votes,
        }
      : null;

  return {
    totalVotes,
    totalVoters,
    usedVoters,
    remainingVoters,
    participationRate,
    teamCount,
    status: (eventDoc?.status as IAnalyticsOverview["status"]) || "OPEN",
    peakInterval,
  };
}

export async function getTeamsLeaderboard(): Promise<ITeamLeaderboardEntry[]> {
  const totalVotes = await Vote.countDocuments();

  const teamsWithVotes = await Team.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: "votes",
        localField: "_id",
        foreignField: "teamId",
        as: "teamVotes",
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        slug: 1,
        description: 1,
        image: 1,
        displayOrder: 1,
        votes: { $size: "$teamVotes" },
      },
    },
    { $sort: { votes: -1, displayOrder: 1, name: 1 } },
  ]);

  let prevVotes = 0;
  return teamsWithVotes.map((team, index) => {
    const rank = index + 1;
    const voteShare = totalVotes > 0 ? Number(((team.votes / totalVotes) * 100).toFixed(1)) : 0;
    const diffFromPrev = index === 0 ? 0 : prevVotes - team.votes;
    prevVotes = team.votes;

    return {
      rank,
      teamId: team._id.toString(),
      name: team.name,
      slug: team.slug,
      image: team.image,
      description: team.description,
      votes: team.votes,
      voteShare,
      diffFromPrev,
    };
  });
}

export async function getVotingActivityTimeline(): Promise<
  Array<{ time: string; votes: number; cumulative: number }>
> {
  const buckets = await Vote.aggregate([
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%H:%M",
            date: {
              $toDate: {
                $subtract: [
                  { $toLong: "$createdAt" },
                  { $mod: [{ $toLong: "$createdAt" }, 1000 * 60 * 2] }, // 2-min intervals for fine granularity
                ],
              },
            },
          },
        },
        votes: { $sum: 1 },
        timestamp: {
          $min: {
            $subtract: [
              { $toLong: "$createdAt" },
              { $mod: [{ $toLong: "$createdAt" }, 1000 * 60 * 2] },
            ],
          },
        },
      },
    },
    { $sort: { timestamp: 1 } },
  ]);

  let cumulative = 0;
  return buckets.map((bucket) => {
    cumulative += bucket.votes;
    return {
      time: bucket._id,
      votes: bucket.votes,
      cumulative,
    };
  });
}

export async function getVoteDistribution(): Promise<
  Array<{ name: string; votes: number; percentage: number; color?: string }>
> {
  const totalVotes = await Vote.countDocuments();
  const palette = ["#FF2E93", "#9333EA", "#00F0FF", "#7B2CBF", "#F59E0B", "#10B981", "#EC4899", "#6366F1"];

  const distribution = await Team.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: "votes",
        localField: "_id",
        foreignField: "teamId",
        as: "teamVotes",
      },
    },
    {
      $project: {
        name: 1,
        votes: { $size: "$teamVotes" },
      },
    },
    { $sort: { votes: -1 } },
  ]);

  return distribution.map((item, index) => {
    const percentage = totalVotes > 0 ? Number(((item.votes / totalVotes) * 100).toFixed(1)) : 0;
    return {
      name: item.name,
      votes: item.votes,
      percentage,
      color: palette[index % palette.length],
    };
  });
}
