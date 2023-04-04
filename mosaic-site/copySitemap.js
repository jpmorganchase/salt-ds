const fs = require("fs");

fs.copyFile("./snapshots/latest/sitemap.xml", "./public/sitemap.xml", (err) => {
  if (err) throw err;
  console.log("sitemap.xml was copied to the public folder");
});
