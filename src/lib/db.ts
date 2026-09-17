import fs from "fs";
import path from "path";
import os from "os";
import bcrypt from "bcryptjs";

// Type declaration for node:sqlite in case TypeScript target doesn't include it yet
// @ts-ignore
import { DatabaseSync } from "node:sqlite";

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

// Maintain singleton connection across Next.js dev hot-reloads
const globalForDb = globalThis as unknown as {
  _semadiksi_db?: any;
};

function getDbPath(): string {
  // In serverless / production environments (like Vercel/AWS Lambda), /var/task is read-only.
  // Only os.tmpdir() (/tmp) is writable.
  const isServerless = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT
  );

  if (isServerless) {
    const tmpDir = path.join(os.tmpdir(), "database");
    try {
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      return path.join(tmpDir, "semadiksi.db");
    } catch {
      return path.join(os.tmpdir(), "semadiksi.db");
    }
  }

  // Local development fallback
  try {
    const dbDir = path.join(process.cwd(), "database");
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    return path.join(dbDir, "semadiksi.db");
  } catch {
    return path.join(os.tmpdir(), "semadiksi.db");
  }
}

function getDatabase() {
  if (!globalForDb._semadiksi_db) {
    const dbPath = getDbPath();
    const db = new DatabaseSync(dbPath);

    // Initialize Schema
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        nim TEXT DEFAULT '',
        angkatan TEXT DEFAULT '',
        prodi TEXT DEFAULT 'Teknik Informatika',
        university TEXT DEFAULT 'Universitas Nahdlatul Ulama Surabaya',
        kipStatus TEXT DEFAULT 'KIP UNUSA',
        verificationStatus TEXT DEFAULT 'Pending',
        avatarUrl TEXT DEFAULT '',
        phone TEXT DEFAULT '',
        role TEXT DEFAULT 'student',
        isBlocked INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);

    // Seed default accounts if empty
    const checkStmt = db.prepare("SELECT COUNT(*) as count FROM users");
    const result = checkStmt.get() as { count: number | bigint };
    const count = Number(result?.count || 0);

    if (count === 0) {
      const defaultPasswordHash = bcrypt.hashSync("password123", 10);
      const adminPasswordHash = bcrypt.hashSync("12345678", 10);
      const now = new Date().toISOString();

      const insertStmt = db.prepare(`
        INSERT INTO users (
          id, name, email, password, nim, angkatan, prodi, university,
          kipStatus, verificationStatus, avatarUrl, phone, role, isBlocked, createdAt, updatedAt
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `);

      // Seed 1: ferd (Default student account)
      insertStmt.run(
        "usr-ferd",
        "ferd",
        "ferd@semadiksi.ac.id",
        defaultPasswordHash,
        "24060121140001",
        "2022",
        "Teknik Informatika",
        "Universitas Nahdlatul Ulama Surabaya",
        "KIP UNUSA",
        "Verified",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuByC13lRV-RXOv0wxz5CEddVyXFPn7mB78UwyO78hHTtw4oLda25cFIDyqFxXT2Ws2_cX6amMuQrpkkGD6wl5NvmOJsYF0GOSFS2fTiCDEo5Y5DUay0oKKExRn2MZzQfii3KkLuzsbFdtVFizHLSVi6mPtbSzi02TB9n3sh2r66X7yxUb4uochJZwj-CZNAe4RRqFxSFFNv7Vgrrobo0XFEQpFj2PKdh3MZs4QqcA6dfslUx7ijmZxWdQ",
        "081234567890",
        "student",
        0,
        now,
        now
      );

      // Seed 2: Ahmad Fauzan
      insertStmt.run(
        "usr-fauzan",
        "Ahmad Fauzan",
        "fauzan@student.undip.ac.id",
        defaultPasswordHash,
        "24060121140000",
        "2021",
        "Teknik Informatika",
        "Universitas Diponegoro",
        "Umum",
        "Verified",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBSqkIMDVmraJfuluYuOafSp5jlN1kt75ZtORGLAF-_GI8GrvQinmIMEYIzpsXit5jEHCmhSyTcKwd7a0zE9gy556BdO_r9fc_mFxTcObwkZbsTWnF_yAxi4_urSiBPr36oYZZHM96wWx2b4rHqjLy5ujL6V7xF-WgCYWTqsV5OkFYueCtA4WibIuPMe54mtCOXSNCTAmtiSSTyOLxCduLvq9Foa5tcAKVbQz-5kYy1yCAkIkmlYoSvuQ",
        "089876543210",
        "student",
        0,
        now,
        now
      );

      // Seed 3: Administrator SEMADIKSI
      insertStmt.run(
        "usr-admin",
        "Administrator SEMADIKSI",
        "admin123@gmail.com",
        adminPasswordHash,
        "-",
        "2020",
        "Biro Kemahasiswaan",
        "Universitas Nahdlatul Ulama Surabaya",
        "Umum",
        "Verified",
        "",
        "081122334455",
        "admin",
        0,
        now,
        now
      );
    }

    globalForDb._semadiksi_db = db;
  }

  // Run migrations on every call — safe because ALTER TABLE errors are caught.
  // This ensures new columns are added even if singleton was cached before code update.
  const migrations = [
    `ALTER TABLE users ADD COLUMN isBlocked INTEGER DEFAULT 0`,
  ];
  for (const migration of migrations) {
    try {
      globalForDb._semadiksi_db.exec(migration);
    } catch {
      // Column already exists — safe to ignore
    }
  }

  return globalForDb._semadiksi_db;
}

