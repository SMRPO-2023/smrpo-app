<!-- This is a container/parent component to hold all child routed components -->
<template>
  <b-container fluid>
    <b-row>
      <b-col offset-lg="2" lg="8" cols="12" class="my-3">
        <div>
          <b-nav pills small>
            <b-nav-item
              :to="{ path: `/projects/${this.projectId}` }"
              :exact="true"
              >View</b-nav-item
            >
            <b-nav-item
              :to="{ path: `/projects/${this.projectId}/project` }"
              :exact="true"
              v-if="isAdmin"
              >Edit</b-nav-item
            >
            <b-nav-item
              :to="{ path: `/projects/${this.projectId}/stories` }"
              :exact="true"
              >Stories</b-nav-item
            >
            <b-nav-item
              :to="{ path: `/projects/${this.projectId}/sprints` }"
              :exact="true"
              >Sprints</b-nav-item
            >
          </b-nav>
        </div>
      </b-col>
    </b-row>
    <b-row>
      <b-col offset-lg="2" lg="8" cols="12">
        <NuxtChild />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "project-parent-container",
  computed: {
    ...mapGetters({
      isAdmin: "user/isAdmin",
      projectId: "route-id/getProjectId",
    }),
  },
};
</script>

<style scoped></style>
