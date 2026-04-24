export default function handler(req, res) {
  res.status(200).json({ 
    message: "API routing is working",
    method: req.method,
    query: req.query,
    time: new Date().toISOString()
  });
}