<template>
  <b-container fluid>
    <b-row>
      <b-col v-if="user" offset-lg="2" lg="8" cols="12" class="my-3">
        <div class="d-flex justify-content-between align-items-center">
          <h1>Your profile</h1>
          <nuxt-link to="profile/edit">
            <b-button variant="primary">Edit</b-button>
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
