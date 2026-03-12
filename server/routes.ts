import type { Express, Request, Response } from "express";
import type { Server } from "http";

export async function registerRoutes(server: Server, app: Express) {
  // No backend routes needed - all data comes from finance API on the frontend
  // The terminal is a purely client-side application that uses the finance tools API
  
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });
}
