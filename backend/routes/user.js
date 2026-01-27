import express from "express";
import { authenticateJWT } from "../middleware/authenticateJWT.js";
import pool from "../db.js";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import sendVerificationEmail from "../services/emailService.js";
import bcrypt from "bcrypt";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

const router = express.Router();

const validateUniversityEmail = (email = "") =>
  String(email).toLowerCase().trim().endsWith("@carsu.edu.ph");

// ========================
// 🔹 Get All Users (For Admin Dashboard)
// ========================
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        full_name,
        email,
        role,
        department,
        contact_number,
        profile_picture,
        created_at
      FROM users
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ========================
// 🔹 Get User by ID (For Reporter/Claimant Info)
// ========================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        id,
        full_name,
        email,
        contact_number,
        profile_picture
      FROM users
      WHERE id = $1
    `, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error fetching user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ========================
// 🔹 Register Security Staff (Admin Only)
// ========================
router.post("/staff", authenticateJWT, async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const {
      email,
      full_name: fullName,
      department,
      contact_number: contactNumber,
    } = req.body || {};

    if (!email || !validateUniversityEmail(email)) {
      return res
        .status(400)
        .json({ error: "A valid university email is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await pool.query(
      `SELECT id, role, full_name, department, contact_number
       FROM users
       WHERE email = $1`,
      [normalizedEmail]
    );

    if (existingUser.rowCount > 0) {
      const current = existingUser.rows[0];

      if (current.role === "security" || current.role === "security_staff") {
        return res.status(409).json({
          error: "This email is already registered as security staff",
        });
      }

      // Generate verification token for role update
      const verificationToken = jwt.sign(
        {
          userId: current.id,
          newRole: "security",
          type: 'role-update',
          fullName: fullName || current.full_name,
          department: department || current.department,
          contactNumber: contactNumber || current.contact_number
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Store the verification token
      await pool.query(
        "UPDATE users SET verification_token = $1, email_verified = false WHERE id = $2",
        [verificationToken, current.id]
      );

      // Send verification email
      await sendVerificationEmail(current.email, verificationToken);

      return res.json({
        message: "Role update initiated. Please check your email to verify this change.",
        user: current,
        needsVerification: true
      });
    }

    // Generate verification token
    const verificationToken = jwt.sign(
      { email: normalizedEmail },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Insert user with verification token and email_verified = false
    const inserted = await pool.query(
      `INSERT INTO users (email, role, full_name, department, contact_number, verification_token, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, false)
       RETURNING id, full_name, email, role, department, contact_number, created_at`,
      [
        normalizedEmail,
        "security",
        fullName || null,
        department || null,
        contactNumber || null,
        verificationToken
      ]
    );

    // Send verification email
    await sendVerificationEmail(normalizedEmail, verificationToken);

    return res.status(201).json({
      message: "Security staff registration initiated. Please verify your email to complete the process.",
      user: inserted.rows[0],
      needsVerification: true
    });
  } catch (err) {
    console.error("❌ Error registering staff:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ========================
// 🔹 Assign Role (Testing - No Guard)
// ========================
router.put("/:id/assign-role", authenticateJWT, async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = ["security", "university_member"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const result = await pool.query(
      `UPDATE users 
       SET role = $1 
       WHERE id = $2 
       RETURNING id, full_name, email, role`,
      [role, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: `✅ Role updated to ${role}`,
      user: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error assigning role:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ========================
// 🔹 Delete User (Testing - No Guard)
// ========================
router.delete("/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;

    // Get profile picture path
    const userRes = await pool.query(
      "SELECT profile_picture FROM users WHERE id=$1",
      [id]
    );

    if (!userRes.rows.length)
      return res.status(404).json({ error: "User not found" });

    const profilePic = userRes.rows[0].profile_picture;

    // Delete user from DB
    await pool.query("DELETE FROM users WHERE id=$1", [id]);

    // Delete profile picture from filesystem (if exists)
    if (profilePic) {
      const absolutePath = path.join(process.cwd(), profilePic);
      fs.access(absolutePath, fs.constants.F_OK, (err) => {
        if (!err) {
          fs.unlink(absolutePath, (unlinkErr) => {
            if (unlinkErr)
              console.error("❌ Error deleting profile picture:", unlinkErr);
          });
        }
      });
    }

    res.json({ message: "✅ User deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ========================
// 🔹 Update Own Email (Admin Self-Service)
// ========================
router.patch("/profile", authenticateJWT, async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

      const { email, newPassword, confirmPassword, oldPassword } = req.body || {};

      if (!oldPassword) {
        return res.status(400).json({ error: "Current password is required for verification" });
      }

      // Verify old password
      const user = await pool.query(
        "SELECT * FROM users WHERE id = $1",
        [req.user.id]
      );

      if (!user.rows[0] || !user.rows[0].password_hash) {
        return res.status(400).json({ error: "Account verification failed" });
      }

      const isValidPassword = await bcrypt.compare(oldPassword, user.rows[0].password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

    // If email is being updated
    if (email) {
      if (!validateUniversityEmail(email)) {
        return res.status(400).json({ error: "A valid @carsu.edu.ph email is required" });
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Prevent email duplication
      const emailExists = await pool.query(
        "SELECT id FROM users WHERE email = $1 AND id != $2",
        [normalizedEmail, req.user.id]
      );

      if (emailExists.rowCount > 0) {
        return res.status(409).json({ error: "Email already in use" });
      }

      // Generate verification token for email change
      const verificationToken = jwt.sign(
        {
          userId: req.user.id,
          newEmail: normalizedEmail,
          type: 'email-change'
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Store the pending email change
      await pool.query(
        "UPDATE users SET verification_token = $1 WHERE id = $2",
        [verificationToken, req.user.id]
      );

      // Send verification email
      await sendVerificationEmail(normalizedEmail, verificationToken);

      return res.json({
        message: "A verification email has been sent to your new email address. The change will take effect after verification.",
        needsVerification: true
      });
    }

    // If password fields provided, validate and hash
    if (newPassword || confirmPassword) {
      if (!newPassword || !confirmPassword) {
        return res.status(400).json({ error: "Both newPassword and confirmPassword are required" });
      }
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match" });
      }
      if (!PASSWORD_REGEX.test(newPassword)) {
        return res.status(400).json({ error: "Password must be at least 8 characters and include lowercase, uppercase, a number, and a symbol" });
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);

        // Update only password
        const result = await pool.query(
          "UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id, email, full_name, role",
          [passwordHash, req.user.id]
        );

      const updatedUser = result.rows[0];
        const token = jwt.sign(
          { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role },
          process.env.JWT_SECRET
        );

        return res.json({
          message: "Password updated successfully. Please sign in with your new password.",
          needsRelogin: true,
          user: updatedUser,
          token
        });
    }

      res.status(400).json({ error: "No changes requested" });
  } catch (err) {
    console.error("❌ Error updating admin email:", err);
    res.status(500).json({ error: "Failed to update email" });
  }
});

// ========================
// 🔹 Verify Email Change
// ========================
router.get("/verify-email-change", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Verification token is required" });
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure this is an email change verification
    if (decoded.type !== 'email-change') {
      return res.status(400).json({ error: "Invalid verification token" });
    }

    // Find the user with this verification token
    const result = await pool.query(
      "SELECT * FROM users WHERE id = $1 AND verification_token = $2",
      [decoded.userId, token]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ error: "Invalid or expired verification token" });
    }

    // Update email and clear verification token
    const updated = await pool.query(
      `UPDATE users 
       SET email = $1,
           verification_token = NULL,
           email_verified = true
       WHERE id = $2
       RETURNING id, email, full_name, role`,
      [decoded.newEmail, decoded.userId]
    );

    // Generate new JWT with updated email
    const updatedUser = updated.rows[0];
    const newToken = jwt.sign(
      { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role },
      process.env.JWT_SECRET
    );

    // Redirect to admin dashboard with status=email-changed for modal/logout
    if (process.env.FRONTEND_URL) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/admin-dashboard?status=email-changed`
      );
    }

    res.json({
      message: "Email updated successfully",
      user: updatedUser,
      token: newToken
    });
  } catch (err) {
    console.error("Email change verification failed:", err);
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ error: "Verification link has expired" });
    }
    res.status(400).json({ error: "Invalid verification token" });
  }
});
// ========================
// 🔹 Verify Role Update
// ========================
router.get("/verify-role-update", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Verification token is required" });
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure this is a role update verification
    if (decoded.type !== 'role-update') {
      return res.status(400).json({ error: "Invalid verification token type" });
    }

    // Find the user with this verification token
    const result = await pool.query(
      "SELECT * FROM users WHERE id = $1 AND verification_token = $2",
      [decoded.userId, token]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ error: "Invalid or expired verification token" });
    }

    // Update role and profile info
    const updated = await pool.query(
      `UPDATE users 
       SET role = $1,
           full_name = COALESCE($2, full_name),
           department = COALESCE($3, department),
           contact_number = COALESCE($4, contact_number),
           verification_token = NULL,
           email_verified = true
       WHERE id = $5
       RETURNING id, email, full_name, role, department, contact_number`,
      [
        decoded.newRole,
        decoded.fullName,
        decoded.department,
        decoded.contactNumber,
        decoded.userId
      ]
    );

    // Generate new JWT with updated role
    const updatedUser = updated.rows[0];
    const newToken = jwt.sign(
      { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role },
      process.env.JWT_SECRET
    );

    // Redirect to admin dashboard with status=email-changed for modal/logout
    if (process.env.FRONTEND_URL) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/admin-dashboard?status=email-changed`
      );
    }

    res.json({
      message: "Role updated successfully",
      user: updatedUser,
      token: newToken
    });
  } catch (err) {
    console.error("Role update verification failed:", err);
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ error: "Verification link has expired" });
    }
    res.status(400).json({ error: "Invalid verification token" });
  }
});

export default router;