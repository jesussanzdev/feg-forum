<template>
    <section>
        <button v-if="isLoggedIn" @click="showForm = !showForm" class="button is-info">Crear publicación</button>
        <form v-if="showForm && isLoggedIn" @submit.prevent="onCreatePost()">
            <br>
            <b-field label="Título">
                <b-input v-model="post.title" required></b-input>
            </b-field>
            <b-field label="Descripción">
                <b-input type="textarea" v-model="post.description" required></b-input>
            </b-field>
            <b-field label="URL externa/Imagen de cabecera">
                <b-input v-model="post.URL" type="url"></b-input>
            </b-field>
            <button class="button is-success">Añadir publicación</button>
        </form>
        <form class="search-form">
        <b-field label="Buscar">
        <b-input v-model="searchTerm"></b-input>
        </b-field> 
        </form>
        <div class="posts columns is-multiline is-4">
            <div class="column is-4" v-for="(post, index) in filteredPosts" :key="post.id">
                <div class="card">
                    <div class="card-image" v-if="isImage(post.URL)" style="max-width: 500px;">
                        <figure class="image">
                        <img :src="post.URL" alt="Placeholder image">
                        </figure>
                    </div>
                    <div class="card-content">
                        <div class="media">
                        <div class="media-left">
                            <figure class="image is-48x48">
                            <img :src="loadedUsersById[post.user_id].image" alt="Placeholder image">
                            </figure>
                        </div>
                        <div class="media-content">
                            <p class="title is-4" v-if="!post.URL">{{post.title}}</p>
                            <p class="title is-4" v-if="post.URL"><a :href="post.URL" target="_blank">{{post.title}}</a></p>
                            <p class="subtitle is-6">{{ loadedUsersById[post.user_id].name }}</p>
                        </div>
                        </div>
                        <div class="content">
                            {{post.description}}
                            <br>
                            <i>{{getCreated(index)}}</i>
                            <br>
                        </div>
                        <div class="card-footer" style="border-top: none">    
                            <router-link 
                            :to="{
                                name: 'post',
                                params: {
                                    name: $route.params.name,
                                    title: post.title,
                                    post_id: post.id,
                                    user_id: post.user_id,
                                    description: post.description,
                                    URL: post.URL,
                                }
                            }" 
                            class="button is-primary button-margins">Ver</router-link>
                            <router-link
                            v-if="user && user.id == post.user_id"
                            :to="{
                                name: 'editarPost',
                                params: {
                                    name: $route.params.name,
                                    title: post.title,
                                    post_id: post.id,
                                    description: post.description,
                                    URL: post.URL,
                                }
                            }" 
                            class="button is-info button-margins">Editar</router-link>
                            <button @click="onDelete(post.id)" v-if="user && user.id == post.user_id" class="button is-danger button-margins">
                            Borrar
                            </button>
                        </div>
                    </div>
                </div>
            </div> 

        </div>
    </section>

</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';

export default {
    data: () => ({
        showForm: false,
        searchTerm: '',
        post: {
            title: '',
            description: '',
            URL: '',
        }
    }),
    mounted() {
        this.initUsers();
        this.initSubreddit(this.$route.params.name);
    },
    watch: {
        '$route.params.name'() {
            this.initSubreddit(this.$route.params.name); 
        },
        subreddit() {
            if (this.subreddit.id){
            this.initPosts(this.subreddit.id);
            }
        },
    },
    computed: {
        ...mapState('subreddit', ['posts']),
        ...mapState('auth', ['isLoggedIn', 'user']),
        ...mapGetters({
            subreddit: 'subreddit/subreddit',
            usersById: 'users/usersById',
        }),
        loadedUsersById() {
            return this.posts.reduce((byId, post) => {
                byId[post.user_id] = this.usersById[post.user_id] || {
                    name: 'Cargando...',
                    image: 'https://bulma.io/images/placeholders/48x48.png'
                };
                return byId;
            }, {});
        },
        filteredPosts() {
            if (this.searchTerm) {
                const regexp = new RegExp(this.searchTerm, 'gi');
                return this.posts.filter(post => {
                    return (post.title + post.description).match(regexp);
                });
            }
            return this.posts;
        },
    },
    methods: {
        isImage(url){
            return url.match(/(png|jpg|jpeg|gif)$/)
        },
        ...mapActions('subreddit', ['createPost', 'initComments', 'initSubreddit', 'initPosts', 'deletePost']),
        ...mapActions('users', { initUsers: 'init' }),
        async onCreatePost() {
            if (this.post.title && (this.post.description || this.post.URL)) {
                await this.createPost(this.post);
                this.post = {
                    title: '',
                    description: '',
                    URL: '',
                };
                this.showForm = false;
            }
        },
        getCreated(index) {
            function timeSince(date) {
                const seconds = Math.floor((new Date() - date) / 1000);

                let interval = Math.floor(seconds / 31536000);

                if (interval > 1) {
                return `${interval} años`;
                }
                interval = Math.floor(seconds / 2592000);
                if (interval > 1) {
                return `${interval} meses`;
                }
                interval = Math.floor(seconds / 86400);
                if (interval > 1) {
                return `${interval} días`;
                }
                interval = Math.floor(seconds / 3600);
                if (interval > 1) {
                return `${interval} horas`;
                }
                interval = Math.floor(seconds / 60);
                if (interval > 1) {
                return `${interval} minutos`;
                }
                return `${Math.floor(seconds)} segundos`;
            }
            
            return timeSince(this.posts[index].created_at.seconds * 1000) < 0 ?
            'hace 0 segundos' :
            `hace ${timeSince(this.posts[index].created_at.seconds * 1000)}`;
        },
        onDelete(post_id){
            //Cargamos los comentarios asociados al post
            this.initComments(post_id);

            //Borramos post y comentarios asociados
            this.deletePost(post_id);
        }   
    }, 
};
</script>

<style>

.posts{
    margin-top: 2em;
}

.card {
    margin: 1%;
    border-radius: 5px;
    height: 100%;
}

.card img {
    border-radius: 5px;
}

.search-form {
    margin-top: 2em;
}

.button-margins{
    margin: 1em 0.5em 0 0.5em;
}

</style>