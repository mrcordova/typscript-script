import express from "express";
import { apiConfig } from "./config.js";

const app = express();
const PORT = 8080;

function middlewareMetricsInc(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  // console.log(`Hits: ${APIConfig.fileserverHits}`);
  apiConfig.fileserverHits++;
  next();
}

function middlewareLogResponses(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  res.on("finish", () => {
    if (res.statusCode < 200 || res.statusCode >= 300) {
      console.log(
        `[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`
      );
    }
  });
  next();
}
app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.use(middlewareLogResponses);

app.get("/api/healthz", (_, res: express.Response) => {
  res.set("Content-Type", "text/plain;charset=utf-8");
  res.status(200).send("OK");
  res.end();
});

app.get("/admin/metrics", (req: express.Request, res: express.Response) => {
  res.set("Content-Type", "text/html;charset=utf-8");

  res.status(200).send(`<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${apiConfig.fileserverHits} times!</p>
  </body>
</html>`);
  res.end();
});
app.get("/admin/reset", (_, res) => {
  apiConfig.fileserverHits = 0;
  res.write("Hits reset to 0");
  res.end();
});

app.listen(PORT, (e) => {
  console.log(e);
  console.log(`Server is running at http://localhost:${PORT}`);
});
