import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";
import fetch from "node-fetch";
import fs from "fs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
// 💰 Replace 'yourid-20' with your actual Booking.com Affiliate ID later
const AFFILIATE_ID = "travelai-20"; 

const cache = {};

const analyticsFile = "./analytics.json";

// ==============================
// 💸 Affiliate Link Helper
// ==============================
function generateAffiliateLinks(name, area) {
  const query = encodeURIComponent(`${name} ${area}`);
  
  return {
    // 🏨 Booking.com: 'ss' is the search string, 'aid' is your ID. 
    // Adding '&selected_currency=USD' and '&nflt=' helps lock in the search
    booking: `https://www.booking.com/searchresults.html?ss=${query}&aid=${AFFILIATE_ID}&lang=en-us&sb_lp=1`,

    // 🍜 Viator/TripAdvisor: Using the search path directly
    viator: `https://www.viator.com/search/${query}?mcid=56757`,

    // 📍 Google Maps: A direct search link that always works
    google: `https://www.google.com/maps/search/?api=1&query=${query}`
  };
}

// Ensure your fetchPlaces is calling it correctly:
async function fetchPlaces(query, area) {
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    // If Google has NO results, we still want to show the AI's suggestion
    // But for now, let's just make sure the results we DO get have links
    const results = (data.results || []).slice(0, 3).map(p => {
      const searchName = encodeURIComponent(p.name + " " + area);
      
      return {
        name: p.name,
        rating: p.rating || "4.5",
        address: p.formatted_address || area,
        links: {
          google: `https://www.google.com/maps/search/?api=1&query=${searchName}`,
          trip: `https://www.trip.com/hotels/list?display=${encodeURIComponent(area)}&Allianceid=8223699&SID=311233924&trip_sub1=hotelBtn`
        }
      };
    });
    
    return results;
  } catch (e) {
    console.error("Fetch Error:", e);
    return [];
  }
}

// const userUsage = {};

// function getUserId(req) {
//   return req.ip; // 先用 IP，之后可以换 token
// }

// function checkLimit(userId) {
//   const today = new Date().toISOString().split("T")[0];

//   if (!userUsage[userId]) {
//     userUsage[userId] = {};
//   }

//   if (!userUsage[userId][today]) {
//     userUsage[userId][today] = 0;
//   }

//   if (userUsage[userId][today] >= 5) {
//     return false;
//   }

//   userUsage[userId][today]++;
//   return true;
// }

function loadAnalytics() {
  if (!fs.existsSync(analyticsFile)) {
    fs.writeFileSync(analyticsFile, JSON.stringify({ clicks: [] }));
  }
  return JSON.parse(fs.readFileSync(analyticsFile));
}

function saveAnalytics(data) {
  fs.writeFileSync(analyticsFile, JSON.stringify(data, null, 2));
}

app.get("/go", (req, res) => {
  const { url, type, source, country } = req.query;

  if (!url) return res.status(400).send("Missing url");

  const analytics = loadAnalytics();

  analytics.clicks.push({
    url,
    type,
    country: country || "unknown",
    source: source || "unknown",
    ip: req.ip,
    time: new Date().toISOString()
  });

  saveAnalytics(analytics);

  return res.redirect(url);
});

app.get("/stats", (req, res) => {
  const db = loadAnalytics();

  const result = {
    total: db.clicks.length,
    hotel: 0,
    flight: 0,
    restaurant: 0,
    byCountry: {},
    bySource: {}
  };

  for (const c of db.clicks) {
    // type stats
    if (c.type) result[c.type]++;

    // country stats
    if (c.country) {
      result.byCountry[c.country] = (result.byCountry[c.country] || 0) + 1;
    }

    // source stats
    if (c.source) {
      result.bySource[c.source] = (result.bySource[c.source] || 0) + 1;
    }
  }

  res.json(result);
});


app.post("/api/generate-trip", async (req, res) => {
  // const userId = getUserId(req);

  // if (!checkLimit(userId)) {
  //   return res.status(429).json({
  //     success: false,
  //     error: "Daily limit reached (5 times/day). Please try again tomorrow."
  //   });
  // }
  const { country, places = [], startDate } = req.body;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a luxury travel agent. Output JSON: { "destination": "City, Country", "plan": [{ "day": 1, "area": "Specific Neighborhood", "activities": [], "transport": [] }], "tips": [] }`
        },
        {
          role: "user",
          content: `Country: ${country}. Places: ${places.join(", ")}. Start: ${startDate}`
        }
      ]
    });

    let data = JSON.parse(response.choices[0].message.content);

    // ✈️ Add a global flight link for the destination
    data.flightLink = `https://aviasales.tpx.lv/nxQINI1T`

    for (const day of data.plan) {
      const area = day.area || data.destination;
      const [restaurants, hotels] = await Promise.all([
        fetchPlaces(`top restaurants in ${area}`, area, 'eat'),
        fetchPlaces(`best hotels in ${area}`, area, 'stay')
      ]);
      day.restaurants = restaurants;
      day.hotels = hotels;
    }

    res.json({ success: true, trip: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/translate-trip", async (req, res) => {
  const { trip, lang } = req.body;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
You are a professional translator.

Rules:
- Keep JSON structure unchanged
- Translate ONLY text values
- Do NOT change keys
- If lang = zh, translate to Simplified Chinese
- If lang = en, translate to English
Return same JSON structure.
`
        },
        {
          role: "user",
          content: JSON.stringify({ trip, lang })
        }
      ]
    });

    const translated = JSON.parse(response.choices[0].message.content);

    res.json({
      success: true,
      trip: translated.trip || translated
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));