const functions = require("firebase-functions");
const express = require("express");

const { getAllScreams, postOneScream } = require("./handlers/screams");
const { signup, login } = require("./handlers/users");
const FBAuth = require("./util/FBAuth");

const app = express();

// scream routes
app.get("/scream", getAllScreams);
app.post("/scream", FBAuth, postOneScream);

//user routes
app.post("/signup", signup);
app.post("/login", login);

exports.api = functions.region("europe-west3").https.onRequest(app);
