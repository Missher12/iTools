import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import multer from "multer";
import * as xlsx from "xlsx";
import axios from "axios";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Multer setup for Excel uploads
  const storage = multer.memoryStorage();
  const upload = multer({ storage });

  // --- API Routes ---

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Data Cleaning API - Now supports multiple sheets
  app.post("/api/clean-data", upload.single("file"), (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const results: any = {};

      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        // Simple cleaning logic: remove empty rows, trim strings
        const cleanedData = data.map((row: any) => {
          const newRow: any = {};
          for (const key in row) {
            if (typeof row[key] === "string") {
              newRow[key] = row[key].trim();
            } else {
              newRow[key] = row[key];
            }
          }
          return newRow;
        }).filter(row => Object.values(row).some(val => val !== null && val !== ""));

        results[sheetName] = cleanedData;
      });

      res.json({
        message: "Data processed successfully",
        sheets: workbook.SheetNames,
        data: results,
      });
    } catch (error) {
      console.error("Cleaning error:", error);
      res.status(500).json({ error: "Failed to process Excel file" });
    }
  });

  // Ollama Proxy API
  app.post("/api/ai/chat", async (req, res) => {
    const { prompt, model = "llama3", endpoint = "http://localhost:11434" } = req.body;

    try {
      const response = await axios.post(`${endpoint}/api/generate`, {
        model,
        prompt,
        stream: false,
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("Ollama error:", error.message);
      res.status(500).json({ 
        error: "Failed to connect to Ollama", 
        details: error.message,
        hint: "Ensure Ollama is running locally and OLLAMA_ORIGINS is set to allow requests."
      });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
