
import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const SAOS_API_BASE = 'https://www.saos.org.pl/api/judgments';

app.get('/api/scan', async (req, res) => {
  const query = req.query.q || 'kryptowaluta waluta wirtualna';
  const allItems = [];
  const maxPages = 10; // Increased from 3 to 10 for "massive" search
  const pageSize = 100;

  try {
    console.log(`[SYS] Scanning the digital gutter for: ${query}. Hold your nose.`);
    
    for (let page = 0; page < maxPages; page++) {
      try {
        const response = await axios.get(SAOS_API_BASE, {
          params: {
            textContent: query,
            pageSize: pageSize,
            pageNumber: page,
            sortingField: 'JUDGMENT_DATE',
            sortingDirection: 'DESC'
          },
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Cynical-OSINT-Terminal/3.0.0)'
          },
          timeout: 15000
        });

        if (response.data && response.data.items) {
          allItems.push(...response.data.items);
          if (response.data.items.length < pageSize) break;
        } else {
          break;
        }
      } catch (err: any) {
        console.error(`[FAIL] Page ${page} was too messy to handle:`, err.message);
        if (page === 0) throw err;
        break;
      }
    }

    const uniqueItems = Array.from(new Map(allItems.map(item => [item.id, item])).values());
    
    console.log(`[DONE] Dredged up ${uniqueItems.length} records. Filtering for actual intelligence now.`);
    res.json({ items: uniqueItems });
  } catch (error: any) {
    console.error('[FATAL] SAOS Uplink flatlined:', error.message);
    res.status(500).json({ 
      error: 'UPLINK_FLATLINED', 
      message: 'The National Archive is currently ignoring our pings. Try again when they wake up.' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`[TERMINAL] Backend logic active on port ${PORT}. Surveillance mode: ON.`);
});
