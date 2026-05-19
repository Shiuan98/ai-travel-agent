import fs from "fs";
import countries from "./frontend/src/data/countries.js";

const urls = Object.keys(countries).map(slug => {

  return `
  <url>
    <loc>
      https://smarttripai.my/country/${slug}
    </loc>
  </url>
  `;
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>

<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${urls.join("")}

</urlset>
`;

fs.writeFileSync(
  "./frontend/public/sitemap.xml",
  sitemap
);

console.log("Sitemap generated");