import path from "path";
import express from "express";
import app from "./api/index";

// Serve static assets in production, use Vite middleware in development
async function startServer() {
  if (!process.env.VERCEL) {
    if (process.env.NODE_ENV !== "production") {
      const { createServer: createViteServer } = await import("vite");
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

    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[SERVER] Running at http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
