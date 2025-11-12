import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

const BCRYPT_COST_FACTOR = 12;

async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // Check for Daniel specifically
    let daniel = await db.select().from(users).where(eq(users.name, "daniel")).then(r => r[0]);
    let pacharee = await db.select().from(users).where(eq(users.name, "pacharee")).then(r => r[0]);
    
    // Hash default passwords
    const danielPassword = await bcrypt.hash("testpass123", BCRYPT_COST_FACTOR);
    const pachareePassword = await bcrypt.hash("testpass456", BCRYPT_COST_FACTOR);

    // Create Daniel if missing
    if (!daniel) {
      console.log("Creating Daniel's account...");
      [daniel] = await db.insert(users).values({
        name: "daniel",
        passwordHash: danielPassword,
        passwordUpdatedAt: new Date(),
      }).returning();
    }

    // Create Pacharee if missing
    if (!pacharee) {
      console.log("Creating Pacharee's account...");
      [pacharee] = await db.insert(users).values({
        name: "pacharee",
        passwordHash: pachareePassword,
        passwordUpdatedAt: new Date(),
      }).returning();
    }

    // Verify partner relationship is mutual
    const needsLinking = daniel.partnerId !== pacharee.id || pacharee.partnerId !== daniel.id;
    
    if (needsLinking) {
      console.log("Linking Daniel and Pacharee as partners...");
      await db.update(users).set({ partnerId: pacharee.id }).where(eq(users.id, daniel.id));
      await db.update(users).set({ partnerId: daniel.id }).where(eq(users.id, pacharee.id));
    }

    console.log("✅ Database seeded successfully!");
    console.log(`   Daniel ID: ${daniel.id}`);
    console.log(`   Pacharee ID: ${pacharee.id}`);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log("🎉 Seed complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Seed error:", error);
    process.exit(1);
  });
