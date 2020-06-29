const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const firebase = require("firebase");

const config = {
  apiKey: "AIzaSyDAhuB2j7L6x6iMrWz4rOyAb8Lkv42xAl8",
  authDomain: "socialape-92d88.firebaseapp.com",
  databaseURL: "https://socialape-92d88.firebaseio.com",
  projectId: "socialape-92d88",
  storageBucket: "socialape-92d88.appspot.com",
  messagingSenderId: "162567203827",
  appId: "1:162567203827:web:55a844f751f0091b2b0086",
};

admin.initializeApp();
const app = express();
firebase.initializeApp(config);
const db = admin.firestore();

app.get("/scream", (req, res) => {
  db.collection("screems")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let screams = [];
      data.forEach((doc) => {
        screams.push({
          screamId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt,
        });
      });
      return res.json(screams);
    })
    .catch((err) => console.error(err));
});

app.post("/scream", (req, res) => {
  if (req.method !== "POST") {
    return res.status(400).json({ error: "Method is not allowed" });
  }
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString(),
  };

  db.collection("screems")
    .add(newScream)
    .then((doc) => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch((err) => {
      res.status(500).json({ error: "something went wrong" });
      console.error(err);
    });
});

app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confimPassword: req.body.confimPassword,
    handle: req.body.handle,
  };

  // TODO: validate user

  db.doc(`/users/${newUser.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res
          .status(400)
          .json({ handle: "this handle is already tacken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idToken) => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId,
      };
      return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch((err) => {
      console.erro(err);
      return res.status(500).json({ error: err.code });
    });

  // firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
  // .then(data => {
  //     return res.status(201).json({message: `user ${data.user.uid} signed up successfully`})
  // })
  // .catch(err => {
  //     console.erro(err);
  //     return res.status(500).json({error: err.code});
  // })
});

exports.api = functions.region("europe-west3").https.onRequest(app);
