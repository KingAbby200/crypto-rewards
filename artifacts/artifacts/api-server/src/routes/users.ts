import { Router, type IRouter } from "express";
import { UserModel } from "../lib/models.js";
import { requireAdmin } from "../lib/auth.js";
import {
  CreateUserBody,
  UpdateUserBody,
  ListUsersResponse,
  GetUserBySlugResponse,
  UpdateUserResponse,
  DeleteUserResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function serializeUser(user: any) {
  return {
    id: user._id.toString(),
    name: user.name,
    slug: user.slug,
    walletAddress: user.walletAddress,
    eligibleBalance: user.eligibleBalance,
    withdrawalFeeEth: user.withdrawalFeeEth,
    feeWalletAddress: user.feeWalletAddress,
    createdAt: user.createdAt?.toISOString(),
    updatedAt: user.updatedAt?.toISOString(),
  };
}

router.get("/", requireAdmin, async (req, res) => {
  try {
    const users = await UserModel.find().sort({ createdAt: -1 });
    const response = ListUsersResponse.parse(users.map(serializeUser));
    res.json(response);
  } catch (err: any) {
    console.error("GET /users error:", err.message);
    res.status(500).json({ error: "Database error: " + err.message });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const parsed = CreateUserBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }

    const slug =
      parsed.data.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "") +
      "-" +
      Date.now().toString(36);

    const user = await UserModel.create({ ...parsed.data, slug });
    res.status(201).json(serializeUser(user));
  } catch (err: any) {
    console.error("POST /users error:", err.message);
    res.status(500).json({ error: "Database error: " + err.message });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const user = await UserModel.findOne({ slug: req.params.slug });
    if (!user) return res.status(404).json({ error: "User not found" });
    const response = GetUserBySlugResponse.parse(serializeUser(user));
    res.json(response);
  } catch (err: any) {
    console.error("GET /users/:slug error:", err.message);
    res.status(500).json({ error: "Database error: " + err.message });
  }
});

router.put("/:slug", requireAdmin, async (req, res) => {
  try {
    const parsed = UpdateUserBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }

    const user = await UserModel.findOneAndUpdate(
      { slug: req.params.slug },
      { $set: parsed.data },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    const response = UpdateUserResponse.parse(serializeUser(user));
    res.json(response);
  } catch (err: any) {
    console.error("PUT /users/:slug error:", err.message);
    res.status(500).json({ error: "Database error: " + err.message });
  }
});

router.delete("/:slug", requireAdmin, async (req, res) => {
  try {
    const user = await UserModel.findOneAndDelete({ slug: req.params.slug });
    if (!user) return res.status(404).json({ error: "User not found" });
    const response = DeleteUserResponse.parse({
      success: true,
      message: "User deleted",
    });
    res.json(response);
  } catch (err: any) {
    console.error("DELETE /users/:slug error:", err.message);
    res.status(500).json({ error: "Database error: " + err.message });
  }
});

export default router;
