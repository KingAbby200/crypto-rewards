export default async function handler(req, res) {
  if (req.method === 'GET') {
    // No DB/collection yet — return empty so the UI shows the withdrawal form
    return res.status(200).json(null);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}