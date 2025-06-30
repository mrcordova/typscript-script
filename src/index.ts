import express from "express";
import path from "path";

const app = express();
const PORT = 8080;

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
app.use("/app", express.static("./src/app"));
app.use(middlewareLogResponses);

app.get("/healthz", (_, res: express.Response) => {
  res.set("Content-Type", "text/plain;charset=utf-8");
  res.status(200).send("OK");
  res.end();
});

app.listen(PORT, (e) => {
  console.log(e);
  console.log(`Server is running at http://localhost:${PORT}`);
});
