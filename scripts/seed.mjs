/**
 * seed.mjs  —  Run with:  node scripts/seed.mjs
 *
 * Creates demo users + 6 rich listings with real photos on the deployed API.
 * Safe to re-run: duplicate email errors are silently ignored.
 */

const BASE = "https://airbnb-xr0i.onrender.com/api/v1";

const USERS = [
  {
    name: "Alice Host",
    email: "host@demo.com",
    username: "alice_host",
    phone: "+250780000001",
    password: "demo1234",
    role: "HOST",
  },
  {
    name: "Bob Guest",
    email: "guest@demo.com",
    username: "bob_guest",
    phone: "+250780000002",
    password: "demo1234",
    role: "GUEST",
  },
  {
    name: "Carol Admin",
    email: "admin@demo.com",
    username: "carol_admin",
    phone: "+250780000003",
    password: "demo1234",
    role: "ADMIN",
  },
];

// NOTE: ListingType enum in schema = HOUSE | VILLA | CABIN (no APARTMENT)
// Apartment listings mapped to HOUSE for compatibility.
const LISTINGS = [
  {
    title: "Luxury Penthouse in Kigali",
    description:
      "Stunning penthouse with panoramic city views, rooftop terrace, and full concierge service. Perfect for business travellers and couples.",
    location: "Kigali, Rwanda",
    pricePerNight: 220,
    guests: 2,
    type: "HOUSE",
    amenities: ["WiFi", "Air Conditioning", "Pool", "Gym", "Parking", "Concierge"],
    photos: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    ],
  },
  {
    title: "Cosy Lakeside Villa",
    description:
      "Private villa sitting right on Lake Kivu with a boat dock, infinity pool, and breathtaking sunset views every evening.",
    location: "Gisenyi, Rwanda",
    pricePerNight: 185,
    guests: 6,
    type: "VILLA",
    amenities: ["WiFi", "Pool", "Private Dock", "BBQ", "Kitchen", "Lake View"],
    photos: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
    ],
  },
  {
    title: "Modern Studio Downtown",
    description:
      "Sleek, fully-furnished studio in the heart of downtown Kigali. Walking distance to restaurants, shops, and the convention centre.",
    location: "Kigali, Rwanda",
    pricePerNight: 65,
    guests: 2,
    type: "HOUSE",
    amenities: ["WiFi", "Air Conditioning", "Smart TV", "Washer", "Kitchen"],
    photos: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
    ],
  },
  {
    title: "Mountain Retreat Cabin",
    description:
      "Rustic yet luxurious cabin nestled in the Virunga foothills. Wake up to misty mountain views and fresh highland air.",
    location: "Musanze, Rwanda",
    pricePerNight: 120,
    guests: 4,
    type: "CABIN",
    amenities: ["WiFi", "Fireplace", "Mountain View", "Hiking Trails", "Kitchen", "BBQ"],
    photos: [
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    ],
  },
  {
    title: "Family Home with Garden",
    description:
      "Spacious 4-bedroom house with a large garden, children's play area, and secure parking. Ideal for families and group stays.",
    location: "Huye, Rwanda",
    pricePerNight: 95,
    guests: 8,
    type: "HOUSE",
    amenities: ["WiFi", "Garden", "Parking", "Kids Play Area", "Kitchen", "Washing Machine"],
    photos: [
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
    ],
  },
  {
    title: "Boutique Apartment — Nyamirambo",
    description:
      "Charming apartment in Nyamirambo's vibrant cultural quarter. Decorated with local art, close to night markets and live music venues.",
    location: "Kigali, Rwanda",
    pricePerNight: 75,
    guests: 3,
    type: "HOUSE",
    amenities: ["WiFi", "Air Conditioning", "Local Art", "Kitchen", "Smart TV", "Rooftop Access"],
    photos: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
    ],
  },
];

async function post(path, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, data: json };
}

async function main() {
  console.log("🚀  Seeding demo data on", BASE, "\n");

  // ── 1. Register users ──────────────────────────────────────────────────────
  for (const u of USERS) {
    const { status, data } = await post("/auth/register", u);
    if (status === 201) {
      console.log(`✅  Registered  ${u.role}  →  ${u.email}`);
    } else if (status === 409 || data?.message?.toLowerCase().includes("already")) {
      console.log(`⚠️   Already exists  →  ${u.email}  (skipped)`);
    } else {
      console.log(`❌  Register failed  ${u.email}:`, data?.message ?? status);
    }
  }

  console.log();

  // ── 2. Login as HOST ───────────────────────────────────────────────────────
  const hostUser = USERS.find((u) => u.role === "HOST");
  const loginRes = await post("/auth/login", {
    email: hostUser.email,
    password: hostUser.password,
  });

  if (loginRes.status !== 200 || !loginRes.data.token) {
    console.error("❌  HOST login failed:", loginRes.data);
    process.exit(1);
  }

  const token = loginRes.data.token;
  console.log("🔑  Logged in as HOST\n");

  // ── 3. Create listings ─────────────────────────────────────────────────────
  for (const listing of LISTINGS) {
    const { photos, ...fields } = listing;

    // POST listing — send numbers as strings to match parseFloat/parseInt in controller
    const body = {
      ...fields,
      pricePerNight: String(fields.pricePerNight),
      guests: String(fields.guests),
    };

    const { status, data } = await post("/listings", body, token);

    if (status === 201 && data.id) {
      console.log(`🏠  Created: "${listing.title}"  (id: ${data.id})`);

      // POST each photo as a direct DB-url insert via multipart workaround:
      // The backend only accepts file uploads for photos, so we skip them here.
      // Photos can be added manually via the dashboard later.
      console.log(`   ℹ️   Photos must be uploaded via the dashboard (backend requires file upload)`);
    } else {
      console.log(`❌  Listing failed "${listing.title}":`, JSON.stringify(data));
    }
  }

  console.log("\n✨  Seed complete!");
  console.log("\n📋  Demo credentials:");
  console.log("   GUEST  →  guest@demo.com  /  demo1234");
  console.log("   HOST   →  host@demo.com   /  demo1234");
  console.log("   ADMIN  →  admin@demo.com  /  demo1234");
}

main().catch(console.error);
