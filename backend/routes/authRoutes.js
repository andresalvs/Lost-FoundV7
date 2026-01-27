import express from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import pool from "../db.js";
import sendVerificationEmail from "../services/emailService.js";

dotenv.config();
const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ============================
// Utility Functions
// ============================
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    const msg =
      "JWT_SECRET environment variable is not set. Set JWT_SECRET in your .env (or environment) before starting the server.";
    console.error(msg);
    // Throw so caller (and logs) show a clear stack trace pointing to this code path
    throw new Error(msg);
  }

  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

const validateUniversityEmail = (email) => {
  return email.endsWith("@carsu.edu.ph");
};

// Verification token helper
const generateVerificationToken = (email) => {
  return jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// Ensure pending_registrations table exists (stores pre-verified registrations)
const ensurePendingTable = async () => {
  try {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS pending_registrations (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        role TEXT NOT NULL,
        verification_token TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );`
    );
  } catch (err) {
    console.error('Failed to ensure pending_registrations table exists:', err);
    throw err;
  }
};

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/; // min 8, lowercase, uppercase, number, symbol

// ============================
// 1️⃣ Get Google Client ID
// ============================
router.get("/google-client-id", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    const msg =
      "GOOGLE_CLIENT_ID environment variable is not set on the server.";
    console.error(msg);
    return res.status(500).json({ error: msg });
  }

  res.json({ clientId });
});

// ============================
// 2️⃣ Google Login
// ============================
router.post("/google-login", async (req, res) => {
  const { token, role } = req.body;

  if (!token)
    return res.status(400).json({ error: "Google ID token is required" });
  if (!role) return res.status(400).json({ error: "Role is required" });

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;

    if (!validateUniversityEmail(email)) {
      return res
        .status(400)
        .json({ error: "Email must be a university address" });
    }

    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (existing.rowCount === 0) {
      // Check pending registrations
      await ensurePendingTable();
      const pending = await pool.query("SELECT * FROM pending_registrations WHERE email = $1", [email]);
      if (pending.rowCount > 0) {
        // resend verification
        await sendVerificationEmail(email, pending.rows[0].verification_token);
        return res.status(403).json({ error: "Registration pending. Please verify your email.", needsVerification: true });
      }
      return res.status(404).json({ error: "User not found. Please register first." });
    }

    const user = existing.rows[0];

    if (user.role !== role) {
      return res
        .status(403)
        .json({ error: "Login failed: role does not match." });
    }

    const tokenJWT = generateToken(user);
    res.json({
      message: "Login successful",
      token: tokenJWT,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Google login failed:", err);
    res.status(500).json({ error: "Google login failed" });
  }
});

// ============================
// 3️⃣ Google Register
// ============================
router.post("/google-register", async (req, res) => {
  const { token, role } = req.body;

  if (!token)
    return res.status(400).json({ error: "Google ID token is required" });

  const normalizedRole = role?.trim().toLowerCase();
  if (!normalizedRole)
    return res.status(400).json({ error: "Role is required" });

  // Only allow end-users to self-register; staff accounts are handled by the admin panel.
  if (normalizedRole !== "university_member") {
    return res.status(403).json({
      error:
        "Only university members can self-register. Please contact an administrator for staff access.",
    });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;

    if (!validateUniversityEmail(email)) {
      return res
        .status(400)
        .json({ error: "Email must be a university address" });
    }

    // Ensure pending table exists
    await ensurePendingTable();

    // Check if a real user exists
    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existing.rowCount > 0) {
      const user = existing.rows[0];
      if (!user.email_verified && user.verification_token) {
        // Resend verification email for existing user
        await sendVerificationEmail(user.email, user.verification_token);
        return res.status(403).json({
          error: "Account already exists but not verified. A new verification email has been sent.",
          needsVerification: true,
        });
      }
      return res.status(400).json({ error: "User already registered" });
    }

    // Check pending_registrations to avoid duplicate pending entries
    const pendingExists = await pool.query(
      "SELECT * FROM pending_registrations WHERE email = $1",
      [email]
    );
    if (pendingExists.rowCount > 0) {
      const pending = pendingExists.rows[0];
      // Resend verification email using existing token
      await sendVerificationEmail(email, pending.verification_token);
      return res.status(403).json({
        error: "Registration already initiated. A verification email has been re-sent.",
        needsVerification: true,
      });
    }

    const verificationToken = generateVerificationToken(email);

    try {
      // Send verification email first
      await sendVerificationEmail(email, verificationToken);

      // Store pending registration instead of creating user row
      await pool.query(
        "INSERT INTO pending_registrations (email, role, verification_token) VALUES ($1, $2, $3)",
        [email, normalizedRole, verificationToken]
      );

      res.json({
        message: "Please check your email to verify your account. The verification link will expire in 1 hour.",
        needsVerification: true,
      });
    } catch (err) {
      console.error("Registration error:", err);
      res.status(500).json({ error: "Registration failed. Please try again." });
    }
  } catch (err) {
    console.error("Google registration failed:", err);
    res.status(500).json({ error: "Google registration failed" });
  }
});

// ============================
// 4️⃣ Development Login (Bypass Google)
// ============================
router.post("/dev-login", async (req, res) => {
  const { email, role } = req.body;

  try {
    if (!validateUniversityEmail(email)) {
      return res
        .status(400)
        .json({ error: "Email must be a university address" });
    }

    let result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    let user = result.rows[0];

    if (!user) {
      const newUser = await pool.query(
        "INSERT INTO users (email, role, email_verified) VALUES ($1, $2, true) RETURNING *",
        [email, role]
      );
      user = newUser.rows[0];
    } else if (user.role !== role) {
      const updated = await pool.query(
        "UPDATE users SET role = $1 WHERE email = $2 RETURNING *",
        [role, email]
      );
      user = updated.rows[0];
    }

    // Ensure email is verified before issuing token
    if (user && user.email_verified === false) {
      return res.status(403).json({ error: "Email not verified. Please verify your email first." });
    }

    const tokenJWT = generateToken(user);
    res.json({
      message: "Development login successful",
      token: tokenJWT,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Development login error:", err);
    res.status(500).json({ error: "Server error during development login" });
  }
});

// ============================
// 5️⃣ Simple Register (Manual)
// ============================
router.post("/simple-register", async (req, res) => {
  const { email, password, confirmPassword } = req.body || {};

  try {
    if (!validateUniversityEmail(email)) {
      return res
        .status(400)
        .json({ error: "Email must be a university address" });
    }

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters and include lowercase, uppercase, a number, and a symbol",
      });
    }

    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (existing.rowCount > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

  // Ensure pending table exists
    await ensurePendingTable();

    // Check if a real user exists
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rowCount > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Check pending registrations
    const pendingExists = await pool.query(
      "SELECT * FROM pending_registrations WHERE email = $1",
      [email]
    );
    if (pendingExists.rowCount > 0) {
      const pending = pendingExists.rows[0];
      // Resend verification email using existing token
      await sendVerificationEmail(email, pending.verification_token);
      return res.status(403).json({
        error: "Registration already initiated. A verification email has been re-sent.",
        needsVerification: true,
      });
    }

    // Store pending registration and send verification email
    const verificationToken = generateVerificationToken(email);
    await pool.query(
      "INSERT INTO pending_registrations (email, password_hash, role, verification_token) VALUES ($1, $2, $3, $4)",
      [email, passwordHash, "university_member", verificationToken]
    );

    await sendVerificationEmail(email, verificationToken);

    res.json({
      message: "Registration pending - please check your email to verify your account",
      needsVerification: true,
    });
  } catch (err) {
    console.error("Simple registration error:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// ============================
// 6️⃣ Simple Login (Manual)
// ============================
router.post("/simple-login", async (req, res) => {
  const { email, role, password } = req.body || {};

  console.log("Simple login attempt:", email, role);

  try {
    if (!validateUniversityEmail(email)) {
      return res
        .status(400)
        .json({ error: "Email must be a university address" });
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rowCount === 0) {
      // Check pending registrations and inform user to verify
      await ensurePendingTable();
      const pending = await pool.query("SELECT * FROM pending_registrations WHERE email = $1", [email]);
      if (pending.rowCount > 0) {
        await sendVerificationEmail(email, pending.rows[0].verification_token);
        return res.status(403).json({ error: "Registration pending. Please verify your email.", needsVerification: true });
      }
      return res.status(404).json({ error: "User not found. Please register first." });
    }

    const user = result.rows[0];
    if (user.role !== role) {
      return res
        .status(403)
        .json({ error: "Login failed: role does not match." });
    }

    if (user.email_verified === false) {
      return res.status(403).json({ error: "Email not verified. Please verify your email first." });
    }

    // Ensure password exists in DB (if account was created via Google, no password is present)
    if (!user.password_hash) {
      return res.status(403).json({ error: "No password set on this account. Please sign in with Google or reset your password." });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    const tokenJWT = generateToken(user);
    res.json({
      message: "Login successful",
      token: tokenJWT,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Simple login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// ============================
// 7️⃣ Email verification endpoint
// ============================
router.get("/verify-email", async (req, res) => {
  const token = req.query.token || req.body?.token;
  if (!token) return res.status(400).json({ error: "Verification token is required" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const email = payload.email;
    // First, try to find a pending registration with this token
    await ensurePendingTable();
    const pending = await pool.query(
      "SELECT * FROM pending_registrations WHERE email = $1",
      [email]
    );
    if (pending.rowCount > 0) {
      const pendingRow = pending.rows[0];
      if (!pendingRow.verification_token || pendingRow.verification_token !== token) {
        return res.status(400).json({ error: "Invalid or expired token" });
      }

      // Create the actual user record now that email is verified
      const insertRes = await pool.query(
        "INSERT INTO users (email, role, password_hash, email_verified) VALUES ($1, $2, $3, true) RETURNING id, email, role, email_verified",
        [pendingRow.email, pendingRow.role, pendingRow.password_hash]
      );

      // Delete pending registration
      await pool.query("DELETE FROM pending_registrations WHERE id = $1", [pendingRow.id]);

      if (process.env.FRONTEND_URL) {
        return res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=success&role=${insertRes.rows[0].role}`);
      }

      return res.json({ message: "Email verified and account created successfully", user: insertRes.rows[0] });
    }

    // Fallback: handle existing user email-change flows (legacy behavior)
    const existing = await pool.query(
      "SELECT id, email, verification_token FROM users WHERE email = $1",
      [email]
    );

    if (existing.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = existing.rows[0];
    if (!user.verification_token || user.verification_token !== token) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Update the user to set email_verified = true and clear verification_token
    const updated = await pool.query(
      "UPDATE users SET email_verified = true, verification_token = NULL WHERE email = $1 RETURNING id, email, role, email_verified",
      [email]
    );

    if (process.env.FRONTEND_URL) {
      return res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=success&role=${updated.rows[0].role}`);
    }

    res.json({ message: "Email verified successfully", user: updated.rows[0] });
  } catch (err) {
    console.error("Email verification failed:", err);
    return res.status(400).json({ error: "Invalid or expired token" });
  }
});

export default router;
