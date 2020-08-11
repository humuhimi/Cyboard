/* eslint-disable promise/no-nesting */
/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/always-return */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const app = require('express')();

const firebaseConfig = {
    apiKey: "AIzaSyCkezRR3Jf38l4C6dxbkZ8xiKmlCPcMfvE",
    authDomain: "cyborad.firebaseapp.com",
    databaseURL: "https://cyborad.firebaseio.com",
    projectId: "cyborad",
    storageBucket: "cyborad.appspot.com",
    messagingSenderId: "199526866653",
    appId: "1:199526866653:web:da8106493c19b96b198534"
  };

const firebase = require('firebase');
const { firestore } = require('firebase-admin');
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();




app.get('/group',(req,res) => {
    db().collection('groups').get()
    .then(data => {
        let groups = [];
        data.forEach(doc => {
            groups.push({
                groupId : doc.id,
                body:doc.data().body,
                userHandle : doc.data().userHandle,
                createdAt: doc.data().createdAt,

            }
                );
        });
        return res.json(groups);
    }).catch(err => console.error(err));
});

app.post('/group',(req,res) => {
    const newGroup = {
        body: req.body.body,
        userHandle : req.body.userHandle,
        createdAt: new Date().toISOString()
    };
    db().collection('groups').add(newGroup).then(
        // eslint-disable-next-line promise/always-return
        doc => {
            res.json({message: `document ${doc.id} created succesfully!`});
        }
    ).catch(err =>{
        res.status(500).json({error: `something went wrong`});
        console.log(err);
    });
});

app.post('/signup',(req,res) => {
    // test for git connection
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword:req.body.confirmPassword,
        handle: req.body.handle,
    };
    // eslint-disable-next-line promise/catch-or-return
    db.doc(`/users/${newUser.handle}`).get()
        .then(doc => {
            if(doc.exists){
                return res.status(400).json({handle : 'this handle is already taken'});
            }else {
                return firebase.auth().createUserWithEmailAndPassword(newUser.email,newUser.password);
            }})
            .then(data => { return data.user.getIdToken(); })
                .then(token => { return res.status(200).json({ token }); })
                    .catch(err => {
                        console.log(err);
                        return res.status(500).json({ "error":err.code });
                    });

            });

exports.api = functions.https.onRequest(app);