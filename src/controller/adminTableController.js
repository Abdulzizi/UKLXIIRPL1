import db from "../db.js";

// Create a new table
export const createTable = async (req, res) => {
  const tables = req.body; // langsung ambil data sebagai array

  // cek apakah array atau hanya ada satu object
  if (!Array.isArray(tables) || tables.length === 0) {
    return res.status(400).json({
      message: "Request body must be an array of one or more tables.",
    });
  }

  // validasi setiap table entry
  for (const table of tables) {
    const { number, capacity, status } = table;

    if (!number || typeof number !== "number" || number <= 0) {
      return res.status(400).json({
        message: `Table number is required and must be a positive integer for all entries.`,
      });
    }
    if (!capacity || typeof capacity !== "number" || capacity <= 0) {
      return res.status(400).json({
        message: `Capacity is required and must be a positive number for all entries.`,
      });
    }
    if (!status || !["AVAILABLE", "RESERVED", "OCCUPIED"].includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Valid values are AVAILABLE, RESERVED, or OCCUPIED for all entries.`,
      });
    }
  }

  try {
    // create tables
    const newTables = await db.table.createMany({
      data: tables.map((table) => ({
        number: table.number,
        capacity: table.capacity,
        status: table.status,
      })),
    });

    return res.status(201).json({
      message: `${newTables.count} table(s) created successfully`,
      tables: tables,
    });
  } catch (error) {
    console.error(`[CREATE_TABLE_ERROR] ${error.message}`, error); // Error internal tracking
    return res.status(500).json({
      error: "Failed to create table(s). Please try again later.",
      details: error.message, // Error details
    });
  }
};

// Get all tables
export const getTables = async (req, res) => {
  try {
    const tables = await db.table.findMany({
      orderBy: {
        id: "asc",
      },
    });

    if (tables.length === 0) {
      return res.status(404).json({ error: "Table's not found" });
    }
    res.status(200).json(tables);
  } catch (error) {
    console.error(`[GET_TABLES] ${error.message}`);
    res.status(500).json({ error: "Failed to retrieve tables" });
  }
};

// Get a single table by ID
export const getTableById = async (req, res) => {
  const { id } = req.params;

  // validasi id
  if (!id || isNaN(id)) {
    return res.status(400).json({ message: "Valid table ID is required." });
  }

  try {
    // fetch data dengan id yang diberikan
    const table = await db.table.findUnique({
      where: { id: Number(id) },
    });

    // cek apakah table ditemukan
    if (!table) {
      return res.status(404).json({ message: "Table not found." });
    }

    // return data yang ada di db
    return res.status(200).json(table);
  } catch (error) {
    // error for internal tracking
    console.error(`[GET_TABLE_BY_ID_ERROR] ${error.message}`, error);

    // Return a 500 error response
    return res.status(500).json({
      error: "Failed to retrieve table. Please try again later.",
      details: error.message, // err details
    });
  }
};

// Update a table
export const updateTable = async (req, res) => {
  const { id } = req.params; // Mengambil ID tabel dari parameter
  const { name, capacity, status } = req.body;

  // Validasi ID merupakan angka
  if (!id || isNaN(id)) {
    return res.status(400).json({ message: "Valid table ID is required." });
  }

  // Validasi status jika diberikan
  if (status && !["AVAILABLE", "RESERVED", "OCCUPIED"].includes(status)) {
    return res.status(400).json({
      message:
        "Invalid status. Valid values are AVAILABLE, RESERVED, or OCCUPIED.",
    });
  }

  try {
    // Memperbarui berdasarkan ID
    const updatedTable = await db.table.update({
      where: { id: Number(id) },
      data: {
        name: name ?? undefined, // Mengupdate nama jika diberikan
        capacity: capacity ?? undefined, // Mengupdate kapasitas jika diberikan
        status: status ?? undefined, // Mengupdate status jika diberikan
      },
    });

    // cek apakah table ada
    if (!updatedTable) {
      return res.status(404).json({ message: "Table not found." });
    }

    // return table yang diupdate
    res.status(200).json(updatedTable);
  } catch (error) {
    console.error(`[UPDATE_TABLE] ${error.message}`);

    res
      .status(500)
      .json({ error: "Failed updating table. Please try again later." });
  }
};

// Delete a table
export const deleteTable = async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ message: "Valid table ID is required." });
  }

  try {
    const deletedTable = await db.table.delete({
      where: { id: Number(id) },
    });

    res
      .status(200)
      .json({ message: "Table deleted successfully", deletedTable });
  } catch (error) {
    console.error(`[DELETE_TABLE] ${error.message}`);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Table not found." });
    }
    res
      .status(500)
      .json({ error: "Failed to delete table. Please try again later." });
  }
};
