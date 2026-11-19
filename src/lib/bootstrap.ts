import { connectToDatabase } from "@/lib/mongodb";
import { EventModel } from "@/models/Event";
import { Admin } from "@/models/Admin";
import { Team } from "@/models/Team";
import { hashPassword } from "@/lib/auth";

export async function ensureInitialData() {
  await connectToDatabase();

  // 1. Ensure Event
  let eventDoc = await EventModel.findOne();
  if (!eventDoc) {
    try {
      eventDoc = await EventModel.create({
        name: "BVTalent Cartoon Party!",
        description: "Watch the performances. Pick your champions. Change your mind. It's party time!",
        status: "open",
        resultsVisible: false,
        winnerTeamId: null,
      });
    } catch {
      eventDoc = await EventModel.findOne();
    }
  }

  // 2. Ensure Admin User
  const adminUsername = (process.env.ADMIN_USERNAME || "admin").toLowerCase();
  const existingAdmin = await Admin.findOne({ username: adminUsername });
  if (!existingAdmin) {
    const rawPass = process.env.INITIAL_ADMIN_PASSWORD || "AdminTalent2026!";
    const passwordHash = await hashPassword(rawPass);
    try {
      await Admin.create({
        username: adminUsername,
        passwordHash,
      });
    } catch {
      // Ignore concurrent race insert
    }
  }

  // 3. Ensure Showcase Cartoon Teams
  const teamCount = await Team.countDocuments();
  if (teamCount === 0) {
    const initialTeams = [
      {
        name: "Team Neon Cats",
        description: "Electro-funk dance crew with glowing whiskers and laser-fast choreography!",
        image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80",
        color: "pink",
      },
      {
        name: "Bubblegum Beats",
        description: "A cappella pop harmonizers dropping sweet candy vocals and human beatboxing!",
        image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&auto=format&fit=crop&q=80",
        color: "yellow",
      },
      {
        name: "Cosmic Acrobats",
        description: "Gravity-defying aerial flips, human pyramids, and cartoon-level agility stunts!",
        image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80",
        color: "cyan",
      },
      {
        name: "Disco Dragons",
        description: "Hot brass horns, funky slap bass, and fiery disco energy that shakes the floor!",
        image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80",
        color: "orange",
      },
      {
        name: "Funky Monks",
        description: "Old school hip-hop breakdancers spinning on their heads with comedic flair!",
        image: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&auto=format&fit=crop&q=80",
        color: "lime",
      },
    ];

    try {
      await Team.insertMany(initialTeams, { ordered: false });
    } catch {
      // Ignore concurrent race insert
    }
  }

  return { event: eventDoc };
}
