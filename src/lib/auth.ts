// src/lib/auth.ts
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users, units } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface CurrentUserProfile {
  id: string;
  name: string;
  email: string;
  role: "MEMBER" | "UNIT_LEAD" | "ADMIN";
  unitName: string;
}

export async function getCurrentUser(): Promise<CurrentUserProfile | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser?.email) {
      return null;
    }

    // 1. Fetch user record by email
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, authUser.email.toLowerCase()))
      .limit(1);

    if (!dbUser) {
      return {
        id: authUser.id,
        name: authUser.user_metadata?.name || authUser.email.split("@")[0],
        email: authUser.email,
        role: "MEMBER",
        unitName: "General Desk",
      };
    }

    // 2. Fetch assigned unit name safely
    let unitTitle = "General Newsroom";
    if (dbUser.unitId) {
      const [assignedUnit] = await db
        .select({ name: units.name })
        .from(units)
        .where(eq(units.id, dbUser.unitId))
        .limit(1);

      if (assignedUnit?.name) {
        unitTitle = assignedUnit.name;
      }
    }

    return {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role as "MEMBER" | "UNIT_LEAD" | "ADMIN",
      unitName: unitTitle,
    };
  } catch (error: unknown) {
    // Let Next.js handle its internal dynamic bailout signal without logging a false error
    if (
      error instanceof Error &&
      "digest" in error &&
      error.digest === "DYNAMIC_SERVER_USAGE"
    ) {
      throw error;
    }
    console.error("Error retrieving authenticated profile:", error);
    return null;
  }
}