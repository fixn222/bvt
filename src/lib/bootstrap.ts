import { connectToDatabase } from "@/models/../lib/mongodb";
import { EventModel } from "@/models/Event";
import { Admin } from "@/models/Admin";
import { Team } from "@/models/Team";
import { hashPassword } from "@/lib/auth";

export async function ensureInitialData() {
  await connectToDatabase();

  // 1. Ensure Event
  let eventDoc = await EventModel.findOne();
  if (!eventDoc) {
    eventDoc = await EventModel.create({
      name: "BVTalent Show 2026",
      description: "One Stage. One Moment. The Crowd Decides. Vote for your favorite performance!",
      status: "OPEN",
      votingOpen: true,
      votingPaused: false,
      votingClosed: false,
      showResults: true,
      showVoteCounts: true,
      showLeaderboard: true,
    });
  }

  // 2. Ensure Admin User
  const adminUsername = (process.env.INITIAL_ADMIN_USERNAME || "admin").toLowerCase();
  const existingAdmin = await Admin.findOne({ username: adminUsername });
  if (!existingAdmin) {
    const rawPass = process.env.INITIAL_ADMIN_PASSWORD || "AdminTalent2026!";
    const passwordHash = await hashPassword(rawPass);
    await Admin.create({
      username: adminUsername,
      passwordHash,
      email: "admin@bvtalent.local",
      role: "superadmin",
    });
  }

  // 3. Ensure Initial Showcase Teams if empty
  const teamCount = await Team.countDocuments();
  if (teamCount === 0) {
    const initialTeams = [
      {
        name: "Neon Pulse",
        slug: "neon-pulse",
        description: "Cyberpunk synthwave electronic dancers blending precision robotics and hyper-light choreography.",
        image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80",
        members: ["Liam Chen", "Zara Vance", "Marcus Bell"],
        isActive: true,
        displayOrder: 1,
      },
      {
        name: "Vocal Symphony",
        slug: "vocal-symphony",
        description: "An explosive a cappella ensemble turning contemporary pop and soul into cinematic harmonies.",
        image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&auto=format&fit=crop&q=80",
        members: ["Elena Rostova", "Kai Tanaka", "Maya Brooks", "Darnell Lewis"],
        isActive: true,
        displayOrder: 2,
      },
      {
        name: "Electric Shadows",
        slug: "electric-shadows",
        description: "High-flying acrobatic shadow play featuring breathtaking aerial stunts and visual illusion artistry.",
        image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80",
        members: ["Aria Thorne", "Leo Silva"],
        isActive: true,
        displayOrder: 3,
      },
      {
        name: "Cosmic Groove",
        slug: "cosmic-groove",
        description: "Funk-fusion powerhouse combining live brass, slap bass, and infectious dance grooves that electrify crowds.",
        image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80",
        members: ["Siddharth Roy", "Chloe Martin", "Devon Park"],
        isActive: true,
        displayOrder: 4,
      },
      {
        name: "Ignite D-Crew",
        slug: "ignite-d-crew",
        description: "World-class breakdancing and hip-hop collective known for gravity-defying power moves and synchronized tricks.",
        image: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&auto=format&fit=crop&q=80",
        members: ["Jordan Drake", "Tasha Rivera", "Kenji Sato", "Noah Wright"],
        isActive: true,
        displayOrder: 5,
      },
    ];

    await Team.insertMany(initialTeams);
  }

  return { event: eventDoc };
}
