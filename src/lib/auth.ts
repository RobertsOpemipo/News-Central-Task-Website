import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users, units } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

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

    const authEmail = authUser.email.trim().toLowerCase();

    // Fetch user record using case-insensitive SQL matching
    const [dbUser] = await db
      .select()
      .from(users)
      .where(sql`lower(${users.email}) = ${authEmail}`)
      .limit(1);

    if (!dbUser) {
      return {
        id: authUser.id,
        name: (authUser.user_metadata?.name as string | undefined) || authEmail.split("@")[0],
        email: authEmail,
        role: "MEMBER",
        unitName: "General Desk",
      };
    }

    // Fetch assigned unit name safely
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
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      (error as { digest: unknown }).digest === "DYNAMIC_SERVER_USAGE"
    ) {
      throw error;
    }
    console.error("Error retrieving authenticated profile:", error);
    return null;
  }
}