const { MongoClient } = require("mongodb");
const connectionString = process.env.MONGODB_URI;
const client = new MongoClient(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let dbConnection;

module.exports = {
  connectToServer: function (callback) {
    // Implement Database connection
    client.connect(function (err, db) {
        if (err || !db) {
          return callback(err);
        }
  
        dbConnection = db.db("assets-management");
        console.log("Successfully connected to MongoDB.");
  
        return callback();
      });
  },

  getDb: function () {
    return dbConnection;
  },
  
  getDb2: async function (database) {
    // Implement Database connection
    try {
        await client.connect(function (err, db) {
          if (err || !db) {
            return callback(err);
          }

          dbConnection = db.db(database);
          console.log("Successfully connected to MongoDB. ", database);

          return dbConnection;
        });

        // await listDatabases(client);

    } catch (e) {
        console.error(e);
    } finally {
        // await client.close();
    }

    return dbConnection;
  },
};
