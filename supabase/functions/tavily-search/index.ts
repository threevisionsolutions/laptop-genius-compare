// Supabase Edge Function: Tavily Search Proxy
// Securely calls Tavily API with server-side key to avoid CORS and hide secrets
// Deployed as: /functions/v1/tavily-search

// CORS helpers
const corsHeaders: HeadersInit = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Content-Type": "application/json; charset=utf-8",
};

const TAVILY_API_URL = "https://api.tavily.com/search";

Deno.serve(async (req: Request) => {
  // Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Simple health check
  if (req.method === "GET") {
    return new Response(JSON.stringify({ status: "ok" }), { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const envKey = Deno.env.get("TAVILY_API_KEY");
    if (!envKey) {
      return new Response(JSON.stringify({ error: "Missing TAVILY_API_KEY on server" }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const body = await req.json().catch(() => ({}));
    const query: string = body.query;
    const includeDomains: string[] | undefined = body.includeDomains;
    const limitRaw: number | undefined = body.limit ?? body.max_results;
    const limit = Math.min(Math.max(Number(limitRaw ?? 5), 1), 10);

    const search_depth: string = body.search_depth ?? "basic";
    const include_answer: boolean = body.include_answer ?? false;

    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "Missing 'query'" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const tavilyPayload: Record<string, unknown> = {
      api_key: envKey,
      query,
      search_depth,
      include_answer,
      max_results: limit,
    };
    if (Array.isArray(includeDomains) && includeDomains.length) {
      tavilyPayload.include_domains = includeDomains;
    }

    const res = await fetch(TAVILY_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tavilyPayload),
    });

    const text = await res.text();
    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `Tavily error: ${res.status}`, details: text }),
        { status: 502, headers: corsHeaders }
      );
    }

    return new Response(text, { headers: corsHeaders });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Unexpected error", details: String(err) }),
      { status: 500, headers: corsHeaders }
    );
  }
});
