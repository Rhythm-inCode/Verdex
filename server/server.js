import "./config/env.js";  

import app from "./src/app.js";
import connectDB from "./services/db.js";


const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 VERDEX backend running on ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server failed to start");
    process.exit(1);
  }
})();
