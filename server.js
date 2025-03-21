import app from "./app.js";
import connect from "./config/connection.js";
const port = 3000;

app.get("/", (req, res) => {
  res.send("OCR-Server");
});

connect();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
