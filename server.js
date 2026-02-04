import app from "./src/app.js"
import { setupDatabase } from "./setup-database.js";

const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await setupDatabase();
});