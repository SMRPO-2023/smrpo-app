<template>
  <b-navbar toggleable="md" type="dark" variant="dark" class="fixed-top">
    <nuxt-link class="navbar-brand py-0" href="/" :to="`/`">
      <div class="d-flex justify-content-center align-content-center">
        <div class="ml-3" style="line-height: 2.25rem">SMRPO projekt</div>
      </div>
    </nuxt-link>
    
    <b-navbar-toggle v-if="user" target="nav-collapse"></b-navbar-toggle>

    <b-collapse v-if="user" id="nav-collapse" is-nav>
      <b-navbar-nav>
        <b-nav-item v-if="isAdmin" :to="'/admin/users'">Uporabniki</b-nav-item>
        <b-nav-item :to="'/projects'">Projekti</b-nav-item>
        <b-nav-item :to="'/stories'">Zgodbe</b-nav-item>
        <b-nav-item :to="'/sprints'">Sprinti</b-nav-item>
      </b-navbar-nav>

      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
        <b-nav-item-dropdown right>
          <template #button-content>
            <em>{{ user.firstname }}</em>
          </template>
          <b-dropdown-item :to="`/profile`">Profil</b-dropdown-item>
          <b-dropdown-item @click="logout">Odjava</b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
import {mapActions, mapGetters} from "vuex";

export default {
  name: "navbar",
  async mounted() {
    const userId = localStorage.getItem('userId');
    const accessToken = localStorage.getItem('jwt');
    if (userId && accessToken) {
      await this.$store.dispatch('user/fetchUser', userId);
    }
  },
  computed: {
    ...mapGetters({
      user: 'user/getUser',
      isAdmin: 'user/isAdmin',
      isNormalUser: 'user/isNormalUser',
    }),
    ...mapActions(['user/unsetUser', 'user/fetchUser'])
  },
  methods: {
    async logout() {
      localStorage.removeItem('jwt');
      localStorage.removeItem('userId');
      await this.$store.dispatch('user/unsetUser');
      await this.$router.replace('/login')
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
