<template>
  <b-container fluid>
    <b-row>
      <b-col v-if="user" offset-lg="2" lg="8" cols="12" class="my-3">
        <h1>Tvoj profil</h1>

        <div class="mt-3"><b>Uporabniško ime:</b> {{ user.username }}</div>
        <div class="mt-1"><b>Email:</b> {{ user.email }}</div>
        <div class="mt-1"><b>Vloga</b>: {{ user.role }}</div>

        <ChangePass type="int" class="mt-3"/>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import {mapActions, mapGetters} from "vuex";

export default {
  name: "profile",
  computed: {
    ...mapGetters({
      user: 'user/getUser',
    }),
  },
}
</script>

<style scoped>

</style>
