<template>
    <section>
            <div class="card">
                <div class="card-image" v-if="isImage($route.params.URL)" style="max-width: 500px;">
                    <figure class="image">
                    <img :src="$route.params.URL" alt="Placeholder image">
                    </figure>
                </div>
                <div class="card-content">
                    <div class="media">
                    <div class="media-left">
                        <figure class="image is-48x48">
                        <img :src="loadedUsersById[$route.params.user_id].image" alt="Placeholder image">
                        </figure>
                    </div>
                    <div class="media-content">
                        <p class="title is-4" v-if="!$route.params.URL">{{$route.params.title}}</p>
                        <p class="title is-4" v-if="$route.params.URL"><a :href="$route.params.URL" target="_blank">{{$route.params.title}}</a></p>
                        <p class="subtitle is-6">{{ loadedUsersById[$route.params.user_id].name }}</p>
                    </div>
                    </div>
                    <div class="content">
                        {{$route.params.description}}
                    </div>
                    <div class="card-footer button-margins" style="border-top: none">
                        <button v-if="isLoggedIn" @click="showForm = !showForm" class="button is-danger button-margins">
                            Responder
                        </button>
                        <button v-if="isLoggedIn" @click="showComments = !showComments" class="button is-info button-margins">
                            Ver comentarios
                        </button>
                    </div>
                </div>
            </div>
            <form v-if="showForm && isLoggedIn" @submit.prevent="onCreateComment()">
                <br>
                <b-field v-text=" 'Responder a ' + loadedUsersById[$route.params.user_id].name + ' :' "></b-field>
                <b-input type="textarea" v-model="comment.message" required></b-input>
                <br>
                <button class="button is-success">Enviar</button>
            </form>
            <div v-if="showComments && isLoggedIn" class="comments">
                <div v-if="!commentsNumber.length" class="card-content">   
                    <div class="card">    
                        <div class="content">
                            <br>
                            No hay comentarios en este post.
                            <br>
                        </div>
                    </div>
                </div>
                <div v-else>
                    <div v-for="(comment, index) in orderedComments" :key="comment.id">
                        <div class="card">
                            <div class="card-content">
                                <div class="media">
                                    <div class="media-left">
                                        <figure class="image is-48x48">
                                        <img :src="loadedUserCommentsById[comment.user_id].image" alt="Placeholder image">
                                        </figure>
                                    </div>
                                    <div class="media-content">
                                        <p class="subtitle is-6">{{ loadedUserCommentsById[comment.user_id].name }}</p>
                                    </div>
                                </div>
                                <div class="content">
                                    {{comment.message}}
                                    <br>
                                    <i>{{getCreated(index)}}</i>
                                    <br>
                                </div>
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
        showComments: false,
        comment: {
            message: '',
            post_id: '',
        }
    }),
    mounted() {
        this.initUsers();
        this.initSubreddit(this.$route.params.name);
        this.initComments(this.$route.params.post_id);  
    },
    watch: {
        '$route.params.name'() {
        this.initSubreddit(this.$route.params.name); 
        },
        '$route.params.post_id'(){
            console.log("Reinicio todos los valores - NO VA");
            this.initSubreddit(this.$route.params.name); 

            if(this.subreddit.id){
                this.initPosts(this.subreddit.id);
            }

            this.initComments(this.$route.params.post_id);
        }
    },
    computed: {
        commentsNumber: function() {
            return this.comments.filter(i => i.comment !== null)
        },    
        orderedComments: function () {
            this.comments.sort(function(x, y){ return x.created_at.seconds - y.created_at.seconds; })
            return this.comments;
        },
        ...mapState('subreddit', ['posts', 'comments']),
        ...mapState('auth', ['isLoggedIn', 'user']),
        ...mapGetters({
            subreddit: 'subreddit/subreddit',
            usersById: 'users/usersById',
            coments: 'subreddit/comments'
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
        loadedUserCommentsById() {
            return this.comments.reduce((byId, comment) => {
                byId[comment.user_id] = this.usersById[comment.user_id] || {
                    name: 'Cargando...',
                    image: 'https://bulma.io/images/placeholders/48x48.png'
                };
                return byId;
            }, {});
        },
    },
    methods: {
        ...mapActions('subreddit', ['initSubreddit', 'initPosts', 'initComments', 'createComment']),
        ...mapActions('users', { initUsers: 'init' }),   
        isImage(url){
            return url.match(/(png|jpg|jpeg|gif)$/)
        },
        async onCreateComment(){
            if (this.comment.message) {

                this.comment.post_id = this.$route.params.post_id;
                this.showForm = false;

                await this.createComment(this.comment);
                
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
            
            return timeSince(this.comments[index].created_at.seconds * 1000) < 0 ?
            'hace 0 segundos' :
            `hace ${timeSince(this.comments[index].created_at.seconds * 1000)}`;
        }, 
    },
};

</script>

<style>

.comments{
    margin-top: 2em;
    margin-bottom: 2em;
}

.card {
    margin: 1%;
    border-radius: 5px;
    height: 100%;
}

.card img {
    border-radius: 5px;
}

.button-margins{
    margin: 1em 0.5em 0 0.5em;
}

</style>