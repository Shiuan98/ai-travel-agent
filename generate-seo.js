import fs from "fs";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const countries = [
  "Japan",
  "South Korea",
  "Thailand",
  "Singapore",
  "France",
  "Taiwan",
  "Malaysia",
  "Indonesia",
  "Vietnam",
  "Italy",
  "New York",
  "Shanghai",
  "BeiJing",
  "ShenZhen",
  "ChongQing",
  "HaErBing",
  "Hong Kong",
  "United Kingdom",
  "Australia",
  "Russia"
];

async function generateCountry(country) {

  const response = await client.chat.completions.create({

    model: "gpt-4o-mini",

    response_format: {
      type: "json_object"
    },

    messages: [
      {
        role: "system",

        content: `
Return JSON:

{
  "name":"",
  "description":"",
  "itinerary":[
    {
      "area":"",
      "activities":[]
    }
  ]
}
`
      },

      {
        role: "user",

        content: `Generate SEO travel itinerary for ${country}`
      }
    ]

  });

  return JSON.parse(
    response.choices[0].message.content
  );
}

async function main() {

  const result = {};

  for (const country of countries) {

    console.log("Generating:", country);

    const data = await generateCountry(country);

    const slug = country
      .toLowerCase()
      .replace(/\s+/g, "-");

    result[slug] = data;
  }

  fs.writeFileSync(
    "./frontend/src/data/countries.js",
    `export default ${JSON.stringify(result, null, 2)}`
  );

  console.log("Done.");
}

main();