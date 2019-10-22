import { firestoreAction } from 'vuexfire';
import firebase from '@/firebase';
import db from '@/db';
import router from '../router'

const posts = db.collection('posts');
const comments = db.collection('comments');

const state = {
    subreddits: {},
    posts: [],
    comments: []
};

const getters = {
    subreddit: (state) => state.subreddits[0] ? state.subreddits[0] : {},
    posts: (state) => state.posts[0] ? state.posts[0] : {},
    comments: (state) => state.comments[0] ? state.comments[0] : {},
};

const actions = {
    async createComment({ getters }, comment){

        const result = comments.doc();
        comment.id = result.id;
        comment.post_id = comment.post_id;
        comment.subreddit_id = getters.subreddit.id;
        comment.user_id = firebase.auth().currentUser.uid;
        comment.created_at = firebase.firestore.FieldValue.serverTimestamp();
        comment.updated_at = firebase.firestore.FieldValue.serverTimestamp();
        try {
            await comments.doc(comment.id).set(comment);
            router.push({ name: 'subreddit' });
        }
        catch (error) {
            console.error(error);
        }
    },
    async createPost({ getters }, post) {
        const result = posts.doc();
        post.id = result.id;
        post.subreddit_id = getters.subreddit.id;
        post.user_id = firebase.auth().currentUser.uid;
        post.created_at = firebase.firestore.FieldValue.serverTimestamp();
        post.updated_at = firebase.firestore.FieldValue.serverTimestamp();
        try {
            await posts.doc(post.id).set(post);
        }catch (error) {
            console.error(error);
        }
    },
    async updatePost({ getters }, post) {
        try {
            await posts.doc(post.id).update({
                updated_at: firebase.firestore.FieldValue.serverTimestamp(),
                URL: post.URL,
                description: post.description,
                title: post.title
            });
            router.push({ name: 'subreddit' });

        }
        catch (error) {
            console.error(error);
        }
    },
    async deletePost(_, post_id) {

        //Borramos el post
        await posts.doc(post_id).delete();

        //Borramos los comentarios asociados
        comments.where('post_id','==',post_id).get()
        .then(function(querySnapshot) {
            //Una vez tengamos los resultados inicializamos batch
            var batch = db.batch();

            querySnapshot.forEach(function(doc) {
                //Borramos individualmente cada documento
                batch.delete(doc.ref);
            });

            //Commit batch
            return batch.commit();
        }).then(function() {
            //Comentarios borrados
        }); 

    },
    initSubreddit: firestoreAction(({ bindFirestoreRef }, name) => {
        bindFirestoreRef('subreddits', db.collection('subreddits').where('name', '==', name));
    }),
    initPosts: firestoreAction(({ bindFirestoreRef }, subreddit_id) => {
        bindFirestoreRef('posts', posts.where('subreddit_id', '==', subreddit_id));
    }),
    initComments: firestoreAction(({ bindFirestoreRef }, post_id) => {
        bindFirestoreRef('comments', comments.where('post_id', '==', post_id));
    })
};

export default {
    namespaced: true,
    state,
    actions,
    getters,
};