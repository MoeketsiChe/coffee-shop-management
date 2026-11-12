
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Redis } from "@upstash/redis";

dotenv.config();

const app = express();
const redis = Redis.fromEnv();

app.use(cors());
app.use(express.json({ limit: "20kb" }));

const PORT = process.env.PORT || 5000;

const MENU_KEY = "kofi:menu";
const ORDERS_KEY = "kofi:orders";

const STAFF_USERNAME = process.env.STAFF_USERNAME;
const STAFF_PASSWORD_HASH = process.env.STAFF_PASSWORD_HASH;
const JWT_SECRET = process.env.JWT_SECRET;

const ORDER_STATUSES = [
  "Pending",
  "Preparing",
  "Ready",
  "Collected"
];

const defaultMenu = [
  {
    id: "1",
    name: "Espresso",
    category: "Coffee",
    description: "Strong and rich Italian coffee.",
    price: 25,
    available: true,
    imageUrl: ""
  },
  {
    id: "2",
    name: "Cappuccino",
    category: "Coffee",
    description: "Espresso with steamed milk and foam.",
    price: 35,
    available: true,
    imageUrl: ""
  },
  {
    id: "3",
    name: "Iced Latte",
    category: "Cold Drinks",
    description: "Chilled milk mixed with espresso.",
    price: 40,
    available: true,
    imageUrl: ""
  },
  {
    id: "4",
    name: "Chocolate Muffin",
    category: "Bakery",
    description: "Freshly baked chocolate muffin.",
    price: 20,
    available: true,
    imageUrl: ""
  }
];

// DATABASE INITIALIZATION

async function initializeDatabase() {
  const existingMenu = await redis.get(MENU_KEY);

  if (!existingMenu) {
    await redis.set(MENU_KEY, defaultMenu);
    console.log("Default menu saved to Redis.");
  }

  console.log("Redis database connected.");
}

// IMAGE URL VALIDATION

function isValidImageUrl(value) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return true;
  }

  if (
    typeof value !== "string" ||
    value.length > 2048
  ) {
    return false;
  }

  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" ||
      url.protocol === "http:"
    );
  } catch {
    return false;
  }
}

// STAFF AUTHENTICATION

function authenticateStaff(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Staff login required."
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (
      decoded.role !== "staff" ||
      decoded.username !== STAFF_USERNAME
    ) {
      return res.status(403).json({
        message: "Staff access denied."
      });
    }

    req.staff = decoded;
    next();
  } catch {
    return res.status(401).json({
      message: "Your login session is invalid or expired."
    });
  }
}

// ORDER HELPERS

async function getAllOrders() {
  const orderIds = await redis.lrange(ORDERS_KEY, 0, -1);

  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    return [];
  }

  const orders = await Promise.all(
    orderIds.map(async (id) => {
      return await redis.get(`kofi:order:${id}`);
    })
  );

  return orders
    .filter(Boolean)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );
}

async function findOrder(identifier) {
  let orderId = identifier;

  if (identifier.startsWith("KC-")) {
    orderId = await redis.get(
      `kofi:order-number:${identifier}`
    );
  }

  if (!orderId) {
    return null;
  }

  return await redis.get(`kofi:order:${orderId}`);
}

// DATE HELPERS

function getLesothoDate(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Maseru",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);

  const values = {};

  for (const part of parts) {
    values[part.type] = part.value;
  }

  return `${values.year}-${values.month}-${values.day}`;
}

function isValidDateString(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T12:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

// STAFF LOGIN

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !STAFF_USERNAME ||
      !STAFF_PASSWORD_HASH ||
      !JWT_SECRET
    ) {
      return res.status(400).json({
        message: "Invalid login details."
      });
    }

    const usernameMatches = username === STAFF_USERNAME;

    const passwordMatches = await bcrypt.compare(
      password,
      STAFF_PASSWORD_HASH
    );

    if (!usernameMatches || !passwordMatches) {
      return res.status(401).json({
        message: "Incorrect username or password."
      });
    }

    const token = jwt.sign(
      {
        username: STAFF_USERNAME,
        role: "staff"
      },
      JWT_SECRET,
      {
        expiresIn: "8h"
      }
    );

    res.json({
      message: "Staff login successful.",
      token,
      username: STAFF_USERNAME
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Unable to log in."
    });
  }
});

// HEALTH CHECK

app.get("/api/health", async (req, res) => {
  try {
    await redis.ping();

    res.json({
      message: "Kofi & CO API is running!",
      status: "OK",
      database: "Connected"
    });
  } catch (error) {
    res.status(503).json({
      message: "Database connection failed.",
      status: "ERROR"
    });
  }
});

// GET ALL MENU ITEMS

app.get("/api/menu", async (req, res) => {
  try {
    const menuItems = await redis.get(MENU_KEY);

    res.json(menuItems || []);
  } catch (error) {
    console.error("Get menu error:", error);

    res.status(500).json({
      message: "Could not retrieve menu."
    });
  }
});

