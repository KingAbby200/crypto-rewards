import { Router, type IRouter } from "express";
import { UserModel, TransactionModel } from "../lib/models.js";
import { requireAdmin } from "../lib/auth.js";
import {
  CreateTransactionBody,
  UpdateTransactionBody,
  GetUserTransactionsResponse,
  UpdateTransactionResponse,
  DeleteTransactionResponse,
} from "@workspace/api-zod";

const router: IRouter = Router({ mergeParams: true });

function serializeTx(tx: any) {
  return {
    id: tx._id.toString(),
    userId: tx.userId,
    amount: tx.amount,
    type: tx.type,
    status: tx.status,
    txHash: tx.txHash || undefined,
    note: tx.note || undefined,
    date: tx.date?.toISOString ? tx.date.toISOString() : tx.date,
    createdAt: tx.createdAt?.toISOString(),
    updatedAt: tx.updatedAt?.toISOString(),
  };
}

router.get("/", async (req, res) => {
  try {
    const user = await UserModel.findOne({ slug: req.params.slug });
    if (!user) return res.status(404).json({ error: "User not found" });

    const txs = await TransactionModel.find({ userSlug: req.params.slug }).sort(
      { date: -1 }
    );
    const response = GetUserTransactionsResponse.parse(txs.map(serializeTx));
    res.json(response);
  } catch (err: any) {
    console.error("GET transactions error:", err.message);
    res.status(500).json({ error: "Database error: " + err.message });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const user = await UserModel.findOne({ slug: req.params.slug });
    if (!user) return res.status(404).json({ error: "User not found" });

    const parsed = CreateTransactionBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }

    const tx = await TransactionModel.create({
      ...parsed.data,
      userId: user._id.toString(),
      userSlug: req.params.slug,
      date: new Date(parsed.data.date),
    });
    res.status(201).json(serializeTx(tx));
  } catch (err: any) {
    console.error("POST transaction error:", err.message);
    res.status(500).json({ error: "Database error: " + err.message });
  }
});

router.put("/:txId", requireAdmin, async (req, res) => {
  try {
    const user = await UserModel.findOne({ slug: req.params.slug });
    if (!user) return res.status(404).json({ error: "User not found" });

    const parsed = UpdateTransactionBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }

    const updateData: any = { ...parsed.data };
    if (parsed.data.date) updateData.date = new Date(parsed.data.date);

    const tx = await TransactionModel.findByIdAndUpdate(
      req.params.txId,
      { $set: updateData },
      { new: true }
    );
    if (!tx) return res.status(404).json({ error: "Transaction not found" });
    const response = UpdateTransactionResponse.parse(serializeTx(tx));
    res.json(response);
  } catch (err: any) {
    console.error("PUT transaction error:", err.message);
    res.status(500).json({ error: "Database error: " + err.message });
  }
});

router.delete("/:txId", requireAdmin, async (req, res) => {
  try {
    const tx = await TransactionModel.findByIdAndDelete(req.params.txId);
    if (!tx) return res.status(404).json({ error: "Transaction not found" });
    const response = DeleteTransactionResponse.parse({
      success: true,
      message: "Transaction deleted",
    });
    res.json(response);
  } catch (err: any) {
    console.error("DELETE transaction error:", err.message);
    res.status(500).json({ error: "Database error: " + err.message });
  }
});

export default router;