// User DB operations
export const userDb = {
  findById(id: string): UserRecord | null {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
    const user = stmt.get(id) as UserRecord | undefined;
    return user || null;
  },

  findByEmail(email: string): UserRecord | null {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM users WHERE LOWER(email) = LOWER(?)");
    const user = stmt.get(email.trim()) as UserRecord | undefined;
    return user || null;
  },

  findByNim(nim: string): UserRecord | null {
    if (!nim || !nim.trim()) return null;
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM users WHERE LOWER(nim) = LOWER(?)");
    const user = stmt.get(nim.trim()) as UserRecord | undefined;
    return user || null;
  },

  findByIdentity(identity: string): UserRecord | null {
    const db = getDatabase();
    const clean = identity.trim().toLowerCase();
    const semadiksiEmail = clean.includes("@") ? clean : `${clean}@semadiksi.ac.id`;
    const prefixPattern = `${clean}@%`;
    const namePrefixPattern = `${clean}%`;

    const stmt = db.prepare(`
      SELECT * FROM users 
      WHERE LOWER(email) = ? 
         OR LOWER(email) = ?
         OR LOWER(email) LIKE ?
         OR LOWER(nim) = ? 
         OR LOWER(phone) = ?
         OR LOWER(name) = ?
         OR LOWER(name) LIKE ?
         OR id = ?
      LIMIT 1
    `);
    const user = stmt.get(
      clean,
      semadiksiEmail,
      prefixPattern,
      clean,
      clean,
      clean,
      namePrefixPattern,
      clean
    ) as UserRecord | undefined;
    return user || null;
  },

  getAll(): UserRecord[] {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM users ORDER BY createdAt DESC");
    return stmt.all() as UserRecord[];
  },

  create(user: {
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
  }): UserRecord {
    const db = getDatabase();
    const id = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const passwordHash = user.password.startsWith("$2a$") || user.password.startsWith("$2b$")
      ? user.password
      : bcrypt.hashSync(user.password, 10);

    const stmt = db.prepare(`
      INSERT INTO users (
        id, name, email, password, nim, angkatan, prodi, university,
        kipStatus, verificationStatus, avatarUrl, phone, role, isBlocked, createdAt, updatedAt
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    stmt.run(
      id,
      user.name.trim(),
      user.email.trim().toLowerCase(),
      passwordHash,
      (user.nim || "").trim(),
      (user.angkatan || new Date().getFullYear().toString()).trim(),
      (user.prodi || "Teknik Informatika").trim(),
      (user.university || "Universitas Nahdlatul Ulama Surabaya").trim(),
      user.kipStatus || "KIP UNUSA",
      user.verificationStatus || (user.kipStatus === "KIP UNUSA" ? "Pending" : "Verified"),
      user.avatarUrl || "",
      (user.phone || "").trim(),
      user.role || "student",
      user.isBlocked || 0,
      now,
      now
    );

    return this.findById(id)!;
  },

  update(id: string, fields: Partial<Omit<UserRecord, "id" | "createdAt">>): UserRecord | null {
    const db = getDatabase();
    const existing = this.findById(id);
    if (!existing) return null;

    const allowedKeys: (keyof typeof fields)[] = [
      "name", "email", "password", "nim", "angkatan", "prodi",
      "university", "kipStatus", "verificationStatus", "avatarUrl", "phone", "role", "isBlocked"
    ];

    const updates: string[] = [];
    const values: any[] = [];

    for (const key of allowedKeys) {
      if (fields[key] !== undefined) {
        if (key === "password") {
          const pass = fields[key] as string;
          const hash = pass.startsWith("$2a$") || pass.startsWith("$2b$")
            ? pass
            : bcrypt.hashSync(pass, 10);
          updates.push("password = ?");
          values.push(hash);
        } else {
          updates.push(`${key} = ?`);
          values.push(fields[key]);
        }
      }
    }

    if (updates.length === 0) return existing;

    const now = new Date().toISOString();
    updates.push("updatedAt = ?");
    values.push(now);

    values.push(id);

    const sql = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
    const stmt = db.prepare(sql);
    stmt.run(...values);

    return this.findById(id);
  },

  delete(id: string): boolean {
    const db = getDatabase();
    const stmt = db.prepare("DELETE FROM users WHERE id = ?");
    stmt.run(id);
    return true;
  }
};
