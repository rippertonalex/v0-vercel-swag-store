const API_BASE = "https://vercel-swag-store-api.vercel.app/api";
const BYPASS_TOKEN = "OykROcuULI6YJwAwk3VnWv4gMMbpAq6q";

async function testCreateCart() {
  // Test 1: with Content-Type
  console.log("=== Test 1: POST with Content-Type ===");
  const res1 = await fetch(`${API_BASE}/cart/create`, {
    method: "POST",
    headers: {
      "x-vercel-protection-bypass": BYPASS_TOKEN,
      "Content-Type": "application/json",
    },
  });
  console.log("Status:", res1.status);
  const body1 = await res1.text();
  console.log("Body:", body1);
  console.log("x-cart-token:", res1.headers.get("x-cart-token"));

  // Test 2: Also send ?x-vercel-protection-bypass as query param  
  console.log("\n=== Test 2: POST with query param bypass ===");
  const res2 = await fetch(`${API_BASE}/cart/create?x-vercel-protection-bypass=${BYPASS_TOKEN}`, {
    method: "POST",
    headers: {
      "x-vercel-protection-bypass": BYPASS_TOKEN,
      "Content-Type": "application/json",
    },
  });
  console.log("Status:", res2.status);
  const body2 = await res2.text();
  console.log("Body:", body2);
  console.log("x-cart-token:", res2.headers.get("x-cart-token"));

  // Test 3: Test a GET endpoint to confirm auth works
  console.log("\n=== Test 3: GET /products (confirm auth) ===");
  const res3 = await fetch(`${API_BASE}/products?limit=1`, {
    headers: {
      "x-vercel-protection-bypass": BYPASS_TOKEN,
    },
  });
  console.log("Status:", res3.status);
  const body3 = await res3.text();
  console.log("Body (first 200 chars):", body3.substring(0, 200));
}

testCreateCart().catch(console.error);
