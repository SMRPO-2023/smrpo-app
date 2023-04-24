<template>
  <ul class="list-group list-group-flush">
    <template v-for="task of tasks">
      <li
        class="list-group-item pl-0 py-2 d-flex justify-content-between align-items-center"
      >
        <b-row class="flex-grow-1">
          <!-- Task title -->
          <b-col cols>
            <b-icon icon="caret-right-fill"></b-icon>
            <nuxt-link :to="{ path: `/projects/${story.projectId}/stories/${story.id}/tasks/${task.id}` }">
              {{ task.title }}
            </nuxt-link>
          </b-col>

          <!-- Task estimated hours -->
          <b-col cols="2" class="px-0">
            <span :id="`task-hours-${task.id}`">
              <b-avatar icon="clock" size="sm"></b-avatar>
              <span>{{ getRemainingHours(task) }}/{{ getTotalSpentHours(task) }}/{{ task.estimate }}h</span>
            </span>
            <b-tooltip :target="`task-hours-${task.id}`" triggers="hover">
              Remaining / Total spent / Initial estimate
            </b-tooltip>
          </b-col>

          <!-- Task developer and status -->
          <b-col cols="4">
            <b-avatar size="sm"></b-avatar>
            <template v-if="task.status !== 'UNASSIGNED'">
              <span>{{ task.assignedTo?.username }}</span>
            </template>
            <b-badge :variant="getVariantForTaskStatus(task.status)">
              {{ task.status }}
            </b-badge>
          </b-col>

          <!-- Dropdown -->
          <b-col cols="1" class="text-right">
            <tasks-dropdown
              :task="task"
              :small="true"
              :has-permission-to-delete="!!hasPermissionToDelete"
              @taskUpdated="onTaskUpdate"
              @taskDeleted="onTaskDelete"
            ></tasks-dropdown>
          </b-col>
        </b-row>
      </li>
    </template>
  </ul>
</template>

<script>
import { BIcon } from "bootstrap-vue";
import priorities from "@/mixins/priorities";
import { mapGetters } from "vuex";

export default {
  name: "task-list",
  components: {
    BIcon
  },
  mixins: [priorities],
  props: {
    project: {
      type: Object | null,
      required: true
    },
    story: {
      type: Object,
      required: true
    },
    tasks: {
      type: Array,
      default: () => []
    },
  },
  computed: {
    ...mapGetters({
      isAdmin: "user/isAdmin",
      currentUser: "user/getUser",
      projectId: "route-id/getProjectId",
    }),
    isScrumMaster() {
      if (!this.currentUser || !this.project) return false;
      return this.currentUser.id === this.project.scrumMasterId;
    },
    isDeveloper() {
      if (!this.currentUser || !this.project) return false;
      return !!this.project.developers.find((u) => u.user.id === this.currentUser.id);
    },
    hasPermissionToDelete() {
      return this.isAdmin || this.isScrumMaster || this.isDeveloper;
    },
  },
  methods: {
    getTotalSpentHours(task) {
      if (!task?.timeLogs?.length) return 0;
      const total = task.timeLogs.reduce((prev, curr) => prev + curr.hours, 0);
      return this.round(total);
    },
    getRemainingHours(task) {
      if (!task?.timeLogs?.length) return 0;
      const remaining = task.timeLogs.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]?.remainingHours || 0;
      return this.round(remaining);
    },
    round(num) {
      return Math.round(num * 10) / 10;
    },
    onTaskUpdate(task) {
      this.$emit("taskUpdated", this.story, task);
    },
    onTaskDelete(task) {
      this.$emit("taskDeleted", this.story, task)
    },
  }
}
</script>
<style scoped>
a {
  color: black !important;
}
</style>
