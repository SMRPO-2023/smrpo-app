<template>
  <b-container fluid>
    <b-row>
      <b-col v-if="user" class="my-3" cols="12" offset-lg="1" lg="10" offset-xl="2" xl="8">
        <div class="d-flex justify-content-between align-items-center">
          <h1>Your profile</h1>
          <nuxt-link to="profile/edit">
            <b-button variant="primary" v-b-tooltip.hover title="Edit profile">Edit</b-button>
          </nuxt-link>
        </div>
        <div class="mt-3"><b>Username:</b> {{ user.username }}</div>
        <div class="mt-1"><b>First name:</b> {{ user.firstname }}</div>
        <div class="mt-1"><b>Last name:</b> {{ user.lastname }}</div>
        <div class="mt-1"><b>Email:</b> {{ user.email }}</div>
        <div class="mt-1"><b>Role</b>: {{ user.role }}</div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "profile",
  computed: {
    ...mapGetters({
      user: "user/getUser",
    }),
  },
};
</script>

<style scoped></style>
