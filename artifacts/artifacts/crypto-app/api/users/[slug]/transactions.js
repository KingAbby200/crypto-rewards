export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json([]); // empty for now
  }
  return res.status(405).json({ error: 'Method not allowed' });
}