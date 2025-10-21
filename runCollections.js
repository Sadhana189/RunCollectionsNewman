const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const newman = require("newman");

const collectionsDir = path.join(__dirname, "collections");
const dataDir = path.join(__dirname, "data");
const envDir = path.join(__dirname, "environments");
const reportDir = path.join(__dirname, "reports");

// ✅ Ensure reports directory exists
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

// ✅ Check and install htmlextra reporter if missing
try {
  require.resolve("newman-reporter-htmlextra");
} catch (e) {
  console.warn("⚠️ htmlextra reporter not found. Installing now...");
  try {
    execSync("npm install newman-reporter-htmlextra --silent", { stdio: "inherit" });
    console.log("✅ Installed newman-reporter-htmlextra successfully.\n");
  } catch (err) {
    console.error("❌ Failed to install newman-reporter-htmlextra:", err.message);
    console.log("Proceeding without HTML report...\n");
  }
}

// ✅ Helper: get all matching data files
function getMatchingDataFiles(collectionName) {
  const baseName = collectionName.replace(/\.postman_collection\.json$/i, "");
  const allDataFiles = fs.existsSync(dataDir) ? fs.readdirSync(dataDir) : [];
  return allDataFiles.filter(f => f.startsWith(baseName + "_") && f.endsWith("_data.json"));
}

// ✅ Helper: find request object inside collection
function findRequest(collection, requestName) {
  const search = (items) => {
    for (const item of items) {
      if (item.name === requestName && item.request) return item;
      if (item.item && item.item.length) {
        const found = search(item.item);
        if (found) return found;
      }
    }
    return null;
  };
  return search(collection.item);
}

// ✅ Run a single request or collection
function runCollection(collectionObj, dataPath, reportName, envPath, runtimeVars) {
  return new Promise((resolve, reject) => {
    const options = {
      collection: collectionObj,
      reporters: ["cli", "htmlextra"],
      reporter: {
        htmlextra: {
          export: path.join(reportDir, `${reportName}.html`)
        }
      },
      environment: envPath,
      iterationData: dataPath,
      globals: { values: Object.entries(runtimeVars).map(([key, value]) => ({ key, value })) }
    };

    console.log(`\n🚀 Running: ${reportName}`);
    if (dataPath) console.log(`🧾 Using data file: ${path.basename(dataPath)}`);
    if (envPath) console.log(`🌍 Using environment: ${path.basename(envPath)}`);

    const run = newman.run(options, (err, summary) => {
      if (err) return reject(err);

      console.log(`✅ Completed: ${reportName}`);
      console.log(`📄 HTML report saved to: ${path.join(reportDir, `${reportName}.html`)}\n`);
      resolve(summary);
    });

    // 🧠 Capture runtime variables from pm.variables.set
    run.on("beforeDone", (err, o) => {
      const ctxVars = o && o.run && o.run.executions
        ? o.run.executions.reduce((acc, e) => {
            if (e.variables) {
              e.variables.each((v) => {
                acc[v.key] = v.value;
              });
            }
            return acc;
          }, {})
        : {};

      Object.assign(runtimeVars, ctxVars);
    });

    // 🖥️ Show console.log() outputs from Postman tests
    run.on("console", (err, args) => {
      console.log(`🧩 Console from Postman:`, ...args.messages);
    });
  });
}

(async () => {
  try {
    const orderPath = path.join(__dirname, "order.json");
    if (!fs.existsSync(orderPath)) {
      console.error("❌ Missing order.json file!");
      process.exit(1);
    }

    const { order } = JSON.parse(fs.readFileSync(orderPath, "utf8"));
    let runtimeVars = {}; // store variables across requests

    for (const collectionFile of order) {
      const collectionPath = path.join(collectionsDir, collectionFile);
      if (!fs.existsSync(collectionPath)) {
        console.error(`❌ Collection not found: ${collectionFile}`);
        continue;
      }

      const collectionJson = require(collectionPath);
      const baseName = collectionFile.replace(/\.postman_collection\.json$/i, "");
      const dataFiles = getMatchingDataFiles(collectionFile);

      // 🔍 Find environment file
      const envFiles = fs.existsSync(envDir)
        ? fs.readdirSync(envDir).filter(f =>
            f.toLowerCase().startsWith(baseName.toLowerCase()) &&
            f.toLowerCase().endsWith(".postman_environment.json")
          )
        : [];

      const envPath = envFiles.length > 0 ? path.join(envDir, envFiles[0]) : null;

      if (dataFiles.length === 0) {
        console.log(`⚠️ No data files found for ${collectionFile}. Running full collection...`);
        await runCollection(collectionJson, null, baseName, envPath, runtimeVars);
        continue;
      }

      // 🔁 Run each request with matching data
      for (const dataFile of dataFiles) {
        const requestName = dataFile.replace(`${baseName}_`, "").replace("_data.json", "");
        const requestObj = findRequest(collectionJson, requestName);

        if (!requestObj) {
          console.warn(`⚠️ Request "${requestName}" not found in ${collectionFile}`);
          continue;
        }

        const singleRequestCollection = {
          info: collectionJson.info,
          item: [requestObj]
        };

        const dataPath = path.join(dataDir, dataFile);
        const reportName = `${baseName}_${requestName}`;
        await runCollection(singleRequestCollection, dataPath, reportName, envPath, runtimeVars);
      }
    }

    console.log("\n🎉 All collections executed successfully!");
  } catch (err) {
    console.error("❌ Error executing collections:", err);
    process.exit(1);
  }
})();
