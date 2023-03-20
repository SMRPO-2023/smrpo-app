<template>
  <b-container fluid>
    <b-row>
      <b-col offset-lg="2" lg="8" cols="12" class="my-3">
        <div class="d-flex justify-content-between align-items-center">
          <h1 class="mb-0">Projects</h1>
          <b-button
            variant="primary"
            href="projects/create"
            class="d-flex flex-column justify-content-center"
            >Create</b-button
          >
        </div>
        <table class="table table-hover mt-3 w-100">
          <thead>
            <tr>
              <th scope="col">Title</th>
              <th scope="col">Documentation</th>
              <th scope="col">Project owner</th>
              <th scope="col">Scrum master</th>
              <th scope="col">Members</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="project of projects" :key="project.id">
              <td>
                <nuxt-link :to="{ path: `projects/${project.id}` }">{{
                  project.title
                }}</nuxt-link>
              </td>
              <td>{{ project.documentation }}</td>
              <td>
                <span v-if="getUserById(project.projectOwnerId)">{{
                  getUserById(project.projectOwnerId).username
                }}</span>
              </td>
              <td>
                <span v-if="getUserById(project.scrumMasterId)">{{
                  getUserById(project.scrumMasterId).username
                }}</span>
              </td>
              <td>
                <!--
                <tr
                  v-for="projectUsers of getProjectDevelopers(project.id)"
                  :key="projectUsers.id"
                >
                  {{
                    projectUsers.username
                  }}
                </tr>-->
                <tr>
                  <b-button
                    variant="primary"
                    class="d-flex align-item-left w-20 mt-2"
                    @click="showUsers(project.id)"
                    >Members</b-button
                  >
                </tr>
              </td>
              <td>
                <b-icon
                  icon="x-lg"
                  @click="deleteProject(project)"
                  class="center-and-clickable"
                ></b-icon>
              </td>
            </tr>
          </tbody>
        </table>
      </b-col>
    </b-row>
    <b-modal ref="user-modal" id="user-modal" hide-footer>
      <template #modal-title> Members</template>
      <div class="d-block d-flex">
        <table class="table table-hover mt-3 w-100">
          <thead>
            <tr>
              <th scope="col">Username</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="projectUsers of getProjectDevelopers(currentProjectId)"
              :key="projectUsers.id"
            >
              <td>
                {{ projectUsers.username }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <b-button class="mt-3" block @click="$bvModal.hide('user-modal')"
        >Close</b-button
      >
    </b-modal>
  </b-container>
</template>

<script>
import { BIcon } from "bootstrap-vue";

export default {
  name: "projects",
  components: {
    BIcon,
  },
  data() {
    return {
      users: [],
      projects: [],
      projectDevelopers: [],
      currentProjectId: null,
    };
  },
  async created() {
    await this.getUsers();
    await this.getProjects();
  },
  methods: {
    async showUsers(projectId) {
      this.currentProjectId = projectId;
      console.log(this.currentProjectId);
      this.$refs["user-modal"].show();
    },
    async getProjects() {
      this.$axios
        .$get("/project")
        .then((res) => {
          this.projects = res;
          this.projects.forEach((project) => this.getDeveloper(project.id));
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
    getDeveloper: function (id) {
      this.$axios
        .$get(`/project-developers`, {
          params: {
            "project-id": id,
          },
        })
        .then((res) => {
          if (Object.keys(res).length !== 0) {
            //this.developers = [];
            //res.forEach((developer) => developers.push(developer.id));
            this.projectDevelopers.push(res);
          } else {
            this.projectDevelopers.push("");
          }
        })
        .catch((reason) => {
          console.error(reason);
          this.$toast.error(
            "An error has occurred, while getting developers.",
            {
              duration: 3000,
            }
          );
        });
    },
    getProjectDevelopers: function (projectId) {
      this.projectDeveloperObjects = [];
      this.projectDevelopers.forEach((project) => {
        if (project != "") {
          project.forEach((user) => {
            if (user.projectId == projectId) {
              this.projectDeveloperObjects.push(this.getUserById(user.userId));
            }
          });
        }
      });
      console.log(this.projectDeveloperObjects);
      return this.projectDeveloperObjects;
    },
    getUserById: function (id) {
      this.foundUser = null;
      this.users.forEach((user) => {
        if (user.id == id) {
          this.foundUser = user;
        }
      });

      return this.foundUser;
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

<style scoped>
</style>
