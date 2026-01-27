import pool from "../db.js";

export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      "SELECT * FROM user_profiles WHERE user_id = $1",
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { full_name, department, contact_number, profile_picture, id_number } = req.body;

    const result = await pool.query(
      `UPDATE user_profiles
       SET full_name=$1, department=$2, contact_number=$3, profile_picture=$4, id_number=$5, updated_at=NOW()
       WHERE user_id=$6 RETURNING *`,
      [full_name, department, contact_number, profile_picture, id_number, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
