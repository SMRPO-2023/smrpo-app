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
            <th scope="col">Hours</th>
            <th scope="col">Assigned to</th>
            <th scope="col">Status</th>
            <th scope="col">Done</th>
            <th scope="col"></th>
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
            <td>
              <b-badge v-if="task.done" variant="success">Yes</b-badge>
              <b-badge v-else variant="danger">No</b-badge>
            </td>
            <td>
              <!-- accept/reject task that was assigned to me -->
              <b-button-group size="sm" v-if="isMyTask(task) && task.status !== 'UNASSIGNED'">
                <b-button 
                  @click="acceptRejectTask(task, true)" 
                  :disabled="!canAccept(task)"
                >Accept</b-button>
                <b-button 
                  @click="acceptRejectTask(task, false)"
                  :disabled="!canReject(task)"
                >Reject</b-button>
              </b-button-group>

              <!-- self assign empty task -->
              <b-button 
                v-else-if="task.status === 'UNASSIGNED'"
                @click="acceptRejectTask(task, true)"
                size="sm"
              >Assign to me</b-button>
            </td>
            <td class="narrow-col">
              <b-icon
                v-b-tooltip.hover title="Delete task"
                v-if="hasPermission && canDelete(task)"
                icon="x-lg"
                @click="deleteTask(task)"
                class="center-and-clickable"
              ></b-icon>
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
    isMyTask(task) {
      if (!this.currentUser || !task) return false;
      return task.userId === this.currentUser.id;
    },
    canAccept(task) {
      if (!this.isMyTask(task)) return false;
      return task.status !== 'ACCEPTED' && task.status !== 'FINISHED';
    },
    canReject(task) {
      if (!this.isMyTask(task)) return false;
      return task.status === 'ASSIGNED' || task.status === 'ACCEPTED';
    },
    canDelete(task) {
      if (!task) return false;
      return task.status === 'UNASSIGNED' || task.status === 'ASSIGNED';
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
    async acceptRejectTask(task, isAccepting) {
      let confirmed = false;
      try {
        confirmed = await this.$bvModal.msgBoxConfirm(
          "Are you sure you want to " + (isAccepting ? 'accept' : 'reject') + " this task?",
          {
            title: (isAccepting ? 'Accept' : 'Reject') + " task",
            cancelTitle: "Cancel",
            okTitle: "Confirm",
          }
        );
      } catch (error) {
        console.error(error);
      }
      if (!confirmed) return;

      this.$axios
        .$post(`tasks/${task.id}/${isAccepting ? 'accept' : 'reject'}`)
        .then((res) => {
          if (!res) return;
          // find and replace updated task from tasks array
          const index = this.tasks.findIndex((t) => t.id === res.id);
          this.tasks.splice(index, 1, res);
          console.log(res);

          this.$toast.success("Task successfully " + (isAccepting ? 'accepted' : 'rejected'), {
            duration: 3000,
          });
        })
        .catch((reason) => {
          console.error(reason);
          this.$toast.error(
            "An error has occurred, while " + (isAccepting ? 'accepting' : 'rejecting') + " the task",
            {
              duration: 3000,
            }
          );
        });
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