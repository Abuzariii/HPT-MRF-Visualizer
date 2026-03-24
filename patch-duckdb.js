// patch-duckdb.js
const fs = require("fs");
const path = require("path");

const duckdbDir = path.join(__dirname, "node_modules", "duckdb");
const pkgPath = path.join(duckdbDir, "package.json");

if (fs.existsSync(pkgPath)) {
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

    if (pkg.binary && !pkg.binary.napi_versions) {
      // 1. Add napi_versions for Turbopack
      pkg.binary.napi_versions = [3];

      // 2. Add the required substitution string for node-pre-gyp
      pkg.binary.module_path = "./lib/binding/napi-v{napi_build_version}/";
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

      // 3. Physically move the binary so the app can actually find it at runtime
      const oldDir = path.join(duckdbDir, "lib", "binding");
      const newDir = path.join(oldDir, "napi-v3");

      if (fs.existsSync(oldDir) && !fs.existsSync(newDir)) {
        fs.mkdirSync(newDir, { recursive: true });
        const files = fs.readdirSync(oldDir);
        for (const file of files) {
          const oldPath = path.join(oldDir, file);
          if (fs.statSync(oldPath).isFile()) {
            fs.renameSync(oldPath, path.join(newDir, file));
          }
        }
      }
      console.log(
        "✅ Patched DuckDB package and migrated binary successfully!"
      );
    } else {
      console.log("ℹ️ DuckDB already patched.");
    }
  } catch (e) {
    console.error("❌ Failed to patch DuckDB:", e.message);
  }
}
