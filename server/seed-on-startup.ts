import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

const BCRYPT_COST_FACTOR = 12;

// Idempotent seed function that ensures Daniel & Pacharee exist and are linked
async function ensureCouple() {
  try {
    // Check for Daniel & Pacharee specifically
    let daniel = await db.select().from(users).where(eq(users.name, "daniel")).then(r => r[0]);
    let pacharee = await db.select().from(users).where(eq(users.name, "pacharee")).then(r => r[0]);
    
    // Hash default passwords (only used if creating new accounts)
    const danielPassword = await bcrypt.hash("testpass123", BCRYPT_COST_FACTOR);
    const pachareePassword = await bcrypt.hash("testpass456", BCRYPT_COST_FACTOR);

    // Create Daniel if missing
    if (!daniel) {
      console.log("🌱 Creating Daniel's account...");
      [daniel] = await db.insert(users).values({
        name: "daniel",
        email: "daniel@spiritloveplay.com",
        passwordHash: danielPassword,
        passwordUpdatedAt: new Date(),
      }).returning();
    }

    // Create Pacharee if missing
    if (!pacharee) {
      console.log("🌱 Creating Pacharee's account...");
      [pacharee] = await db.insert(users).values({
        name: "pacharee",
        email: "pacharee@spiritloveplay.com",
        passwordHash: pachareePassword,
        passwordUpdatedAt: new Date(),
      }).returning();
    }

    // Verify partner relationship is mutual (defensive check)
    const needsLinking = daniel.partnerId !== pacharee.id || pacharee.partnerId !== daniel.id;
    
    if (needsLinking) {
      console.log("🌱 Linking Daniel and Pacharee as partners...");
      // Note: This uses direct DB update, bypassing storage.updateUser's partnerId lock
      // This is intentional for the seed process only
      await db.update(users).set({ partnerId: pacharee.id }).where(eq(users.id, daniel.id));
      await db.update(users).set({ partnerId: daniel.id }).where(eq(users.id, pacharee.id));
      console.log("✅ Partner relationship established");
    }
  } catch (error) {
    console.error("❌ Couple seeding failed:", error);
    // Don't throw - allow server to start even if seed fails
  }
}

// Run seed on module import (startup)
ensureCouple();
