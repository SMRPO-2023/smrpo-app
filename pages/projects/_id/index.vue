<template>
  <div>
    <h1>View project</h1>
    <br />

    <p>
      <span class="title">Title : </span> <span>{{ form.title }}</span>
    </p>
    <p>
      <span class="title">Description : </span>
    </p>
    <p style="white-space: pre-line">{{ form.documentation }}</p>
    <p>
      <span class="title">Project owner : </span>
      <span
        >{{ form.projectOwnerUsername }}
        <span v-if="form.projectOwnerUsername == null"> / </span></span
      >
    </p>
    <p>
      <span class="title">Scrum master : </span>
      <span
        >{{ form.scrumMasterUsername }}
        <span v-if="form.scrumMasterUsername == null"> / </span></span
      >
    </p>
    <div v-if="isAdmin">
      <p>
        <span class="title">Members </span>
      </p>
      <table class="table table-hover mt-3 w-100">
        <thead>
          <tr>
            <th scope="col">Username</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member of projectDevelopers" :key="member.id">
            <td>
              {{ member.user.username }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { BIcon } from "bootstrap-vue";
import { mapActions, mapGetters } from "vuex";

export default {
  name: "edit-project",
  components: {
    BIcon,
  },
  data() {
    return {
      id: null,
      error: null,
      responseErrors: [],
      // user: null,
      users: [],
      allUsers: [],
      projectDevelopers: [],
      passwordType: "password",
      form: {
        title: null,
        documentation: null,
        projectOwner: null,
        projectOwnerUsername: null,
        scrumMaster: null,
        scrumMasterUsername: null,
      },
    };
  },
  computed: {
    ...mapGetters({
      user: "user/getUser",
      isAdmin: "user/isAdmin",
      isNormalUser: "user/isNormalUser",
    }),
  },
  async mounted() {
    this.id = this.$route.params.id;
    if (!this.id) return;
    this.getProject();
  },
  methods: {
    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    },
    async getProject() {
      this.$axios
        .$get(`project/${this.id}`)
        .then((res) => {
          // this.user = res;
          // if (!res) return;

          this.form.title = res?.title;
          this.form.documentation = res?.documentation;
          if (res?.projectOwner !== null) {
            this.form.projectOwner = res?.projectOwner;
            this.form.projectOwnerUsername = res?.projectOwner.username;
          }
          if (res?.scrumMaster !== null) {
            this.form.scrumMaster = res?.scrumMaster;
            this.form.scrumMasterUsername = res?.scrumMaster.username;
          }
          this.projectDevelopers = res?.developers;
        })
        .catch((reason) => {
          console.error(reason);
          this.$toast.error(
            "An error has occurred, while getting user informaiton",
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

.title {
  font-size: 1.17em;
  margin-top: 1em;
  margin-bottom: 1em;
  margin-left: 0;
  margin-right: 0;
  font-weight: bold;
}
span {
  white-space: nowrap;
}
</style>
