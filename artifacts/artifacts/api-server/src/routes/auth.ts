import { Router, type IRouter } from "express";
import {
  AdminLoginBody,
  AdminLoginResponse,
  AdminLogoutResponse,
  GetAuthStatusResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/login", async (req, res) => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request" });
  }

  const { password } = parsed.data;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || password !== adminPassword) {
    return res.status(401).json({ error: "Invalid password" });
  }

  (req.session as any).isAdmin = true;
  const response = AdminLoginResponse.parse({
    success: true,
    message: "Login successful",
  });
  res.json(response);
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    const response = AdminLogoutResponse.parse({
      success: true,
      message: "Logged out",
    });
    res.json(response);
  });
});

router.get("/me", (req, res) => {
  const authenticated = !!(req.session as any)?.isAdmin;
  const response = GetAuthStatusResponse.parse({ authenticated });
  res.json(response);
});

export default router;
