<template>
  <b-navbar toggleable="md" type="dark" variant="dark" class="fixed-top">
    <nuxt-link class="navbar-brand py-0" href="/" :to="`/`">
      <div class="d-flex justify-content-center align-content-center">
        <div class="ml-3" style="line-height: 2.25rem">SMRPO Project</div>
      </div>
    </nuxt-link>

    <b-navbar-toggle v-if="user" target="nav-collapse"></b-navbar-toggle>

    <b-collapse v-if="user" id="nav-collapse" is-nav>
      <b-navbar-nav>
        <b-nav-item v-if="isAdmin" :to="'/admin/users'">Users</b-nav-item>
        <b-nav-item :to="'/projects'">Projects</b-nav-item>
      </b-navbar-nav>

      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
        <b-nav-item-dropdown right>
          <template #button-content>
            <em>{{ user.firstname }} {{ user.lastname }}</em>
          </template>
          <b-dropdown-item :to="`/profile`">Profile</b-dropdown-item>
          <b-dropdown-item @click="logout">Logout</b-dropdown-item>
          <b-dropdown-divider v-if="user.lastLogin"></b-dropdown-divider>
          <b-dropdown-text v-if="user.lastLogin" style="width: 240px;"><small>Last login: <b>{{ formatDateTime(user.lastLogin) }}</b></small></b-dropdown-text>
        </b-nav-item-dropdown>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
import datetime from "@/mixins/datetime";
import { mapActions, mapGetters } from "vuex";

export default {
  name: "navbar",
  mixins: [datetime],
  async mounted() {
    // get logged in user
    const userId = localStorage.getItem("userId");
    const accessToken = localStorage.getItem("jwt");
    if (userId && accessToken) {
      await this.$store.dispatch("user/fetchUser", userId);
    }
  },
  computed: {
    ...mapGetters({
      user: "user/getUser",
      isAdmin: "user/isAdmin",
      isNormalUser: "user/isNormalUser",
    }),
    ...mapActions(["user/unsetUser", "user/fetchUser"]),
  },
  methods: {
    async logout() {
      localStorage.removeItem("jwt");
      localStorage.removeItem("userId");
      await this.$store.dispatch("user/unsetUser");
      await this.$router.replace("/login");
    },
  },
};
</script>

<style lang="scss" scoped></style>
