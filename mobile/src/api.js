import { API_BASE } from "./config";

async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000); // 10 s timeout
  const started = Date.now();
  try {
    const res = await fetch(API_BASE + path, { ...options, signal: controller.signal });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Server error (${res.status})`);
    return { data, ms: Date.now() - started };
  } catch (e) {
    throw new Error(e.name === "AbortError" ? "Server took too long to respond" : e.message);
  } finally {
    clearTimeout(timer);
  }
}

export const getProducts = () => request("/api/products");

export const sendInquiry = (name, phone, message) =>
  request("/api/inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, phone, message }),
  });

export const checkHealth = () => request("/health");
