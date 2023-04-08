<template>
  <div>
    <div class="d-flex justify-content-between align-items-center">
      <h1 class="mb-0">Tasks</h1>

      <nuxt-link v-if="canCreate" to="tasks/create">
        <b-button variant="primary">Create</b-button>
      </nuxt-link>
    </div>

    <table class="table table-hover mt-3 w-100">
      <thead>
        <tr>
          <th scope="col">Title</th>
          <th scope="col">Description</th>
          <th scope="col">Hours</th>
          <th scope="col">Assigned to</th>
          <th scope="col">Done</th>
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
          <td>{{ task.hours }}</td>
          <td>
            <span v-if="task.status === 'ASSIGNED'">
              {{ task.assignedTo.username }}
            </span>
            <span v-else class="text-muted">
              Nobody
            </span>
          </td>
          <td>
            <b-button
              v-if="task.done"
              size="sm"
              variant="success"
              disabled
            >
              Yes
            </b-button>
            <b-button
              v-else
              size="sm"
              variant="danger"
              disabled
            >
              No
            </b-button>
          </td>
          <td class="narrow-col">
            <b-icon
              v-if="hasPermission"
              icon="x-lg"
              @click="deleteTask(task)"
              class="center-and-clickable"
            ></b-icon>
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr>
          <td class="text-muted text-center" colspan="6">
            No tasks yet
          </td>
        </tr>
      </tbody>
    </table>
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
      tasks: [],
    };
  },
  created() {
    this.getProjectWithData();
    this.getTasks();
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
    async getTasks() {
      if (!this.storyId) return;

      await this.$axios
        .$get(`tasks`, { params: { usid: this.storyId } })
        .then((res) => {
          if (!res) return;
          this.tasks = res;
        })
    },
    async deleteTask(task) {
      let confirmed = false;
      try {
        confirmed = await this.$bvModal.msgBoxConfirm(
          "Are you sure you want to delete this task?",
          {
            title: "Delete",
            cancelTitle: "Cancel",
            okTitle: "Confirm",
          }
        );
      } catch (error) {
        console.error(error);
      }

      if (!confirmed) return;

      this.$axios
        .$delete(`tasks/${task.id}`)
        .then((res) => {
          this.tasks = this.tasks.filter((t) => t.id !== task.id);
          this.$toast.success("Task successfully removed", {
            duration: 3000,
          });
        })
        .catch((reason) => {
          console.error(reason);
          this.$toast.error(
            "An error has occurred, while deleting the task",
            {
              duration: 3000,
            }
          );
        });
    },
  },
}
</script>

<style scoped>    
</style>