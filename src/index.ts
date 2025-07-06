import express, { NextFunction } from "express";
import { apiConfig } from "./config.js";

const app = express();
const PORT = 8080;
const forbiddenWords = ["kerfuffle", "sharbert", "fornax"];

class BadRequest extends Error {
  constructor(message: string) {
    super(message);
  }
}

class Unauthorized extends Error {
  constructor(message: string) {
    super(message);
  }
}

class Forbidden extends Error {
  constructor(message: string) {
    super(message);
  }
}

class NotFound extends Error {
  constructor(message: string) {
    super(message);
  }
}

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

function errorHandler(
  err: Error,
  req: express.Request,
  res: express.Response,
  next: NextFunction
) {
  // console.error(`${err}`);
  if (err instanceof BadRequest) {
    res.status(400).json({ error: err.message });
  } else {
    res.status(500).json({ error: "Internal Server Error" });
  }
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

app.post("/api/validate_chirp", (req, res, next) => {
  type parameters = {
    body: string;
  };
  type responseData = {
    cleanedBody: string | undefined;
    error: string | undefined;
  };
  const resBody: responseData = {
    error: "",
    cleanedBody: "",
  };

  const params: parameters = req.body;
  try {
    if (params.body.length > 140) {
      next(new BadRequest("Chirp is too long. Max length is 140"));
    } else {
      resBody.error = "";

      for (const word of params.body.split(" ")) {
        if (forbiddenWords.includes(word.toLowerCase())) {
          resBody.cleanedBody += "**** ";
        } else {
          resBody.cleanedBody += `${word} `;
        }
      }
      resBody.cleanedBody = resBody.cleanedBody?.trim();

      res.status(200).send(JSON.stringify(resBody));
    }
    res.end();
  } catch (error) {
    if (error) {
      next(error);
    }
  }
});
app.use(errorHandler);
app.listen(PORT, (e) => {
  console.log(e);
  console.log(`Server is running at http://localhost:${PORT}`);
});
