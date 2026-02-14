import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Proxy API for SAOS (Polish Judgment Database)
app.get('/api/scan', async (req, res) => {
  const query = req.query.q || 'kryptowaluta';
  const SAOS_API_BASE = 'https://www.saos.org.pl/api/judgments';

  try {
    const response = await axios.get(SAOS_API_BASE, {
      params: {
        textContent: query,
        pageSize: 40,
        sortingField: 'JUDGMENT_DATE',
        sortingDirection: 'DESC'
      },
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Crypto-OSINT-Terminal/12.0'
      }
    });
    res.json(response.data);
  } catch (error: any) {
    console.error('API Proxy Error:', error.message);
    res.status(500).json({ error: 'UPLINK_FLATLINED', details: error.message });
  }
});

// Serve static files from the root directory
// Explicitly setting cache-control to prevent stale files in browser
app.use(express.static(__dirname, {
    maxAge: '1h',
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));

// Fallback to index.html for SPA support - CRITICAL for React routing on refresh
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log('=========================================');
  console.log(`OSINT TERMINAL LIVE AT PORT: ${port}`);
  console.log(`API_KEY STATUS: ${process.env.API_KEY ? 'CONFIGURED' : 'MISSING'}`);
  console.log('=========================================');
});
