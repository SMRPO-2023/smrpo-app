<!-- This is a container/parent component to hold all child routed components -->
<template>
  <b-container fluid>
    <b-row>
      <b-col class="my-3" cols="12" offset-lg="1" lg="10" offset-xl="2" xl="8">
        <div>
          <!-- Project -->
          <span>{{ getProjectTitle }}</span>
          <b-icon icon="chevron-right" />
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

          <!-- Sprint -->
          <template v-if="sprintId">
            <b-icon icon="chevron-right" />
            <span>{{ getSprintTitle }}</span>
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

          <!-- User story -->
          <template v-if="storyId">
            <b-icon icon="chevron-right" />
            <span>{{ getUserStoryTitle }}</span>
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

          <!-- Task -->
          <template v-if="taskId">
            <b-icon icon="chevron-right" />
            <span>{{ getTaskTitle }}</span>
            <b-icon icon="chevron-right" />
            <b-dropdown
              id="tasks-navigation-dropdown"
              size="sm"
              :text="getActiveTab('task')"
            >
              <template v-for="tab of taskTabs">
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
      <b-col cols="12" offset-lg="1" lg="10" offset-xl="2" xl="8">
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
    isProductOwner() {
      if (!this.currentUser || !this.project) return false;
      return this.currentUser.id === this.project.projectOwnerId;
    },
    isScrumMaster() {
      if (!this.currentUser || !this.project) return false;
      return this.currentUser.id === this.project.scrumMasterId;
    },
    isDeveloper() {
      if (!this.currentUser || !this.project) return false;
      return !!this.project.developers.find((u) => u.user.id === this.currentUser.id);
    },
    hasSprintFinished() {
      if (!this.sprint) return false;
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return new Date(this.sprint.end) < now;
    },
    canChangeUserStory() {
      if (!this.userStory) return false;
      return !this.userStory.acceptanceTest && this.userStory.sprintId === null;
    },
    isUserStoryAddedToSprint() {
      if (!this.userStory) return false;
      return this.userStory.sprintId !== null;
    },
    getProjectTitle() {
      if (!this.project) return "";
      return this.project.title;
    },
    getSprintTitle() {
      if (!this.sprint) return "";
      return this.sprint.name;
    },
    getUserStoryTitle() {
      if (!this.userStory) return "";
      return this.userStory.title;
    },
    getTaskTitle() {
      if (!this.task) return "";
      return this.task.title;
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
          show: this.isAdmin || this.isScrumMaster,
        },
        {
          name: "Wall",
          path: `/projects/${this.projectId}/wall`,
          exact: true,
          show: true,
        },
        {
          name: "Documentation",
          path: `/projects/${this.projectId}/documentation`,
          exact: true,
          show: true,
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
        {
          name: "Sprint backlog",
          path: `/projects/${this.projectId}/sprint-backlog`,
          exact: true,
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
          show: (this.isAdmin || this.isScrumMaster) && !this.hasSprintFinished,
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
            (this.isAdmin || this.isProductOwner || this.isScrumMaster) &&
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
          show: (this.isAdmin || this.isScrumMaster || this.isDeveloper) && this.isUserStoryAddedToSprint && this.isSprintActive(this.userStory?.Sprint),
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
  created() {
    // subscribe to store entity id changes
    // and refresh the data for possible changes to title/name
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === "route-id/setProjectId") {
        this.getProject();
      } else if (mutation.type === "route-id/setSprintId") {
        this.getSprint();
      } else if (mutation.type === "route-id/setStoryId") {
        this.getUserStory();
      } else if (mutation.type === "route-id/setTaskId") {
        this.getTask();
      }
    });
  },
  methods: {
    isSprintActive(override = null) {
      const sprint = override || this.sprint;
      if (!sprint) return false;
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return new Date(sprint.start) <= now && new Date(sprint.end) >= now;
    },
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
        this.sprint = res.sprint;
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

      this.$axios.$get(`tasks/${this.taskId}`).then((res) => {
        this.task = res;
      });
    },
  },
  beforeDestroy() {
    this.unsubscribe();
  },
};
</script>

<style scoped>
a:hover {
  text-decoration: underline;
}
a {
  color: black !important;
}
</style>
