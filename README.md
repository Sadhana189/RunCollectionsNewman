# Newman Collection Runner with Dynamic Data Chaining
This repository provides a Node.js-based Newman automation script to execute multiple Postman collections dynamically with data files, environment variables, and variable chaining between requests.

# ➡️ Features
✅ Runs multiple collections in sequence based on ***order.json***

📊 Generates ***HTML Extra reports*** automatically

🌍 Supports ***environment and data files*** per collection

🔄 Handles variable chaining (***pm.variables.set()***) automatically

🖥️ Displays detailed ***CLI logs***

# ⚙️ Prerequisites
Node.js (v22 or higher) <br />
npm (comes with Node) <br />
Postman (for creating/exporting collections) <br />
Newman (installed using npm install -g newman)

# 📁 Folder Structure
collections/          → Postman collections as JSON files <br />
data/                 → Test data JSON files <br />
environments/         → Environment JSON files <br />
order.json            → Defines the order of collection execution <br />
runCollections.js     → Main runner script <br />

# 🚀 How to Use
1. Place your Postman collections JSON files in collections folder
2. (Optional) Add test data files if any, in data folder
3. (Optional) Add environment files if any, in environments folder
4. Update order.json with the order in which you want your collections to execute

# 🔠 Naming Convention for Files
## Collection File names
When collections are exported from Postman, the file names are in the format: <collectionName>.postman_collection.json

