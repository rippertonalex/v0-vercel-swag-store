const API_BASE = "https://vercel-swag-store-api.vercel.app/api";
const BYPASS_TOKEN = "OykROcuULI6YJwAwk3VnWv4gMMbpAq6q";

async function testCreateCart() {
  console.log("Testing POST /cart/create...");
  
  const res = await fetch(`${API_BASE}/cart/create`, {
    method: "POST",
    headers: {
      "x-vercel-protection-bypass": BYPASS_TOKEN,
    },
  });
  
  console.log("Status:", res.status);
  console.log("Headers:", JSON.stringify(Object.fromEntries(res.headers.entries()), null, 2));
  
  const body = await res.text();
  console.log("Body:", body);
  
  const token = res.headers.get("x-cart-token");
  console.log("x-cart-token header:", token);
  
  if (body) {
    try {
      const json = JSON.parse(body);
      console.log("Parsed body:", JSON.stringify(json, null, 2));
      if (json.data?.token) {
        console.log("Token from body:", json.data.token);
      }
    } catch(e) {
      console.log("Failed to parse body as JSON");
    }
  }
}

testCreateCart().catch(console.error);
