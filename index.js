const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const fs = require("fs");

const builder = new addonBuilder({
  id: "org.serkan.to-watch-list",
  version: "1.0.0",
  name: "🍿 Serkan's To-Watch Addon",
  description: "Serkan's personal movie & series watchlist served as a Stremio addon.",
  logo: "https://i.imgur.com/YO5Gv3I.png",
  resources: ["catalog"],
  types: ["movie", "series"],
  catalogs: [
    {
      type: "movie",
      id: "serkans-watchlist-movies",
      name: "🍿 Serkan's To-Watch Movies"
    },
    {
      type: "series",
      id: "serkans-watchlist-shows",
      name: "🍿 Serkan's To-Watch Series"
    }
  ]
});

function getItemsFromFile(filename) {
  try {
    const raw = fs.readFileSync(filename);
    const data = JSON.parse(raw);

    return Object.entries(data).map(([key, item]) => ({
      id: key,
      type: filename.includes("shows") ? "series" : "movie",
      name: item.title,
      poster: item.poster,
      description: `${item.year || ""} - IMDb: ${item.imdbRating || "N/A"} | RT: ${item.rtRating || "N/A"}`
    }));
  } catch (err) {
    console.error(`❌ Error loading ${filename}:`, err.message);
    return [];
  }
}

builder.defineCatalogHandler(({ type, id }) => {
  if (id === "serkans-watchlist-movies" && type === "movie") {
    const items = getItemsFromFile("favorites_movies_updated.json");
    return Promise.resolve({ metas: items });
  } else if (id === "serkans-watchlist-shows" && type === "series") {
    const items = getItemsFromFile("favorites_shows_updated.json");
    return Promise.resolve({ metas: items });
  } else {
    return Promise.resolve({ metas: [] });
  }
});

// 🚀 Start HTTP server for Render
serveHTTP(builder.getInterface(), { port: process.env.PORT || 7000 });
