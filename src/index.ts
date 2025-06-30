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

app.get("/healthz", (_, res: express.Response) => {
  res.set("Content-Type", "text/plain;charset=utf-8");
  res.status(200).send("Hello ");
  res.end();
});

app.get("/metrics", (req: express.Request, res: express.Response) => {
  res.send(`Hits: ${apiConfig.fileserverHits}`);
  res.end();
});
app.get("/reset", (_, res) => {
  apiConfig.fileserverHits = 0;
  res.write("Hits reset to 0");
  res.end();
});

app.listen(PORT, (e) => {
  console.log(e);
  console.log(`Server is running at http://localhost:${PORT}`);
});
