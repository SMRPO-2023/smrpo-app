<!-- This is a container/parent component to hold all child routed components -->
<template>
  <b-container fluid>
    <b-row>
      <b-col offset-lg="2" lg="8" cols="12" class="my-3">
        <div>
          <b-dropdown id="projects-navigation-dropdown" size="sm" :text="getActiveProjectTab()">
            <template v-for="projectTab of projectTabs">
              <b-dropdown-item 
                v-if="projectTab.show" 
                :key="projectTab.name" 
                :to="{ path: projectTab.path }" 
                :exact="projectTab.exact"
              >{{ projectTab.name }}</b-dropdown-item>
            </template>
          </b-dropdown>

          <template v-if="sprintId">
            <b-icon icon="chevron-right" />
            <b-dropdown id="sprints-navigation-dropdown" size="sm" :text="getActiveSprintTab()">
              <template v-for="sprintTab of sprintTabs">
                <b-dropdown-item 
                  v-if="sprintTab.show" 
                  :key="sprintTab.name" 
                  :to="{ path: sprintTab.path }" 
                  :exact="sprintTab.exact"
                >{{ sprintTab.name }}</b-dropdown-item>
              </template>
            </b-dropdown>
          </template>
        </div>
      </b-col>
    </b-row>
    <hr class="mt-0 mb-4" />
    <b-row>
      <b-col offset-lg="2" lg="8" cols="12">
        <NuxtChild />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { BIcon } from "bootstrap-vue";
import { mapGetters } from "vuex";

export default {
  name: "project-parent-container",
  components: {
    BIcon,
  },
  computed: {
    ...mapGetters({
      currentUser: "user/getUser",
      isAdmin: "user/isAdmin",
      projectId: "route-id/getProjectId",
      sprintId: "route-id/getSprintId",
    }),
    isScrumMaster() {
      if (!this.currentUser || !this.project) return false;
      return this.currentUser.id === this.project.scrumMasterId;
    },
    hasSprintStarted() {
      if (!this.sprint) return false;
      const now = new Date();
      const start = new Date(this.sprint.start);
      start.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      return start <= now;
    },
    projectTabs() {
      return [
        {
          name: "View",
          path: `/projects/${this.projectId}`,
          exact: true,
          show: true,
        },
        {
          name: "Edit",
          path: `/projects/${this.projectId}/edit`,
          exact: true,
          show: this.isAdmin,
        },
        {
          name: "Stories",
          path: `/projects/${this.projectId}/stories`,
          exact: false, // because we have a nested route
          show: true,
        },
        {
          name: "Sprints",
          path: `/projects/${this.projectId}/sprints`,
          exact: false, // because we have a nested route
          show: true,
        },
      ];
    },
    sprintTabs() {
      return [
        {
          name: "View",
          path: `/projects/${this.projectId}/sprints/${this.sprintId}`,
          exact: true,
          show: true,
        },
        {
          name: "Edit",
          path: `/projects/${this.projectId}/sprints/${this.sprintId}/edit`,
          exact: true,
          show: (this.isAdmin || this.isScrumMaster) && !this.hasSprintStarted,
        },
      ];
    },
  },
  data() {
    return {
      project: null,
      sprint: null,
    };
  },
  mounted() {
    this.getProject();
    this.getSprint();
  },
  methods: {
    getActiveProjectTab() {
      return this.projectTabs.find((tab) => tab.exact ? tab.path === this.$route.path : this.$route.path.startsWith(tab.path))?.name;
    },
    getActiveSprintTab() {
      return this.sprintTabs.find((tab) => tab.exact ? tab.path === this.$route.path : this.$route.path.startsWith(tab.path))?.name;
    },
    async getProject() {
      if (!this.projectId) return;

      await this.$axios
        .$get(`project/${this.projectId}`)
        .then((res) => {
          if (!res) return;
          this.project = res;
        });
    },
    async getSprint() {
      if (!this.sprintId) return;

      this.$axios
        .$get(`sprints/${this.sprintId}`)
        .then((res) => {
          this.sprint = res;
        });
    },
  },
};
</script>

<style scoped></style>