// GET ONE MENU ITEM

app.get("/api/menu/:id", async (req, res) => {
  try {
    const menuItems = await redis.get(MENU_KEY) || [];

    const item = menuItems.find(
      product => product.id === req.params.id
    );

    if (!item) {
      return res.status(404).json({
        message: "Product not found."
      });
    }

    res.json(item);
  } catch (error) {
    console.error("Get product error:", error);

    res.status(500).json({
      message: "Could not retrieve product."
    });
  }
});

// ADD MENU ITEM - STAFF ONLY

app.post("/api/menu", authenticateStaff, async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      price,
      available,
      imageUrl
    } = req.body;

    if (
      typeof name !== "string" ||
      name.trim().length < 2 ||
      typeof category !== "string" ||
      !category.trim() ||
      typeof description !== "string" ||
      typeof price !== "number" ||
      !Number.isFinite(price) ||
      price <= 0 ||
      (available !== undefined && typeof available !== "boolean") ||
      !isValidImageUrl(imageUrl)
    ) {
      return res.status(400).json({
        message: "Please provide valid product details."
      });
    }

    const menuItems = await redis.get(MENU_KEY) || [];

    const newItem = {
      id: randomUUID(),
      name: name.trim(),
      category: category.trim(),
      description: description.trim(),
      price,
      available: available ?? true,
      imageUrl: imageUrl?.trim() || ""
    };

    menuItems.push(newItem);

    await redis.set(MENU_KEY, menuItems);

    res.status(201).json({
      message: "Menu item added successfully.",
      item: newItem
    });
  } catch (error) {
    console.error("Add menu item error:", error);

    res.status(500).json({
      message: "Could not add menu item."
    });
  }
});

// UPDATE MENU ITEM - STAFF ONLY

app.put("/api/menu/:id", authenticateStaff, async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      price,
      available,
      imageUrl
    } = req.body;

    if (
      typeof name !== "string" ||
      name.trim().length < 2 ||
      typeof category !== "string" ||
      !category.trim() ||
      typeof description !== "string" ||
      typeof price !== "number" ||
      !Number.isFinite(price) ||
      price <= 0 ||
      typeof available !== "boolean" ||
      !isValidImageUrl(imageUrl)
    ) {
      return res.status(400).json({
        message: "Please provide valid product details."
      });
    }

    const menuItems = await redis.get(MENU_KEY) || [];

    const index = menuItems.findIndex(
      item => item.id === req.params.id
    );

    if (index === -1) {
      return res.status(404).json({
        message: "Menu item not found."
      });
    }

    const updatedItem = {
      id: req.params.id,
      name: name.trim(),
      category: category.trim(),
      description: description.trim(),
      price,
      available,
      imageUrl:
        imageUrl === undefined
          ? menuItems[index].imageUrl || ""
          : typeof imageUrl === "string"
            ? imageUrl.trim()
            : ""
    };

    menuItems[index] = updatedItem;

    await redis.set(MENU_KEY, menuItems);

    res.json({
      message: "Menu item updated successfully.",
      item: updatedItem
    });
  } catch (error) {
    console.error("Update menu item error:", error);

    res.status(500).json({
      message: "Could not update menu item."
    });
  }
});

// DELETE MENU ITEM - STAFF ONLY

app.delete("/api/menu/:id", authenticateStaff, async (req, res) => {
  try {
    const menuItems = await redis.get(MENU_KEY) || [];

    const existingItem = menuItems.find(
      item => item.id === req.params.id
    );

    if (!existingItem) {
      return res.status(404).json({
        message: "Menu item not found."
      });
    }

    const updatedMenu = menuItems.filter(
      item => item.id !== req.params.id
    );

    await redis.set(MENU_KEY, updatedMenu);

    res.json({
      message: "Menu item deleted successfully."
    });
  } catch (error) {
    console.error("Delete menu item error:", error);

    res.status(500).json({
      message: "Could not delete menu item."
    });
  }
});

// CREATE CUSTOMER ORDER

app.post("/api/orders", async (req, res) => {
  try {
    const { customer, items } = req.body;

    if (
      !customer ||
      typeof customer.name !== "string" ||
      customer.name.trim().length < 2 ||
      typeof customer.phone !== "string" ||
      !/^[0-9+\s()-]{8,20}$/.test(customer.phone.trim())
    ) {
      return res.status(400).json({
        message: "Valid customer name and phone number are required."
      });
    }

    if (
      customer.email !== undefined &&
      customer.email !== "" &&
      (
        typeof customer.email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())
      )
    ) {
      return res.status(400).json({
        message: "Please provide a valid email address."
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Your order must contain at least one product."
      });
    }

    const menuItems = await redis.get(MENU_KEY) || [];
    const orderItems = [];

    for (const requestedItem of items) {
      const product = menuItems.find(
        item => item.id === requestedItem.id
      );

      const quantity = requestedItem.quantity;

      if (
        !product ||
        !product.available ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 50
      ) {
        return res.status(400).json({
          message: "An order item is invalid or unavailable."
        });
      }

      orderItems.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        subtotal: product.price * quantity
      });
    }

    const total = orderItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );

    const order = {
      id: randomUUID(),
      orderNumber: `KC-${randomUUID().slice(0, 8).toUpperCase()}`,
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        email: customer.email?.trim() || ""
      },
      items: orderItems,
      total,
      status: "Pending",
      createdAt: new Date().toISOString()
    };

    await redis.set(`kofi:order:${order.id}`, order);

    await redis.set(
      `kofi:order-number:${order.orderNumber}`,
      order.id
    );

    await redis.lpush(ORDERS_KEY, order.id);

    res.status(201).json({
      message: "Order placed successfully.",
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        items: order.items,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error("Order creation error:", error);

    res.status(500).json({
      message: "Could not place your order."
    });
  }
});

