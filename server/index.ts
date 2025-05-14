import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupMiddleware } from "./middleware";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up rate limiting
setupMiddleware(app);

app.use((req: Request, res: Response, next: NextFunction): void => {
  const start: number = Date.now();
  const path: string = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson: any): Response {
    capturedJsonResponse = bodyJson;
    return originalResJson.call(res, bodyJson);
  };

  res.on("finish", (): void => {
    const duration: number = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine: string = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async (): Promise<void> => {
  const server = await registerRoutes(app);

  app.use((err: Error & { status?: number; statusCode?: number }, _req: Request, res: Response, _next: NextFunction): void => {
    const status: number = err.status || err.statusCode || 500;
    const message: string = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port: number = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, (): void => {
    log(`serving on port ${port}`);
  });
})();
