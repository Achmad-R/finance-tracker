"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { credentialsSchema, field } from "@/lib/validation";

export async function signInWithPassword(formData: FormData) {
  const supabase = createClient();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/login?error=1");
  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const parsed = credentialsSchema.safeParse({
    email: field(formData, "email"),
    password: field(formData, "password"),
  });
  if (!parsed.success) redirect("/signup?error=1");

  const supabase = createClient();
  const { error } = await supabase.auth.signUp(parsed.data);
  if (error) redirect("/signup?error=1");
  redirect("/login?check=1");
}
