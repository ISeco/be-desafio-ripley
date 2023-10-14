import dotenv from "dotenv";
import server from "./server/server";

dotenv.config();

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
