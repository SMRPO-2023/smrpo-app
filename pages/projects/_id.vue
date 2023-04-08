<!-- This is a container/parent component to hold all child routed components -->
<template>
  <b-container fluid>
    <b-row>
      <b-col offset-lg="2" lg="8" cols="12" class="my-3">
        <div>
          <b-dropdown
            id="projects-navigation-dropdown"
            size="sm"
            :text="getActiveTab('project')"
          >
            <template v-for="tab of projectTabs">
              <b-dropdown-item
                v-if="tab.show"
                :key="tab.name"
                :to="{ path: tab.path }"
                :exact="tab.exact"
                >{{ tab.name }}</b-dropdown-item
              >
            </template>
          </b-dropdown>

          <template v-if="sprintId">
            <b-icon icon="chevron-right" />
            <b-dropdown
              id="sprints-navigation-dropdown"
              size="sm"
              :text="getActiveTab('sprint')"
            >
              <template v-for="tab of sprintTabs">
                <b-dropdown-item
                  v-if="tab.show"
                  :key="tab.name"
                  :to="{ path: tab.path }"
                  :exact="tab.exact"
                  >{{ tab.name }}</b-dropdown-item
                >
              </template>
            </b-dropdown>
          </template>

          <template v-if="storyId">
            <b-icon icon="chevron-right" />
            <b-dropdown
              id="stories-navigation-dropdown"
              size="sm"
              :text="getActiveTab('userStory')"
            >
              <template v-for="tab of userStoryTabs">
                <b-dropdown-item
                  v-if="tab.show"
                  :key="tab.name"
                  :to="{ path: tab.path }"
                  :exact="tab.exact"
                  >{{ tab.name }}</b-dropdown-item
                >
              </template>
            </b-dropdown>
          </template>

          <template v-if="storyId">
            <b-icon icon="chevron-right" />
            <b-dropdown
              id="stories-navigation-dropdown"
              size="sm"
              :text="getActiveTab('userStory')"
            >
              <template v-for="tab of userStoryTabs">
                <b-dropdown-item
                  v-if="tab.show"
                  :key="tab.name"
                  :to="{ path: tab.path }"
                  :exact="tab.exact"
                  >{{ tab.name }}</b-dropdown-item
                >
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
      storyId: "route-id/getStoryId",
      taskId: "route-id/getTaskId",
    }),
    isProjectOwner() {
      if (!this.currentUser || !this.project) return false;
      return this.currentUser.id === this.project.projectOwnerId;
    },
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
    canChangeUserStory() {
      if (!this.userStory) return false;
      return !this.userStory.acceptanceTest && this.userStory.sprintId === null;
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
          name: "Active stories",
          path: `/projects/${this.projectId}/active`,
          exact: false, // because we have a nested route
          show: true,
        },
        {
          name: "Edit",
          path: `/projects/${this.projectId}/edit`,
          exact: true,
          show: this.isAdmin || this.isScrumMaster,
        },
        {
          name: "Product backlog",
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
    userStoryTabs() {
      return [
        {
          name: "View",
          path: `/projects/${this.projectId}/stories/${this.storyId}`,
          exact: true,
          show: true,
        },
        {
          name: "Edit",
          path: `/projects/${this.projectId}/stories/${this.storyId}/edit`,
          exact: true,
          show:
            (this.isAdmin || this.isProjectOwner || this.isScrumMaster) &&
            this.canChangeUserStory,
        },
        {
          name: "Tasks",
          path: `/projects/${this.projectId}/stories/${this.storyId}/tasks`,
          exact: false, // because we have a nested route
          show: true,
        },
      ];
    },
    taskTabs() {
      return [
        {
          name: "View",
          path: `/projects/${this.projectId}/stories/${this.storyId}/tasks/${this.taskId}`,
          exact: true,
          show: true,
        },
        {
          name: "Edit",
          path: `/projects/${this.projectId}/stories/${this.storyId}/tasks/${this.taskId}/edit`,
          exact: true,
          show: true,
        },
      ];
    },
  },
  data() {
    return {
      project: null,
      sprint: null,
      userStory: null,
      task: null,
    };
  },
  mounted() {
    this.getProject();
    this.getSprint();
    this.getUserStory();
    this.getTask();
  },
  methods: {
    getActiveTab(type) {
      let data = [];
      if (type === "project") data = this.projectTabs;
      else if (type === "sprint") data = this.sprintTabs;
      else if (type === "userStory") data = this.userStoryTabs;
      else if (type === "task") data = this.taskTabs;
      else if (type === "activeSprint") data = this.activeSprintTabs;
      else return data;

      return data.find((tab) =>
        tab.exact
          ? tab.path === this.$route.path
          : this.$route.path.startsWith(tab.path)
      )?.name;
    },
    async getProject() {
      if (!this.projectId) return;

      await this.$axios.$get(`project/${this.projectId}`).then((res) => {
        if (!res) return;
        this.project = res;
      });
    },
    async getSprint() {
      if (!this.sprintId) return;

      this.$axios.$get(`sprints/${this.sprintId}`).then((res) => {
        this.sprint = res;
      });
    },
    async getUserStory() {
      if (!this.storyId) return;

      this.$axios.$get(`user-stories/${this.storyId}`).then((res) => {
        this.userStory = res;
      });
    },
    async getTask() {
      if (!this.taskId) return;

      this.$axios
        .$get(`tasks/${this.taskId}`)
        .then((res) => {
          this.task = res;
        });
    },
  },
};
</script>

<style scoped></style>
