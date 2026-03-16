export default async function handler(req, res) {
  const { slug } = req.query;
  res.status(200).json({
    name: "Test User " + slug,
    walletAddress: "0xFakeTestAddress",
    eligibleBalance: 1.23,
    withdrawalFeeEth: 0.05,
    feeWalletAddress: "0xFeeTest",
    slug: slug
  });
}