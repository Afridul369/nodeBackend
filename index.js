require("dotenv").config();
const { ConnectDatabase } = require("./src/database/Db.config");
const { app } = require("./src/app");

ConnectDatabase()
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Database Running on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("Error from Database connection ", error);
  });
