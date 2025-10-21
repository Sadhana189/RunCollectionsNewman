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
1. Place your Postman collection JSON files in collections folder
2. (Optional) Add test data files if any, in data folder
3. (Optional) Add environment files if any, in environments folder
4. Update order.json with the order in which you want your collections to execute

# 🤔 What is order.json?
This file helps in determining the order in which you want your collection to run sequentially.

<img width="510" height="245" alt="image" src="https://github.com/user-attachments/assets/6e8c1110-e78a-42bd-96e2-81e11df85c29" />

As per the image the sequence of execution will be login1 > TestDataCollection > TestDataCollection1 and so on.

# 🔠 Naming Convention for Files
## Collection File names
When collections are exported from Postman, the file names are in the format: *collectionName.postman_collection.json*
Example: Collection name is **login** then, **login.postman_collection.json**

## Data File names
When the data files are created, ensure that they are named as: *collectionName_requestName_data.json*
Example: Collection name is **login** and one of the request/ endpoint within the collection name is **signIn** then,
**login_signIn_data.json**

## Environment File names
When the environment files are exported ensure that the file is named as: *collectionName.postman_environment.json*
Example: Collection name is **login** then the file name will be **login.postman_environment.json**

# ⚠️ Note
-> The script automatically installs missing HTML reporter.

-> Data chaining between requests works if **pm.variables.set()** is used in Postman scripts.

-> Reports are generated per request and stored under **/reports**.

-> No manual configuration is required once folders are set up correctly.
