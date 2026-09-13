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

export async function register(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const rawUnitId = formData.get("unitId") as string | null;
  const role = (formData.get("role") as "MEMBER" | "UNIT_LEAD") || "MEMBER";

  if (!name || !email || !password) {
    return { success: false, message: "Name, email, and password are required." };
  }

  const cleanUnitId = rawUnitId && rawUnitId.trim() !== "" ? rawUnitId.trim() : null;

  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (authError || !authData.user) {
    return { success: false, message: authError?.message || "Registration failed." };
  }

  try {
    await db.insert(users).values({
      name,
      email,
      role,
      unitId: cleanUnitId,
    });
  } catch (dbError) {
    console.error("Error inserting app user record:", dbError);
    return {
      success: false,
      message: "Account created, but profile setup failed. Contact lead editor.",
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