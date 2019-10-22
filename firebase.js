import firebase from 'firebase';

const firebaseConfig = {
    apiKey: "AIzaSyDf-Yzzkq9zJwRkvdFhVN79QWNr4toU_XY",
    authDomain: "feg-forum.firebaseapp.com",
    databaseURL: "https://feg-forum.firebaseio.com",
    projectId: "feg-forum",
    storageBucket: "feg-forum.appspot.com",
    messagingSenderId: "206381491771",
    appId: "1:206381491771:web:31c63319df9f8c83425e1e"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase;