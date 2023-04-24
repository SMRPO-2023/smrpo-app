<template>
  <div>
    <div class="d-flex justify-content-between align-items-center">
      <h1 class="mb-0">Tasks</h1>

      <nuxt-link v-if="canCreate" to="tasks/create">
        <b-button v-b-tooltip.hover title="Add task" variant="primary">Create</b-button>
      </nuxt-link>
    </div>

    <div class="table-responsive">
      <table class="table table-hover mt-3">
        <thead>
          <tr>
            <th scope="col">Title</th>
            <th scope="col">Description</th>
            <th scope="col">Remaining</th>
            <th scope="col">Total spent</th>
            <th scope="col">Estimated</th>
            <th scope="col">Assigned to</th>
            <th scope="col">Status</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody v-if="tasks.length">
          <tr v-for="task of tasks" :key="task.id">
            <td>
              <nuxt-link :to="{ path: `tasks/${task.id}` }">
                {{ task.title }}
              </nuxt-link>
            </td>
            <td>{{ task.description | limit(100) }}</td>
            <td>{{ getRemainingHours(task) }}h</td>
            <td>{{ getTotalSpentHours(task) }}h</td>
            <td>{{ task.estimate }}h</td>
            <td>
              <span v-if="task.status !== 'UNASSIGNED'">
                <template v-if="task.assignedTo && task.userId">
                  {{ task.assignedTo?.username }}
                  <span class="text-muted" v-if="isMyTask(task)"> (you)</span>
                </template>
                <span v-else class="text-muted">
                  Unknown
                </span>
              </span>
              <span v-else class="text-muted">
                Nobody
              </span>
            </td>
            <td>
              <b-badge :variant="getVariantForTaskStatus(task.status)">{{ task.status }}</b-badge>
            </td>
            <td class="narrow-col">
              <tasks-dropdown
                :task="task"
                :has-permission-to-delete="hasPermission"
                @taskUpdated="onTaskUpdate"
                @taskDeleted="onTaskDelete"
              />
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td class="text-muted text-center" colspan="8">
              No tasks yet
            </td>
          </tr>
        </tbody>
        <tfoot v-if="tasks.length" class="font-weight-bold">
          <tr>
            <td colspan="2">Total</td>
            <td>{{ getTasksRemainingHours }}h</td>
            <td>{{ getTasksTotalSpentHours }}h</td>
            <td>{{ getTasksEstimatedHours }}h</td>
            <td colspan="4"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import priorities from "@/mixins/priorities";

export default {
  name: "tasks",
  mixins: [priorities],
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
      return !!this.project.developers.find((u) => u.user.id === this.currentUser.id);
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
    getTasksRemainingHours() {
      const sum = this.tasks.reduce((prev, curr) => prev + this.getRemainingHours(curr), 0);
      return Math.round(sum * 10) / 10;
    },
    getTasksTotalSpentHours() {
      const sum = this.tasks.reduce((prev, curr) => prev + this.getTotalSpentHours(curr), 0);
      return Math.round(sum * 10) / 10;
    },
    getTasksEstimatedHours() {
      const sum = this.tasks.reduce((prev, curr) => prev + curr.estimate, 0);
      return Math.round(sum * 10) / 10;
    },
  },
  data() {
    return {
      project: null,
      story: null,
      sprint: null,
      tasks: [],
    };
  },
  created() {
    this.getProjectWithData();
    this.getTasks();
  },
  methods: {
    getTotalSpentHours(task) {
      if (!task?.timeLogs?.length) return 0;
      const total = task.timeLogs.reduce((prev, curr) => prev + curr.hours, 0);
      return this.round(total);
    },
    getRemainingHours(task) {
      if (!task?.timeLogs?.length) return 0;
      const remaining = task.timeLogs.slice().sort((a, b) => b.createdAt - a.createdAt)[0]?.remainingHours || 0;
      return this.round(remaining);
    },
    round(num) {
      return Math.round(num * 10) / 10;
    },
    isMyTask(task) {
      if (!this.currentUser || !task) return false;
      return task.userId === this.currentUser.id;
    },
    async getProjectWithData() {
      if (!this.projectId) return;

      await this.$axios.$get(`project/${this.projectId}`).then((res) => {
        if (!res) return;
        this.project = res;
        this.story = res.UserStory.find((s) => s.id === this.storyId);
        this.sprint = res.sprints.find((s) => s.id === this.story.sprintId);
      });
    },
    async getTasks() {
      if (!this.storyId) return;

      await this.$axios
        .$get(`tasks`, { params: { usid: this.storyId } })
        .then((res) => {
          if (!res) return;
          this.tasks = res;
        })
    },
    onTaskUpdate(task) {
      // find and replace updated task from tasks array
      const index = this.tasks.findIndex((t) => t.id === task.id);
      if (index < 0) return;
      this.tasks.splice(index, 1, task);
    },
    onTaskDelete(task) {
      this.tasks = this.tasks.filter((t) => t.id !== task.id);
    },
  },
}
</script>

<style scoped>
</style>
