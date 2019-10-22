<template>
    <section>
        <form @submit.prevent="onUpdatePost()">
            <br>
            <b-field label="Título">
                <b-input v-model="$route.params.title" required></b-input>
            </b-field>
            <b-field label="Descripción">
                <b-input type="textarea" v-model="$route.params.description" required></b-input>
            </b-field>
            <b-field label="URL externa/Imagen de cabecera">
                <b-input v-model="$route.params.URL" type="url"></b-input>
            </b-field>
            <button class="button is-success">Actualizar</button>
        </form>
    </section>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
    data: () => ({
    post: {
        id: '',
        title: '',
        description: '',
        URL: '',
    }
    }),
    computed: mapState('subreddit', ['posts']),
    methods: {   
        ...mapActions('subreddit', ['updatePost']),
        async onUpdatePost() {
            this.post = {
                id: this.$route.params.post_id,
                title: this.$route.params.title,
                description: this.$route.params.description,
                URL: this.$route.params.URL,
            };

            if (this.post.title && (this.post.description || this.post.URL)) {
                await this.updatePost(this.post);
            }
        },
    },
};
</script>

<style>

</style>