import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "";

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "";

export const supabase = createClient(supabaseUrl, supabaseKey);

export { bcrypt };

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password: string;
  nim: string;
  angkatan: string;
  prodi: string;
  university: string;
  kipStatus: string;
  verificationStatus: string;
  avatarUrl: string;
  phone: string;
  role: string;
  isBlocked: number;
  createdAt: string;
  updatedAt: string;
}

// Operational Helper untuk Supabase SDK
export const userDb = {
  async findById(id: string): Promise<UserRecord | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) console.error("userDb.findById error:", error);
    if (!data) return null;
    return data as UserRecord;
  },

  async findByEmail(email: string): Promise<UserRecord | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .ilike("email", email.trim())
      .maybeSingle();

    if (error) console.error("userDb.findByEmail error:", error);
    if (!data) return null;
    return data as UserRecord;
  },

  async findByNim(nim: string): Promise<UserRecord | null> {
    if (!nim || !nim.trim()) return null;
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .ilike("nim", nim.trim())
      .maybeSingle();

    if (error) console.error("userDb.findByNim error:", error);
    if (!data) return null;
    return data as UserRecord;
  },

  async findByIdentity(identity: string): Promise<UserRecord | null> {
    const clean = identity.trim();
    if (!clean) return null;

    // 1. Cek email langsung
    const userByEmail = await this.findByEmail(clean);
    if (userByEmail) return userByEmail;

    // 2. Cek NIM langsung
    const userByNim = await this.findByNim(clean);
    if (userByNim) return userByNim;

    // 3. Cek ID langsung
    const userById = await this.findById(clean);
    if (userById) return userById;

    // 4. Cek fallback format semadiksi atau nama/phone
    const semadiksiEmail = clean.includes("@") ? clean : `${clean}@semadiksi.ac.id`;
    try {
      const { data } = await supabase
        .from("users")
        .select("*")
        .or(`email.ilike."${semadiksiEmail}",phone.ilike."${clean}",name.ilike."${clean}"`)
        .limit(1)
        .maybeSingle();

      if (data) return data as UserRecord;
    } catch (e) {
      console.error("findByIdentity error:", e);
    }
    return null;
  },

  async getAll(): Promise<UserRecord[]> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("createdAt", { ascending: false });

    if (error || !data) return [];
    return data as UserRecord[];
  },

  async create(user: {
    name: string;
    email: string;
    password: string;
    nim?: string;
    angkatan?: string;
    prodi?: string;
    university?: string;
    kipStatus?: string;
    verificationStatus?: string;
    avatarUrl?: string;
    phone?: string;
    role?: string;
    isBlocked?: number;
  }): Promise<UserRecord | null> {
    const id = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const passwordHash =
      user.password.startsWith("$2a$") || user.password.startsWith("$2b$")
        ? user.password
        : bcrypt.hashSync(user.password, 10);

    const newUser = {
      id,
      name: user.name.trim(),
      email: user.email.trim().toLowerCase(),
      password: passwordHash,
      nim: (user.nim || "").trim(),
      angkatan: (user.angkatan || new Date().getFullYear().toString()).trim(),
      prodi: (user.prodi || "Teknik Informatika").trim(),
      university: (user.university || "Universitas Nahdlatul Ulama Surabaya").trim(),
      kipStatus: user.kipStatus || "KIP UNUSA",
      verificationStatus:
        user.verificationStatus || (user.kipStatus === "KIP UNUSA" ? "Pending" : "Verified"),
      avatarUrl: user.avatarUrl || "",
      phone: (user.phone || "").trim(),
      role: user.role || "student",
      isBlocked: user.isBlocked || 0,
      createdAt: now,
      updatedAt: now,
    };

    const { data, error } = await supabase
      .from("users")
      .insert([newUser])
      .select()
      .single();

    if (error) {
      console.error("userDb.create Supabase error:", error);
      throw new Error(error.message || "Gagal membuat pengguna baru di database");
    }

    if (!data) {
      console.error("userDb.create: no data returned from Supabase insert");
      return null;
    }

    return data as UserRecord;
  },

  async update(
    id: string,
    fields: Partial<Omit<UserRecord, "id" | "createdAt">>
  ): Promise<UserRecord | null> {
    const payload: Record<string, any> = { ...fields };

    if (payload.password) {
      const pass = payload.password as string;
      payload.password =
        pass.startsWith("$2a$") || pass.startsWith("$2b$")
          ? pass
          : bcrypt.hashSync(pass, 10);
    }

    payload.updatedAt = new Date().toISOString();

    const { data, error } = await supabase
      .from("users")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("userDb.update Supabase error:", error);
      return null;
    }
    if (!data) return null;
    return data as UserRecord;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) {
      console.error("userDb.delete Supabase error:", error);
      return false;
    }
    return true;
  },
};