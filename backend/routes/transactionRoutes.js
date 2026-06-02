const express = require("express");
const multer = require("multer");
const rateLimit = require("express-rate-limit");
const {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getMonthlySummary,
  deleteAllTransactions,
} = require("../controllers/transactionController");
const { scanBill } = require("../controllers/scanController");
const authenticateUser = require("../middleware/authenticateUser");

const router = express.Router();

// Receipt images are held in memory (max 5 MB) and never written to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) return cb(null, true);
    cb(new Error("Only image files are allowed"));
  },
});

// Scanning calls an external AI API with quota, so cap it tighter than the
// global limiter to protect the quota from a single abusive client.
const scanLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { message: "Too many scan attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/v1/transactions - Add an transaction
router.post("/", authenticateUser, createTransaction);

// GET /api/v1/transactions - Get all transactions
router.get("/", authenticateUser, getTransactions);

// GET /api/v1/transactions/monthly-summary
router.get("/monthly-summary", authenticateUser, getMonthlySummary); // must be before /:id route, otherwise express treats 'monthly-summary' as an id

// POST /api/v1/transactions/scan - Extract transaction details from a bill image
router.post(
  "/scan",
  authenticateUser,
  scanLimiter,
  upload.single("bill"),
  scanBill,
); // also before /:id

// GET /api/v1/transactions/:id - Get a transaction by ID
router.get("/:id", authenticateUser, getTransactionById);

// PUT /api/v1/transactions/:id - Update an transaction
router.put("/:id", authenticateUser, updateTransaction);

// DELETE /api/v1/transactions/:id - Delete an transaction
router.delete("/:id", authenticateUser, deleteTransaction);

router.delete("/", authenticateUser, deleteAllTransactions);

module.exports = router;
