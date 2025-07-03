import express from "express";
import { apiConfig } from "./config.js";

const app = express();
const PORT = 8080;

app.use(express.json());
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
app.post("/admin/reset", (_, res) => {
  apiConfig.fileserverHits = 0;
  res.write("Hits reset to 0");
  res.end();
});

app.post("/api/validate_chirp", (req, res) => {
  type parameters = {
    body: string;
  };
  type responseData = {
    valid: boolean | undefined;
    error: string | undefined;
  };
  const resBody: responseData = {
    error: "",
    valid: false,
  };

  const params: parameters = req.body;
  try {
    if (params.body.length > 140) {
      resBody.error = "Chirp is too long";
      resBody.valid = false;
      const jsonBody = JSON.stringify(resBody);
      res.status(400).send(jsonBody);
    } else {
      resBody.error = "";
      resBody.valid = true;
      res.status(200).send(JSON.stringify(resBody));
    }
    res.end();
  } catch (error) {
    if (error) {
      resBody.error = "Something went wrong";
      const jsonBody = JSON.stringify(resBody);
      res.status(400).send(jsonBody);
    }
  }
  // req.on("data", (chunk) => {
  //   body += chunk;
  // });

  // res.header("Content-type", "application/json");
  // req.on("end", () => {
  //   try {
  //     const parsedBody = JSON.parse(body);

  //     if (parsedBody.body.length > 140) {
  //       resBody.error = "Chirp is too long";
  //       resBody.valid = false;
  //       const jsonBody = JSON.stringify(resBody);
  //       res.status(400).send(jsonBody);
  //     } else {
  //       resBody.error = "";
  //       resBody.valid = true;
  //       res.status(200).send(JSON.stringify(resBody));
  //     }
  //     res.end();
  //   } catch (error) {
  //     if (error) {
  //       resBody.error = "Something went wrong";
  //       const jsonBody = JSON.stringify(resBody);
  //       res.status(400).send(jsonBody);
  //     }
  //   }
  // });
});

app.listen(PORT, (e) => {
  console.log(e);
  console.log(`Server is running at http://localhost:${PORT}`);
});
