<template>
  <div>
    <div class="d-flex justify-content-between align-items-center">
      <h1 class="mb-0">Sprints</h1>

      <nuxt-link v-if="isScrumMaster || isAdmin" to="sprints/create">
        <b-button variant="primary">Create</b-button>
      </nuxt-link>
    </div>

    <div class="table-responsive">
      <table class="table table-hover mt-3">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Start</th>
            <th scope="col">End</th>
            <th scope="col">Velocity</th>
            <th scope="col"></th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody v-if="sprints.length">
          <tr v-for="sprint of sprints" :key="sprint.id">
            <td>
              <nuxt-link
                v-if="hasPermission()"
                :to="{ path: `sprints/${sprint.id}` }"
              >
                {{ sprint.name }}
              </nuxt-link>
  
              <span v-if="!hasPermission()">
                {{ sprint.name }}
              </span>
            </td>
            <td>{{ formatDate(sprint.start) }}</td>
            <td>{{ formatDate(sprint.end) }}</td>
            <td>{{ sprint.velocity }}</td>
            <td class="narrow-col">
              <b-badge :variant="getVariantForSprintStatus(sprint)">{{ getNameForSprintStatus(sprint) }}</b-badge>
            </td>
            <td class="narrow-col">
              <b-icon
                v-if="canChange(sprint)"
                icon="x-lg"
                @click="deleteSprint(sprint)"
                class="center-and-clickable"
              ></b-icon>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td class="text-muted text-center" colspan="6">
              No sprints yet
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { BIcon } from "bootstrap-vue";
import { mapGetters } from "vuex";
import datetime from "@/mixins/datetime";

export default {
  name: "sprints",
  components: {
    BIcon,
  },
  mixins: [datetime],
  computed: {
    ...mapGetters({
      currentUser: "user/getUser",
      isAdmin: "user/isAdmin",
      projectId: "route-id/getProjectId",
    }),
    isScrumMaster() {
      if (!this.currentUser || !this.project) return false;
      return this.currentUser.id === this.project.scrumMasterId;
    },
  },
  data() {
    return {
      project: null,
      sprints: [],
    };
  },
  created() {
    this.getProjectWithData();
  },
  methods: {
    canChange(sprint) {
      return this.hasPermission() && !this.hasSprintStarted(sprint.start);
    },
    hasPermission() {
      return this.isAdmin || this.isScrumMaster || this.isProjectOwner();
    },
    isProjectOwner() {
      if (!this.currentUser || !this.project) return false;
      return this.currentUser.id === this.project.projectOwnerId;
    },
    hasSprintStarted(start) {
      const now = new Date();
      start = new Date(start);
      start.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      return start <= now;
    },
    isSprintActive(sprint) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return new Date(sprint.start) <= now && new Date(sprint.end) >= now;
    },
    hasSprintFinished(sprint) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return new Date(sprint.end) < now;
    },
    getVariantForSprintStatus(sprint) {
      if (this.isSprintActive(sprint)) return "primary";
      else if (this.hasSprintFinished(sprint)) return "danger";
      else return;
    },
    getNameForSprintStatus(sprint) {
      if (this.isSprintActive(sprint)) return "Active";
      else if (this.hasSprintFinished(sprint)) return "Finished";
      else return;
    },
    async getProjectWithData() {
      if (!this.projectId) return;

      await this.$axios.$get(`project/${this.projectId}`).then((res) => {
        if (!res) return;
        this.project = res;
        this.sprints = this.project.sprints;
      });
    },
    async deleteSprint(sprint) {
      let confirmed = false;
      try {
        confirmed = await this.$bvModal.msgBoxConfirm(
          "Are you sure you want to delete this sprint?",
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
        .$delete(`sprints/${sprint.id}`)
        .then((res) => {
          this.sprints = this.sprints.filter((s) => s.id !== sprint.id);
          this.$toast.success("Sprint successfully removed", {
            duration: 3000,
          });
        })
        .catch((reason) => {
          console.error(reason);
          this.$toast.error(
            "An error has occurred, while deleting the sprint",
            {
              duration: 3000,
            }
          );
        });
    },
  },
};
</script>

<style scoped>
.narrow-col {
  width: 3rem
}
</style>
