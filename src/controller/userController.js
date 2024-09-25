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

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    // Hashing password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "ADMIN", // Admin default jika tidak di provide
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
  const isPasswordValid = await bcrypt.compare(password, user.password);

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

// Delete user (ADMIN only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the ID is valid and exists
    const user = await db.user.findUnique({
      where: { id: parseInt(id) },
    });

    // If user doesn't exist, return 404
    if (!user) {
      return res.status(404).json({ message: `User with id ${id} not found` });
    }

    // If user exists, delete the user
    await db.user.delete({ where: { id: parseInt(id) } });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(`[DELETE_USER] ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Update a user (PATCH/PUT)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    // Find the user
    const user = await db.user.findUnique({ where: { id: parseInt(id) } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields
    const updatedUser = await db.user.update({
      where: { id: parseInt(id) },
      data: {
        name: name || user.name,
        email: email || user.email,
        password: password
          ? await bcrypt.hash(toString(password), 10)
          : user.password,
        role: role || user.role,
      },
    });

    res.status(200).json({ message: "User updated successfully", updatedUser });
  } catch (error) {
    console.error(`[UPDATE_USER] ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};
