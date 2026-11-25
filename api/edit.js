export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Gunakan POST' });

  const FAL_KEY = process.env.FAL_KEY;
  if (!FAL_KEY) {
    return res.status(500).json({ error: 'FAL_KEY belum dipasang di Vercel.' });
  }

  try {
    const { prompt, imageBase64 } = req.body || {};
    if (!prompt || !imageBase64) {
      return res.status(400).json({ error: 'Foto atau prompt kosong.' });
    }

    const response = await fetch('https://fal.run/fal-ai/flux-pro/kontext', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        image_url: imageBase64
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.detail || data.message || 'Gagal memproses di fal.ai' });
    }

    const resultUrl = data.images?.[0]?.url || data.image?.url;
    if (!resultUrl) {
      return res.status(500).json({ error: 'Model tidak mengembalikan URL gambar.' });
    }

    return res.status(200).json({ imageUrl: resultUrl });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
