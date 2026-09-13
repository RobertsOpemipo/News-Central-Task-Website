"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function login(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, message: "Email and password are required." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// src/app/actions/auth.ts (register function)
export async function register(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const rawUnitId = formData.get("unitId") as string | null;
  const role = (formData.get("role") as "MEMBER" | "UNIT_LEAD" | "ADMIN") || "MEMBER";

  if (!name || !email || !password) {
    return { success: false, message: "Name, email, and password are required." };
  }

  const cleanUnitId = rawUnitId && rawUnitId.trim() !== "" ? rawUnitId.trim() : null;

  const supabase = await createClient();

  // 1. Sign up user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (authError || !authData.user) {
    return { success: false, message: authError?.message || "Registration failed." };
  }

  // 2. Upsert into database users table
  try {
    await db
      .insert(users)
      .values({
        name,
        email,
        role,
        unitId: cleanUnitId,
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          name,
          role,
          ...(cleanUnitId ? { unitId: cleanUnitId } : {}),
        },
      });
  } catch (dbError: unknown) {
    console.error("Error inserting/updating app user record:", dbError);
    return {
      success: false,
      message:
        dbError instanceof Error
          ? dbError.message
          : "Account created, but profile setup failed. Contact lead editor.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}