import db from "../db.js";

// Create menu item
export const createMenuItem = async (req, res) => {
  let items = Array.isArray(req.body) ? req.body : [req.body];

  if (items.length === 0) {
    return res.status(400).json({
      message: "Request body must contain one or more menu item entries.",
    });
  }

  try {
    // Create menu items
    const newItems = await db.menuItem.createMany({
      data: items,
    });

    return res.status(201).json({
      message: `${newItems.count} menu item(s) created successfully`,
      items,
    });
  } catch (error) {
    console.error(`[CREATE_MENU_ITEM_ERROR] ${error.message}`, error);
    if (error.code === "P2002") {
      // Unique constraint violation
      return res.status(400).json({
        error: `Unique constraint failed on the fields: ${error.meta.target.join(
          ", "
        )}`,
      });
    }
    return res.status(500).json({
      error: "Failed to create menu item(s). Please try again later.",
      details: error.message,
    });
  }
};

// Get all menu items
export const getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await db.menuItem.findMany({
      orderBy: {
        id: "asc",
      },
    });
    if (menuItems.length === 0) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    res.status(200).json(menuItems);
  } catch (error) {
    console.error(`[GET_ALL_MENU_ITEMS] ${error.message}`);
    res.status(500).json({ error: "Failed to get menu items" });
  }
};

export const getMenuById = async (req, res) => {
  const { id } = req.params;

  // validasi id adalah number
  if (!id || isNaN(id)) {
    return res.status(400).json({ message: "Valid menu item ID is required." });
  }

  try {
    // fetch menu dengan id
    const menuItem = await db.menuItem.findUnique({
      where: { id: Number(id) },
    });

    // cek apakah menunya ada
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found." });
    }

    // Return the found menu item
    return res.status(200).json(menuItem);
  } catch (error) {
    console.error(`[GET_MENU_BY_ID_ERROR] ${error.message}`, error); // error internal tracking
    return res.status(500).json({
      error: "Failed to retrieve menu item. Please try again later.",
      details: error.message, // err details
    });
  }
};

// Update menu items
export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price } = req.body;

    // Validate the id
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Invalid menu item id" });
    }

    // at least 1 field diisi
    if (
      name === undefined &&
      description === undefined &&
      price === undefined
    ) {
      return res
        .status(400)
        .json({ error: "At least one field must be provided to update" });
    }

    // cari itemnya terlebih dahulu dengan id
    const existingItem = await db.menuItem.findUnique({
      where: { id: Number(id) },
    });

    if (!existingItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    // updating menu
    const updatedItem = await db.menuItem.update({
      where: { id: Number(id) },
      data: {
        name: name ?? undefined,
        description: description ?? undefined,
        price: price ?? undefined,
      },
    });

    res
      .status(200)
      .json({ message: "Menu item updated successfully", updatedItem });
  } catch (error) {
    console.error(
      `[UPDATE_MENU_ITEM] Error updating menu item with id ${req.params.id}: ${error.message}`
    );
    res
      .status(500)
      .json({ error: "Internal server error. Failed to update menu item" });
  }
};

// delete menu item
export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const menu = await db.menuItem.findUnique({ where: { id: Number(id) } });

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Valid ID is required." });
    }

    if (!menu) {
      return res.status(404).json({ message: `menu with id ${id} not found` });
    }

    const deletedMenu = await db.menuItem.delete({ where: { id: Number(id) } });

    res.status(200).json({
      message: `Item with id ${id} deleted successfully`,
      deletedMenu,
    });
  } catch (error) {
    console.error(`[DELETE_MENU_ITEMS] ${error.message}`);
    res.status(500).json({ error: "Failed to get menu items" });
  }
};
