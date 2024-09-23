import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import db from "../db.js";

export const showAllUsers = async (req, res) => {
  try {
    const users = await db.user.findMany();
    res.json(users);
  } catch (error) {
    console.error(`[SHOW_ALL_USERS] ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Get a single user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await db.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(`[GET_USER_BY_ID] ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Register/Create new user(POST)
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // console.log("Incoming request body:", req.body);

    // Fix: Proper validation check for required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
t5
    // Hashing password
    const hashedPassword = await bcrypt.hash(toString(password), 10);

    // Create new user
    const newUser = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "ADMIN", // Default role if not provided
      },
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error(`[REGISTER_USER] ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  // console.log(req.body);

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = await db.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Checking pw
  const isPasswordValid = await bcrypt.compare(
    toString(password),
    user.password
  );

  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Generate JWT token
  const token = jsonwebtoken.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_TOKEN,
    { expiresIn: "1h" }
  );

  res.status(200).json({
    message: "Login successful",
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
};

// Delete user(ADMIN)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // console.log(req.body);
  } catch (error) {
    console.error(`[DELETE_USER] ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};
