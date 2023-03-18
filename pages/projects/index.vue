<template>
  <b-container fluid>
    <b-row>
      <b-col offset-lg="2" lg="8" cols="12" class="my-3">
        <div class="d-flex justify-content-between align-items-center">
          <h1>Projects</h1>
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
                <!--<tr v-for="developer of developers" :key="developer.id">
                  <td v-if="developer">{{ developer }}</td>
                </tr>-->
              </td>
              <td></td>
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
      projects: [],
      developers: [],
    };
  },
  async created() {
    await this.getProjects();
  },
  methods: {
    async getProjects() {
      this.$axios
        .$get("/project")
        .then((res) => {
          this.projects = res;
          //this.projects.forEach((project) => this.getDevelopers(project.id));
        })
        .catch((reason) => {
          console.error(reason);
          this.$toast.error("An error has occurred, while getting users.", {
            duration: 3000,
          });
        });
    },
    getDevelopers: function (id) {
      this.$axios
        .$get(`/project-developers`, {
          params: {
            "project-id": id,
          },
        })
        .then((res) => {
          if (Object.keys(res).length !== 0) {
            developers = [];
            res.forEach((developer) => developers.push(developer.id));
            this.developers.push(this.developers);
          } else {
            this.developers.push("");
          }
        })
        .catch((reason) => {
          console.error(reason);
          this.$toast.error("An error has occurred, while getting projects.", {
            duration: 3000,
          });
        });
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
.center-and-clickable {
  vertical-align: middle;
  text-align: center;
  cursor: pointer;
}

tbody > tr:hover > td > a {
  text-decoration: underline;
}

td > a {
  color: black;
}
</style>
