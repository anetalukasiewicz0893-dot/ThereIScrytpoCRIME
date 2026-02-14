
const SAOS_API_BASE = 'https://www.saos.org.pl/api/judgments';

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);

    // CORS Headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // API Endpoint for scanning judgments
    if (url.pathname === '/api/scan') {
      const query = url.searchParams.get('q') || 'kryptowaluta';
      const allItems = [];
      const maxPages = 3; 
      const pageSize = 40;

      try {
        for (let page = 0; page < maxPages; page++) {
          const saosUrl = new URL(SAOS_API_BASE);
          saosUrl.searchParams.set('textContent', query);
          saosUrl.searchParams.set('pageSize', pageSize.toString());
          saosUrl.searchParams.set('pageNumber', page.toString());
          saosUrl.searchParams.set('sortingField', 'JUDGMENT_DATE');
          saosUrl.searchParams.set('sortingDirection', 'DESC');

          const response = await fetch(saosUrl.toString(), {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Cynical-OSINT-Terminal/4.0.0)'
            }
          });

          if (!response.ok) break;

          const data: any = await response.json();
          if (data && data.items) {
            allItems.push(...data.items);
            if (data.items.length < pageSize) break;
          } else {
            break;
          }
        }

        const uniqueItems = Array.from(new Map(allItems.map(item => [item.id, item])).values());
        
        return new Response(JSON.stringify({ items: uniqueItems }), {
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      } catch (error: any) {
        return new Response(JSON.stringify({ error: 'UPLINK_FLATLINED', details: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Serve Static Assets
    try {
      return await env.ASSETS.fetch(request);
    } catch (e) {
      return new Response("Not Found", { status: 404 });
    }
  }
};
