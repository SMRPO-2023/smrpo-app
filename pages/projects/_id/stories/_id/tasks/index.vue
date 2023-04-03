<template>
  <div>
    <div class="d-flex justify-content-between align-items-center">
      <h1 class="mb-0">Tasks</h1>

      <nuxt-link v-if="canCreate" to="tasks/create">
        <b-button variant="primary">Create</b-button>
      </nuxt-link>
    </div>

    <!-- TODO: table -->
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "tasks",
  computed: {
    ...mapGetters({
      isAdmin: "user/isAdmin",
      currentUser: "user/getUser",
      projectId: "route-id/getProjectId",
      storyId: "route-id/getStoryId",
    }),
    isScrumMaster() {
      if (!this.currentUser || !this.project) return false;
      return this.currentUser.id === this.project.scrumMasterId;
    },
    isDeveloper() {
      if (!this.currentUser || !this.project) return false;
      return this.project.developers.find((u) => u.user.id === this.currentUser.id);
    },
    hasPermission() {
      return this.isAdmin || this.isScrumMaster || this.isDeveloper
    },
    canCreate() {
      if (!this.project || !this.story || !this.sprint) return false;
      return this.hasPermission && !this.story.acceptanceTest && this.story.sprintId && this.isSprintActive;
    },
    isSprintActive() {
      if (!this.sprint) return false;
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return new Date(this.sprint.start) <= now && new Date(this.sprint.end) >= now;
    },
  },
  data() {
    return {
      project: null,
      story: null,
      sprint: null,
    };
  },
  created() {
    this.getProjectWithData();
  },
  methods: {
    async getProjectWithData() {
      if (!this.projectId) return;

      await this.$axios.$get(`project/${this.projectId}`).then((res) => {
        if (!res) return;
        this.project = res;
        this.story = res.UserStory.find((s) => s.id === this.storyId);
        this.sprint = res.sprints.find((s) => s.id === this.story.sprintId);
      });
    },
  },
}
</script>

<style scoped>    
</style>