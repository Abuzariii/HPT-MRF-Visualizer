const fs = require("fs");
const path = require("path");

const pkgPath = path.join(__dirname, "node_modules", "duckdb", "package.json");

if (fs.existsSync(pkgPath)) {
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

    // If the binary field exists but napi_versions is missing, inject it
    if (pkg.binary && !pkg.binary.napi_versions) {
      pkg.binary.napi_versions = [3]; // N-API version 3 is a safe fallback
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
      console.log("✅ Successfully patched DuckDB package.json for Turbopack!");
    } else {
      console.log("ℹ️  DuckDB already patched or napi_versions exists.");
    }
  } catch (e) {
    console.error("❌ Failed to patch DuckDB:", e.message);
  }
} else {
  console.log("⚠️ DuckDB package.json not found. Make sure it is installed.");
}
