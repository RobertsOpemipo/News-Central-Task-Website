import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";
import * as schema from "./schema";
import { units, users, tasks } from "./schema";

dotenv.config({ path: ".env.local" });
const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client, { schema });

async function runSeed() {
  console.log("📰 Repopulating newsroom database with extensive records...");

  await db.delete(tasks);
  await db.delete(users);
  await db.delete(units);

  const [breakingDesk, investigativeDesk, broadcastDesk, digitalDesk] = await db
    .insert(units)
    .values([
      { name: "Breaking & Wire Desk" },
      { name: "Investigative & Metro" },
      { name: "Broadcast & Control Room" },
      { name: "Digital & Social Distribution" },
    ])
    .returning();

  const [elena, marcus, amara, david] = await db
    .insert(users)
    .values([
      { name: "Elena Rostova", email: "elena.editor@newshour.internal", role: "ADMIN", unitId: breakingDesk.id },
      { name: "Marcus Vance", email: "marcus.desk@newshour.internal", role: "UNIT_LEAD", unitId: broadcastDesk.id },
      { name: "Amara Kalu", email: "amara.reporter@newshour.internal", role: "MEMBER", unitId: investigativeDesk.id },
      { name: "David Okafor", email: "david.social@newshour.internal", role: "MEMBER", unitId: digitalDesk.id },
    ])
    .returning();

  await db.insert(tasks).values([
    // Sunday
    {
      title: "Weekend overnight AP/Reuters international wire review",
      description: "Synthesize geopolitical briefings and isolate 3 prime leads for the 6:00 AM bulletin.",
      dayOfWeek: "Sun",
      unitId: breakingDesk.id,
      assignedToId: amara.id,
      status: "COMPLETED",
      loggedSummary: "Compiled 3-page summary. Top story: Pacific trade accord finalized.",
      loggedAt: new Date(Date.now() - 3600 * 1000 * 4),
    },
    {
      title: "Produce weekend top-5 video recap package for social feeds",
      description: "Assemble high-engagement cuts with captions for YouTube Shorts and TikTok.",
      dayOfWeek: "Sun",
      unitId: digitalDesk.id,
      assignedToId: david.id,
      status: "AWAITING_REVIEW",
      loggedSummary: "Exported 5 vertical clips at 1080x1920. Captions burned in.",
      loggedAt: new Date(Date.now() - 1800 * 1000),
    },
    {
      title: "PCR switchboard comms check with remote bureaus in Paris and Nairobi",
      description: "Test direct talkback loops on redundant IP links prior to live segment.",
      dayOfWeek: "Sun",
      unitId: broadcastDesk.id,
      assignedToId: marcus.id,
      status: "PENDING",
    },

    // Monday
    {
      title: "Verify Central Bank rate hike press brief with official ministry quote",
      description: "Cross-check raw quote with Ministry brief and provide lower-third inflation graphics.",
      dayOfWeek: "Mon",
      unitId: breakingDesk.id,
      assignedToId: amara.id,
      status: "COMPLETED",
      loggedSummary: "Verified quotes with spokesperson. Graphic sent to studio switchboard.",
      loggedAt: new Date(),
    },
    {
      title: "Prime evening telecast rundown lock and anchor prompter sync",
      description: "Ensure all telecast package durations tally within the 58-minute slot window.",
      dayOfWeek: "Mon",
      unitId: broadcastDesk.id,
      assignedToId: marcus.id,
      status: "AWAITING_REVIEW",
      loggedSummary: "Prompter synced. Rundown duration locked at 57:45.",
      loggedAt: new Date(),
    },
    {
      title: "Investigative report: Port customs manifest audit",
      description: "Interview freight forwarding union representatives on persistent container backlog.",
      dayOfWeek: "Mon",
      unitId: investigativeDesk.id,
      assignedToId: amara.id,
      status: "PENDING",
    },

    // Tuesday
    {
      title: "Legal counsel signoff: Financial audit whistleblower excerpt",
      description: "Obtain formal clearance on anonymous audio pitch before publishing exclusive report.",
      dayOfWeek: "Tue",
      unitId: investigativeDesk.id,
      assignedToId: amara.id,
      status: "PENDING",
    },
    {
      title: "Studio robotic pedestal camera recalibration",
      description: "Adjust tracking marks for anchor desk marks 1 through 3.",
      dayOfWeek: "Tue",
      unitId: broadcastDesk.id,
      assignedToId: marcus.id,
      status: "PENDING",
    },

    // Wednesday through Friday
    {
      title: "Midweek inflation infographic dispatch for web portal",
      description: "Publish interactive chart comparing domestic food price indices.",
      dayOfWeek: "Wed",
      unitId: digitalDesk.id,
      assignedToId: david.id,
      status: "PENDING",
    },
    {
      title: "Municipal infrastructure deep dive: Metro transit delays",
      description: "Review commuter ridership metrics following recent tariff adjustments.",
      dayOfWeek: "Thu",
      unitId: investigativeDesk.id,
      assignedToId: amara.id,
      status: "PENDING",
    },
    {
      title: "Weekly documentary master reel ingest and LTO archive backup",
      description: "Transfer 4K broadcast footage to cold storage tape drive.",
      dayOfWeek: "Fri",
      unitId: broadcastDesk.id,
      assignedToId: marcus.id,
      status: "PENDING",
    },
  ]);

  console.log("✨ Seed populated with multiple desks, users, and tasks!");
  await client.end();
}

runSeed();