// STAFF: GET ALL CUSTOMER ORDERS

app.get("/api/orders", authenticateStaff, async (req, res) => {
  try {
    const orders = await getAllOrders();

    res.json({
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error("Get orders error:", error);

    res.status(500).json({
      message: "Could not retrieve customer orders."
    });
  }
});

// STAFF: UPDATE ORDER STATUS

app.patch(
  "/api/orders/:id/status",
  authenticateStaff,
  async (req, res) => {
    try {
      const { status } = req.body;

      if (!ORDER_STATUSES.includes(status)) {
        return res.status(400).json({
          message: "Invalid order status.",
          allowedStatuses: ORDER_STATUSES
        });
      }

      const order = await findOrder(req.params.id);

      if (!order) {
        return res.status(404).json({
          message: "Order not found."
        });
      }

      order.status = status;
      order.updatedAt = new Date().toISOString();

      await redis.set(`kofi:order:${order.id}`, order);

      res.json({
        message: "Order status updated successfully.",
        order
      });
    } catch (error) {
      console.error("Update order status error:", error);

      res.status(500).json({
        message: "Could not update order status."
      });
    }
  }
);

// STAFF: DAILY SALES SUMMARY

app.get(
  "/api/reports/daily",
  authenticateStaff,
  async (req, res) => {
    try {
      const date = req.query.date || getLesothoDate(new Date());

      if (
        typeof date !== "string" ||
        !isValidDateString(date)
      ) {
        return res.status(400).json({
          message: "Date must use YYYY-MM-DD format."
        });
      }

      const allOrders = await getAllOrders();

      const dailyOrders = allOrders.filter(
        order => getLesothoDate(order.createdAt) === date
      );

      const statusCounts = {
        Pending: 0,
        Preparing: 0,
        Ready: 0,
        Collected: 0
      };

      const productSummary = {};

      let totalRevenue = 0;
      let collectedRevenue = 0;
      let totalItemsSold = 0;

      for (const order of dailyOrders) {
        totalRevenue += Number(order.total) || 0;

        if (statusCounts[order.status] !== undefined) {
          statusCounts[order.status]++;
        }

        if (order.status === "Collected") {
          collectedRevenue += Number(order.total) || 0;
        }

        for (const item of order.items || []) {
          const quantity = Number(item.quantity) || 0;
          const subtotal = Number(item.subtotal) || 0;

          totalItemsSold += quantity;

          if (!productSummary[item.id]) {
            productSummary[item.id] = {
              id: item.id,
              name: item.name,
              quantitySold: 0,
              revenue: 0
            };
          }

          productSummary[item.id].quantitySold += quantity;
          productSummary[item.id].revenue += subtotal;
        }
      }

      const popularProducts = Object.values(productSummary)
        .sort((a, b) => b.quantitySold - a.quantitySold);

      res.json({
        date,
        currency: "LSL",
        totalOrders: dailyOrders.length,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        collectedRevenue: Number(collectedRevenue.toFixed(2)),
        totalItemsSold,
        statusCounts,
        popularProducts
      });
    } catch (error) {
      console.error("Daily report error:", error);

      res.status(500).json({
        message: "Could not generate daily sales report."
      });
    }
  }
);

// TRACK CUSTOMER ORDER

app.get("/api/orders/:id", async (req, res) => {
  try {
    const order = await findOrder(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found."
      });
    }

    res.json({
      orderNumber: order.orderNumber,
      items: order.items,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt
    });
  } catch (error) {
    console.error("Track order error:", error);

    res.status(500).json({
      message: "Could not track order."
    });
  }
});

// START SERVER

async function startServer() {
  if (!STAFF_USERNAME || !STAFF_PASSWORD_HASH || !JWT_SECRET) {
    throw new Error(
      "Missing staff authentication settings in backend/.env"
    );
  }

  await initializeDatabase();

  app.listen(PORT, () => {
    console.log(`Kofi & CO server running on port ${PORT}`);
  });
}

startServer().catch(error => {
  console.error("Server startup failed:", error.message);
  process.exit(1);
});
