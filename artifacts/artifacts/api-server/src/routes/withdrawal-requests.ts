import { Router, type IRouter } from "express";
import { WithdrawalRequestModel, UserModel } from "../lib/models.js";
import { requireAdmin } from "../lib/auth.js";

const router: IRouter = Router();

function serializeReq(r: any) {
  return {
    id: r._id.toString(),
    userId: r.userId,
    userSlug: r.userSlug,
    requestedAmount: r.requestedAmount,
    feeAmount: r.feeAmount,
    status: r.status,
    createdAt: r.createdAt?.toISOString(),
    updatedAt: r.updatedAt?.toISOString(),
  };
}

router.get("/users/:slug/withdrawal-request", async (req, res) => {
  try {
    const user = await UserModel.findOne({ slug: req.params.slug });
    if (!user) return res.status(404).json({ error: "User not found" });

    const existing = await WithdrawalRequestModel.findOne({
      userSlug: req.params.slug,
    }).sort({ createdAt: -1 });

    res.json(existing ? serializeReq(existing) : null);
  } catch (err: any) {
    res.status(500).json({ error: "Database error: " + err.message });
  }
});

router.post("/users/:slug/withdrawal-request", async (req, res) => {
  try {
    const user = await UserModel.findOne({ slug: req.params.slug });
    if (!user) return res.status(404).json({ error: "User not found" });

    const { requestedAmount } = req.body;
    if (!requestedAmount || requestedAmount <= 0) {
      return res.status(400).json({ error: "Invalid withdrawal amount" });
    }
    if (requestedAmount > user.eligibleBalance) {
      return res.status(400).json({ error: "Amount exceeds eligible balance" });
    }

    await WithdrawalRequestModel.deleteMany({ userSlug: req.params.slug, status: "pending" });

    const wr = await WithdrawalRequestModel.create({
      userId: user._id.toString(),
      userSlug: req.params.slug,
      requestedAmount,
      feeAmount: user.withdrawalFeeEth,
      status: "pending",
    });

    res.status(201).json(serializeReq(wr));
  } catch (err: any) {
    res.status(500).json({ error: "Database error: " + err.message });
  }
});

router.get("/admin/withdrawal-requests", requireAdmin, async (req, res) => {
  try {
    const requests = await WithdrawalRequestModel.find().sort({ createdAt: -1 });
    const enriched = await Promise.all(
      requests.map(async (r) => {
        const user = await UserModel.findOne({ slug: r.userSlug });
        return {
          ...serializeReq(r),
          userName: user?.name || r.userSlug,
        };
      })
    );
    res.json(enriched);
  } catch (err: any) {
    res.status(500).json({ error: "Database error: " + err.message });
  }
});

router.put("/admin/withdrawal-requests/:requestId/verify", requireAdmin, async (req, res) => {
  try {
    const wr = await WithdrawalRequestModel.findByIdAndUpdate(
      req.params.requestId,
      { $set: { status: "verified" } },
      { new: true }
    );
    if (!wr) return res.status(404).json({ error: "Request not found" });
    res.json(serializeReq(wr));
  } catch (err: any) {
    res.status(500).json({ error: "Database error: " + err.message });
  }
});

router.put("/admin/withdrawal-requests/:requestId/reject", requireAdmin, async (req, res) => {
  try {
    const wr = await WithdrawalRequestModel.findByIdAndUpdate(
      req.params.requestId,
      { $set: { status: "rejected" } },
      { new: true }
    );
    if (!wr) return res.status(404).json({ error: "Request not found" });
    res.json(serializeReq(wr));
  } catch (err: any) {
    res.status(500).json({ error: "Database error: " + err.message });
  }
});

export default router;
