<template>
  <div id="app">
      <nav class="navbar is-primary" role="navigation" aria-label="main navigation">
        <div class="navbar-brand">
          <a class="navbar-item feg" href="/#/subreddits">
          Federación Española de Guidismo
          </a>
        </div>
      <div class="navbar-end">
        <div class="navbar-item">
          <div class="field is-grouped"> 
            <p class="control" v-if="!isLoggedIn">
              <a class="button is-danger" @click="login()">
                <span>
                  Entrar con Google
                </span>
              </a>
            </p>
            <p class="control logged-in" v-if="isLoggedIn">
              <section class="avatar">
                <figure>
                    <img :src="user.image">
                </figure>
                <figcaption class="username">{{user.name}}</figcaption>
              </section>
              <a class="button is-info" @click="logout()">
                Salir
              </a>
            </p>
          </div>
        </div>
      </div>
      </nav>
      <router-view class="main container"/>
  </div>
</template>

<script>

import { mapActions, mapState } from 'vuex';

export default {
  computed: mapState('auth', ['user', 'isLoggedIn']),
  methods: mapActions('auth', ['login', 'logout'])
};
</script>



<style lang="scss">


.main {
  margin-top: 2em;
}

.feg{
  font-family: 'Open Sans', sans-serif;
  text-transform: uppercase;
}

.logged-in{
  display: flex;
  flex-direction: row;
}

.avatar{
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 2em;
}

.username{
  color: white;
}
</style>
