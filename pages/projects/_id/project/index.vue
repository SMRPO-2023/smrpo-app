<template>
  <div>
    <h1>Edit project</h1>

    <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
      <b-form @submit.stop.prevent="handleSubmit(onSubmit)" class="mt-4">
        <ValidationProvider name="title" :rules="{ required: true }" v-slot="v">
          <b-form-group label="Title" label-for="title">
            <b-form-input
              type="text"
              id="title"
              placeholder="Enter title"
              v-model="form.title"
              :state="getValidationState(v)"
              aria-describedby="input-2-live-feedback"
            />
            <b-form-invalid-feedback id="input-2-live-feedback"
              >{{ v.errors[0] }}
            </b-form-invalid-feedback>
          </b-form-group>
        </ValidationProvider>

        <ValidationProvider name="documentation" v-slot="v">
          <b-form-group label="Documentation" label-for="documentation">
            <b-form-input
              type="text"
              id="documentation"
              placeholder="documentation"
              v-model="form.documentation"
              :state="getValidationState(v)"
              aria-describedby="input-3-live-feedback"
            />
            <b-form-invalid-feedback id="input-3-live-feedback"
              >{{ v.errors[0] }}
            </b-form-invalid-feedback>
          </b-form-group>
        </ValidationProvider>
        <ValidationProvider
          name="project owner"
          :rules="{ required: false }"
          v-slot="v"
        >
          <b-form-group label="Project owner" label-for="owner">
            <b-form-select
              id="projectOwner"
              v-model="form.projectOwnerId"
              :options="users"
              :state="getValidationState(v)"
              aria-describedby="input-1-live-feedback"
            ></b-form-select>
            <b-form-invalid-feedback id="input-1-live-feedback"
              >{{ v.errors[0] }}
            </b-form-invalid-feedback>
          </b-form-group>
        </ValidationProvider>
        <ValidationProvider
          name="scrum master"
          :rules="{ required: false }"
          v-slot="v"
        >
          <b-form-group label="Scrum master" label-for="owner">
            <b-form-select
              id="scrumOwner"
              v-model="form.scrumMasterId"
              :options="users"
              :state="getValidationState(v)"
              aria-describedby="input-1-live-feedback"
            ></b-form-select>
            <b-form-invalid-feedback id="input-1-live-feedback"
              >{{ v.errors[0] }}
            </b-form-invalid-feedback>
          </b-form-group>
        </ValidationProvider>

        <br />
        <h5>Project members</h5>
        <table class="table table-hover mt-3 w-25" v-if="isAdmin">
          <thead>
            <td>
              <tr>
                Username
              </tr>
            </td>
          </thead>
          <tbody>
            <tr v-for="developer of projectDevelopers" :key="developer.id">
              <td>
                {{ developer.user.username }}
              </td>

              <td>
                <b-icon
                  icon="x-lg"
                  @click="removeMember(developer.id)"
                  class="center-and-clickable"
                ></b-icon>
              </td>
            </tr>
          </tbody>
        </table>

        <br />
        <h5>Add member</h5>
        <ValidationProvider
          name="scrum master"
          :rules="{ required: false }"
          v-slot="v"
        >
          <b-form-group label-for="owner">
            <b-form-select
              id="addMember"
              v-model="form.member"
              :options="users"
              :state="getValidationState(v)"
              aria-describedby="input-1-live-feedback"
              class="w-25"
              v-if="isAdmin"
            ></b-form-select>
            <b-form-invalid-feedback id="input-1-live-feedback"
              >{{ v.errors[0] }}
            </b-form-invalid-feedback>
          </b-form-group>
        </ValidationProvider>
        <div class="text-center">
          <b-button
            variant="primary"
            class="d-flex align-item-left w-20 mt-3"
            @click="addMember"
            :disabled="!isAdmin"
            >Add</b-button
          >
        </div>
        <br />
        <div v-if="error" class="text-center text-danger">{{ error }}</div>
        <ul v-if="responseErrors.length > 0" class="text-danger">
          <li v-for="err of responseErrors">{{ err }}</li>
        </ul>

        <div class="text-center">
          <b-button
            :disabled="!isAdmin"
            type="submit"
            variant="primary"
            class="w-50 mt-3"
            >Save</b-button
          >
        </div>
      </b-form>
    </ValidationObserver>
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
      user: null,
      users: [],
      allUsers: [],
      projectDevelopers: [],
      passwordType: "password",
      form: {
        title: null,
        documentation: null,
        projectOwnerId: null,
        scrumMasterId: null,
        member: null,
      },
    };
  },
  computed: {
    ...mapGetters({
      user: "user/getUser",
      isAdmin: "user/isAdmin",
      isNormalUser: "user/isNormalUser",
    }),
    ...mapActions(["user/unsetUser", "user/fetchUser"]),
  },
  async mounted() {
    this.id = this.$route.params.id;
    if (!this.id) return;
    this.getProject();
    if (this.isAdmin) {
      this.getUsers();
    }
  },
  methods: {
    async removeMember(id) {
      let confirmed = false;
      try {
        confirmed = await this.$bvModal.msgBoxConfirm(
          "Are you sure you want to remove this member?",
          {
            title: "Remove",
            cancelTitle: "Cancel",
            okTitle: "Confirm",
          }
        );
      } catch (error) {
        console.error(error);
      }

      if (!confirmed) return;

      this.$axios
        .$delete(`/project-developers/${id}`)
        .then((res) => {
          this.projectDevelopers = this.projectDevelopers.filter(
            (p) => p.id !== id
          );
          this.$toast.success("Member secuessfully removed", {
            duration: 3000,
          });
        })
        .catch((reason) => {
          console.error(reason);
          this.$toast.error("An error has occurred, while removing member.", {
            duration: 3000,
          });
        });
    },
    addMember: function () {
      this.$axios
        .$post(`/project-developers`, {
          userId: this.form.member,
          projectId: parseInt(this.id),
        })
        .then((res) => {
          this.error = null;
          this.responseErrors = [];
          this.getProject();
          this.$toast.success("New member added", {
            duration: 3000,
          });
        })
        .catch((reason) => {
          console.error(reason);
          this.$toast.error("An error has occurred, while adding new member.", {
            duration: 3000,
          });
        });
    },
    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    },
    async getProject() {
      this.$axios
        .$get(`project/${this.id}`)
        .then((res) => {
          this.user = res;
          if (!res) return;

          this.form.title = res.title;
          this.form.documentation = res.documentation;
          if (res.projectOwner !== null) {
            this.form.projectOwnerId = res.projectOwner.id;
          }
          if (res.scrumMaster !== null) {
            this.form.scrumMasterId = res.scrumMaster.id;
          }
          this.projectDevelopers = res.developers;
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
    async onSubmit() {
      await this.$axios
        .$put(`project/${this.user.id}`, {
          title: this.form.title,
          documentation: this.form.documentation,
          projectOwnerId: this.form.projectOwnerId,
          scrumMasterId: this.form.scrumMasterId,
        })
        .then((res) => {
          this.error = null;
          this.responseErrors = [];
          this.$toast.success("Project information successfully updated", {
            duration: 3000,
          });
        })
        .catch((error) => {
          const status = error?.response?.status;
          const data = error?.response?.data;
          // some instances of errors return main message along with array of detailed shorter messages
          if (status && status === 400) {
            if (data && data.message instanceof Array) {
              this.responseErrors = data.message;
              this.error = "An error has occurred, while updating project";
            } else {
              this.responseErrors = [];
              this.error = data.message;
            }
          } else {
            this.responseErrors = [];
            this.error = data?.message;
          }
          this.$toast.error("An error has occurred, while updating project", {
            duration: 3000,
          });
        });
    },
    async getUsers() {
      this.$axios
        .$get("admin/users")
        .then((res) => {
          this.users.push({ value: null, text: "Choose user" }),
            res.forEach((user) => {
              this.users.push({ value: user.id, text: user.username });
            });
          this.allUsers = res;
        })
        .catch((reason) => {
          console.error(reason);
          this.$toast.error("An error has occurred, while getting users.", {
            duration: 3000,
          });
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
</style>
