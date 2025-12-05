import type { Express } from "express";
import { type Server } from "http";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Simple health check for your backend to verify the frontend is running
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Frontend is running. Connect your backend here!" });
  });

  return httpServer;
}
