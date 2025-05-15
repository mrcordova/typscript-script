import express from "express";
import path from "path";

const app = express();
const PORT = 8080;
app.use("/app", express.static("./src/app"));

app.get("/healthz", (_, res) => {
  res.set("Content-Type", "text/plain;charset=utf-8");
  res.status(200).send("OK");
  res.end();
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
