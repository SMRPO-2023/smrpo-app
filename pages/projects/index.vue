<template>
  <b-container fluid>
    <b-row>
      <b-col offset-lg="2" lg="8" cols="12" class="my-3">
        <div class="d-flex justify-content-between align-items-center">
          <h1 class="mb-0">Projects</h1>
          <nuxt-link v-if="isAdmin" to="projects/create">
            <b-button variant="primary">Create</b-button>
          </nuxt-link>
        </div>

        <div class="table-responsive">
          <table class="table table-hover mt-3">
            <thead>
              <tr>
                <th scope="col">Title</th>
                <th scope="col">Description</th>
                <th scope="col">Project owner</th>
                <th scope="col">Scrum master</th>
                <th scope="col">Developers</th>
                <th scope="col" v-if="isAdmin"></th>
              </tr>
            </thead>
            <tbody v-if="projects.length">
              <tr v-for="project of projects" :key="project.id">
                <td>
                  <nuxt-link :to="{ path: `projects/${project.id}` }">{{
                    project.title
                  }}</nuxt-link>
                </td>
                <td>
                  <span style="white-space: pre-line">{{
                    project.documentation
                  }}</span>
                </td>
                <td>
                  <span v-if="project.projectOwner">{{
                    project.projectOwner.username
                  }}</span>
                </td>
                <td>
                  <span v-if="project.scrumMaster">{{
                    project.scrumMaster.username
                  }}</span>
                </td>
                <td>
                  <b-button
                    variant="primary"
                    v-if="hasPermission(project)"
                    @click="showUsers(project.id)"
                    >Developers</b-button
                  >
                </td>
                <td v-if="isAdmin">
                  <b-icon
                    icon="x-lg"
                    @click="deleteProject(project)"
                    class="center-and-clickable"
                  ></b-icon>
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr>
                <td class="text-muted text-center" :colspan="isAdmin ? 6 : 5">
                  No projects yet
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </b-col>
    </b-row>

    <b-modal ref="user-modal" id="user-modal" hide-footer>
      <template #modal-title> Members</template>
      <div>
        <b-card-group 
          v-if="getProjectDevelopers(currentProjectId).length" 
          columns
        >
          <b-card
            v-for="developer of getProjectDevelopers(currentProjectId)"
            :key="developer.id"
            class="p-3"
            no-body
          >
            <div class="d-flex align-items-center">
              <b-avatar size="sm" class="mr-2"></b-avatar>
              <b-card-text>
                {{ developer.username }}
              </b-card-text>
            </div>
          </b-card>
        </b-card-group>
        <div v-else class="text-muted text-center">No members</div>
      </div>

      <b-button 
        class="mt-3" 
        block 
        @click="$bvModal.hide('user-modal')"
      >Close
      </b-button>
    </b-modal>
  </b-container>
</template>

<script>
import { BIcon } from "bootstrap-vue";
import { mapActions, mapGetters } from "vuex";

export default {
  name: "projects",
  components: {
    BIcon,
  },
  data() {
    return {
      users: [],
      projects: [],
      projectDevelopers: new Map(),
      currentProjectId: null,
    };
  },
  async created() {
    await this.getProjects();
  },
  computed: {
    ...mapGetters({
      user: "user/getUser",
      currentUser: "user/getUser",
      isAdmin: "user/isAdmin",
      isNormalUser: "user/isNormalUser",
    }),
    ...mapActions(["user/unsetUser"]),
  },
  methods: {
    hasPermission(project) {
      if (!this.currentUser) return false;
      return (
        this.currentUser.id === project.projectOwnerId ||
        this.currentUser.id === project.scrumMasterId ||
        this.isAdmin
      );
    },
    async showUsers(projectId) {
      this.currentProjectId = projectId;
      this.$refs["user-modal"].show();
    },
    async getProjects() {
      this.$axios
        .$get("/project")
        .then((res) => {
          this.projects = res;
        })
        .catch((reason) => {
          console.error(reason);
          this.$toast.error("An error has occurred, while getting projects.", {
            duration: 3000,
          });
        });
    },
    async getUsers() {
      this.$axios
        .$get("admin/users")
        .then((res) => {
          this.users = res;
        })
        .catch((reason) => {
          console.error(reason);
          this.$toast.error("An error has occurred, while getting users", {
            duration: 3000,
          });
        });
    },
    getProjectDevelopers(projectId) {
      const project = this.projects.find((project) => project.id === projectId);
      if (project) {
        return project.developers.map((d) => ({
          id: d.id,
          username: d.user.username,
        }));
      } else {
        return [];
      }
    },
    getUserById(id) {
      if (!this.users || !this.users.length) return;
      return this.users.find((user) => user.id === id);
    },
    async deleteProject(project) {
      let confirmed = false;
      try {
        confirmed = await this.$bvModal.msgBoxConfirm(
          "Are you sure you want to delete this project?",
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
        .$delete(`/project/${project.id}`)
        .then((res) => {
          this.projects = this.projects.filter((p) => p.id !== project.id);
          this.$toast.success("Project successfully removed", {
            duration: 3000,
          });
        })
        .catch((reason) => {
          console.error(reason);
          this.$toast.error("An error has occurred, while deleting project.", {
            duration: 3000,
          });
        });
    },
    async logout() {
      localStorage.removeItem("jwt");
      localStorage.removeItem("userId");
      await this.$store.dispatch("user/unsetUser");
      await this.$router.replace("/login");
    },
  },
};
</script>

<style scoped></style>
