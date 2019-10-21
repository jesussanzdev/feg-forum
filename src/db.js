import firebase from '@/firebase';

const db = firebase.firestore();

db.settings({
});

export default db;