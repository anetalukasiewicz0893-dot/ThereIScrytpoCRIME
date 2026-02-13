
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
  const maxPages = 3;
  const pageSize = 100;

  try {
    console.log(`[INTEL] Initiating deep scan for: ${query}`);
    
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
            'User-Agent': 'Mozilla/5.0 (OSINT-Terminal/2.4.0)'
          },
          timeout: 10000
        });

        if (response.data && response.data.items) {
          allItems.push(...response.data.items);
          if (response.data.items.length < pageSize) break;
        } else {
          break;
        }
      } catch (err: any) {
        console.error(`[ERROR] Page ${page} fetch failed:`, err.message);
        if (page === 0) throw err; // Only fail if the first page fails
        break;
      }
    }

    // Clean and deduplicate data
    const uniqueItems = Array.from(new Map(allItems.map(item => [item.id, item])).values());
    
    console.log(`[SUCCESS] Surfaced ${uniqueItems.length} records.`);
    res.json({ items: uniqueItems });
  } catch (error: any) {
    console.error('[CRITICAL] SAOS Uplink Failure:', error.message);
    res.status(500).json({ 
      error: 'UPLINK_FAILURE', 
      message: 'Failed to communicate with the National Judicial Database.' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`[SYSTEM] Backend Terminal active on port ${PORT}`);
});
