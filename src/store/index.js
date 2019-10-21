import Vue from 'vue';
import Vuex from 'vuex';
import { vuexfireMutations } from 'vuexfire';

import auth from './auth';
import subreddits from './subreddits';
import subreddit from './subreddit';
import users from './users';


Vue.use(Vuex);

export default new Vuex.Store({
  mutations: vuexfireMutations,
  modules: {
    auth,
    subreddits,
    subreddit,
    users,
  },
});
