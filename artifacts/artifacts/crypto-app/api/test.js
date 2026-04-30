export default function handler(req, res) {
  res.status(200).json({
    message: "API routing works",
    path: "/api/test",
    time: new Date().toISOString()
  });
}
