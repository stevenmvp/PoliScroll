import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { z } from "zod";

dotenv.config({ path: "../../.env" });

const app = express();
const port = Number(process.env.API_PORT ?? 4000);
const jwtSecret = process.env.JWT_SECRET ?? "dev-secret";

app.use(cors());
app.use(express.json());

const tokenSchema = z.object({
  sub: z.string(),
  email: z.string().email(),
  role: z.enum(["admin", "profesor", "estudiante"]),
});

type AuthenticatedUser = {
  sub: string;
  email: string;
  role: "admin" | "profesor" | "estudiante";
};

type AuthenticatedRequest = express.Request & {
  user?: AuthenticatedUser;
};

const requireAuth = (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const payload = jwt.verify(token, jwtSecret) as unknown;
    const parsed = tokenSchema.safeParse(payload);

    if (!parsed.success) {
      return res.status(401).json({ error: "Token inválido" });
    }

    req.user = parsed.data;
    return next();
  } catch {
    return res.status(401).json({ error: "Session invalidada" });
  }
};

app.get("/health", (_, res) => {
  res.json({ ok: true, service: "poliscroll-api" });
});

app.post("/auth/token/issue", (req, res) => {
  const bodySchema = z.object({
    sub: z.string(),
    email: z.string().email(),
    role: z.enum(["admin", "profesor", "estudiante"]),
  });

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Datos inválidos" });
  }

  const token = jwt.sign(parsed.data, jwtSecret, { expiresIn: "12h" });
  return res.json({ token });
});

app.get("/me", requireAuth, (req: AuthenticatedRequest, res) => {
  res.json({
    user: req.user,
    authenticated: true,
  });
});

app.get("/admin/dashboard", requireAuth, (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "No tienes permisos de administrador" });
  }

  return res.json({
    metrics: {
      usuarios: 1240,
      sesiones: 64,
      costoIA: "$1.8K",
      uptime: "99.94%",
    },
  });
});

app.get("/profesor/dashboard", requireAuth, (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "profesor" && req.user?.role !== "admin") {
    return res.status(403).json({ error: "No tienes permisos de profesor" });
  }

  return res.json({
    grupos: [
      { name: "Cálculo I", estudiantes: 28 },
      { name: "Lógica 2", estudiantes: 19 },
    ],
  });
});

app.get("/estudiante/dashboard", requireAuth, (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "estudiante" && req.user?.role !== "admin") {
    return res.status(403).json({ error: "No tienes permisos de estudiante" });
  }

  return res.json({
    racha: "12 días",
    puntaje: 1280,
    nivel: "Bronce",
  });
});

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
