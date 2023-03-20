const express = require("express");

// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /listings.
const recordRoutes = express.Router();

// This will help us connect to the database
const dbo = require("./db");
const database = require("./database");

// middleware authentication
const auth = require("./auth");

// Get models
const { User } = require("./models");

const { TOKEN_KEY } = process.env;
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

// This section will help you get a list of all the records.
recordRoutes.route("/listings").get(async function (req, res) {
    // Get records
    const dbConnect = dbo.getDb();

    dbConnect
        .collection("listingsAndReviews")
        .find({}).limit(50)
        .toArray(function (err, result) {
            if (err) {
                res.status(400).send("Error fetching listings!");
            } else {
                res.json(result);
            }
        });
});

// This section will help you create a new record.
recordRoutes.route("/listings/recordSwipe").post(function (req, res) {
    // Insert swipe informations
    const dbConnect = dbo.getDb();
    const matchDocument = {
        listing_id: req.body.id,
        last_modified: new Date(),
        session_id: req.body.session_id,
        direction: req.body.direction
    };

    dbConnect
        .collection("matches")
        .insertOne(matchDocument, function (err, result) {
            if (err) {
                res.status(400).send("Error inserting matches!");
            } else {
                console.log(`Added a new match with id ${result.insertedId}`);
                res.status(204).send();
            }
        });
});

// This section will help you update a record by id.
recordRoutes.route("/listings/updateLike").post(function (req, res) {
    // Update likes
    const dbConnect = dbo.getDb();
    const listingQuery = { _id: req.body.id };
    const updates = {
        $inc: {
            likes: 1
        }
    };

    dbConnect
        .collection("listingsAndReviews")
        .updateOne(listingQuery, updates, function (err, _result) {
            if (err) {
                res.status(400).send(`Error updating likes on listing with id ${listingQuery.id}!`);
            } else {
                console.log("1 document updated");
            }
        });
});

// This section will help you delete a record
recordRoutes.route("/listings/delete").delete((req, res) => {
    // Delete documents
    const dbConnect = dbo.getDb();
    const listingQuery = { listing_id: req.body.id };

    dbConnect
        .collection("listingsAndReviews")
        .deleteOne(listingQuery, function (err, _result) {
            if (err) {
                res.status(400).send(`Error deleting listing with id ${listingQuery.listing_id}!`);
            } else {
                console.log("1 document deleted");
            }
        });
});

/**
 * 
 */
// This section will help you get a list of all the records.
recordRoutes.route("/").get(async function (req, res) {
    res.json();
});

/**
 * USER LOGIN
 */

// This section will help you get a list of all the records.
recordRoutes.route("/users").get(async function (req, res) {
    // Get records
    const dbConnect = dbo.getDb();

    dbConnect
        .collection("user")
        .find({}).limit(50)
        .toArray(function (err, result) {
            if (err) {
                res.status(400).send("Error fetching listings!");
            } else {
                res.json(result);
            }
        });
});


/**
 * USER JWT - Register
 */
recordRoutes.route("/register").post(async (req, res) => {
    /*
    const dbConnect = dbo.getDb();
    const listingQuery = { _id: req.body.id };
    const updates = {
        $inc: {
            likes: 1
        }
    };

    dbConnect
        .collection("listingsAndReviews")
        .updateOne(listingQuery, updates, function (err, _result) {
            if (err) {
                res.status(400).send(`Error updating likes on listing with id ${listingQuery.id}!`);
            } else {
                console.log("1 document updated");
            }
        });
    */

    // Our register logic starts here
    try {
        // Get user input
        const { first_name, last_name, email, password } = req.body;

        // Validate user input
        if (!(email && password && first_name && last_name)) {
            res.status(400).send("All input is required");
        }

        // check if user already exist
        // Validate if user exist in our database
        const oldUser = await User.findOne({ email });
        console.log('oldUser', oldUser);

        if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login");
        }

        //Encrypt user password
        encryptedPassword = await bcrypt.hash(password, 10);

        // Create user in our database
        const user = await User.create({
            first_name,
            last_name,
            email: email.toLowerCase(), // sanitize: convert email to lowercase
            password: encryptedPassword,
        });

        // Create token
        const token = jwt.sign(
            { user_id: user._id, email },
            TOKEN_KEY,
            {
                expiresIn: "2h",
            }
        );
        // save user token
        user.token = token;

        // return new user
        res.status(201).json(user);
    } catch (err) {
        console.log(err);
    }
    // Our register logic ends here
});

/**
 * USER JWT - Login
 */
recordRoutes.route("/login").post(async (req, res) => {
    /*
    const dbConnect = dbo.getDb();
    const listingQuery = { _id: req.body.id };
    const updates = {
        $inc: {
            likes: 1
        }
    };

    dbConnect
        .collection("listingsAndReviews")
        .updateOne(listingQuery, updates, function (err, _result) {
            if (err) {
                res.status(400).send(`Error updating likes on listing with id ${listingQuery.id}!`);
            } else {
                console.log("1 document updated");
            }
        });
    */
    // Our login logic starts here
    try {
        // Get user input
        const { email, password } = req.body;

        // Validate user input
        if (!(email && password)) {
            res.status(400).send("All input is required");
        }
        // Validate if user exist in our database
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            // Create token
            const token = jwt.sign(
                { user_id: user._id, email },
                TOKEN_KEY,
                {
                    expiresIn: "2h",
                }
            );

            // save user token
            user.token = token;

            // user
            res.status(200).json(user);
        }
        res.status(400).send("Invalid Credentials");
    } catch (err) {
        console.log(err);
    }
    // Our register logic ends here
});

/**
 * auth test
 */
recordRoutes.route("/welcome").post(auth, (req, res) => {
    res.status(200).send("Welcome 🙌 ");
});

/**
 *
 */


/**
 * DYNAMICS GETs
 */

// This section will help you get a list of all the records.
recordRoutes.route("/dummy/:database/:collection").get(auth, async function (req, res) {    
    const database = req.params.database;
    const collection = req.params.collection;
    // const collection = req.query.collection;
    
    console.log('dummy - database', database);
    console.log('dummy - collection', collection);
    
    // Get records
    const dbConnect = await dbo.getDb2(database);

    dbConnect
        .collection(collection)
        .find({}).limit(50)
        .toArray(function (err, result) {
            if (err) {
                res.status(400).send("Error fetching listings!");
            } else {
                res.json(result);
            }
        });
});

/**
 * Cart comparator API
 */
recordRoutes.route("/cart/create").post(function (req, res) {
    // Insert swipe informations
    const dbConnect = dbo.getDb();
    const requestBody = {
        card_id: req.body.id,
        created_date: new Date(),
        last_modified: new Date(),
        user: req.body.session_id,
        rows: req.body.direction,
        extra: { }
    };

    dbConnect
        .collection("carts")
        .insertOne(requestBody, function (err, result) {
            if (err) {
                res.status(400).send("Error inserting matches!");
            } else {
                console.log(`Added ${result.insertedCount} a new cart with id ${result.insertedId}`);
                res.status(204).send();
            }
        });
});


module.exports = recordRoutes;
