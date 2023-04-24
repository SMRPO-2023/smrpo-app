<template>
  <div>
    <h1>Edit project</h1>

    <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
      <b-form @submit.stop.prevent="handleSubmit(onSubmit)" class="mt-4">
        <ValidationProvider name="title" :rules="{ required: true,  min: 3 }" v-slot="v">
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

        <ValidationProvider name="description" v-slot="v">
          <b-form-group label="Description" label-for="description">
            <b-form-textarea
              type="text"
              id="description"
              placeholder="description"
              v-model="form.description"
              :state="getValidationState(v)"
              aria-describedby="input-3-live-feedback"
            />
            <b-form-invalid-feedback id="input-3-live-feedback"
              >{{ v.errors[0] }}
            </b-form-invalid-feedback>
          </b-form-group>
        </ValidationProvider>
        <ValidationProvider
          name="product owner"
          :rules="{ required: false }"
          v-slot="v"
        >
          <b-form-group label="Product owner" label-for="owner">
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

        <h5>Project developers</h5>
        <div>
          <b-card-group 
            v-if="projectDevelopers.length" 
            columns
          >
            <b-card
              v-for="developer of projectDevelopers"
              :key="developer.id"
              class="p-3"
              no-body
            >
              <div class="d-flex align-items-center">
                <b-avatar 
                  :text="getUserInitials(developer.user)" 
                  size="sm" 
                  class="mr-2"
                ></b-avatar>
                <b-card-text class="flex-grow-1 mb-0">
                  {{ developer.user.username }}
                </b-card-text>
                <b-icon
                  v-b-tooltip.hover title="Remove developer"
                  icon="x-lg"
                  @click="removeMember(developer.id)"
                  class="cursor-pointer"
                ></b-icon>
              </div>
            </b-card>
          </b-card-group>
          <div v-else class="text-muted">No members</div>
        </div>

        <br />

        <h5>Add developer</h5>
        <div class="d-flex flex-grow-1 align-items-center">
          <ValidationProvider
            name="add developer"
            :rules="{ required: false }"
            v-slot="v"
            ref="addMemberProvider"
            class="w-25"
          >
            <b-form-group class="mb-0">
              <b-form-select
                id="addMember"
                v-model="form.member"
                :options="users"
                :state="getValidationState(v)"
              ></b-form-select>
            </b-form-group>
          </ValidationProvider>
          
          <b-button
            v-b-tooltip.hover title="Add developer"
            variant="primary"
            @click="addMember"
            class="ml-3"
          >Add</b-button>
        </div>

        <br />

        <div v-if="error" class="text-center text-danger">{{ error }}</div>
        <ul v-if="responseErrors.length > 0" class="text-danger">
          <li v-for="err of responseErrors">{{ err }}</li>
        </ul>

        <div class="text-center">
          <b-button type="submit" variant="primary" class="w-50 mt-3"
            >Save</b-button
          >
        </div>
      </b-form>
    </ValidationObserver>
  </div>
</template>

<script>
import { BIcon } from "bootstrap-vue";
import { mapGetters } from "vuex";
import avatar from "@/mixins/avatar";

export default {
  name: "edit-project",
  components: {
    BIcon,
  },
  mixins: [avatar],
  data() {
    return {
      id: null,
      error: null,
      responseErrors: [],
      users: [],
      allUsers: [],
      projectDevelopers: [],
      passwordType: "password",
      form: {
        title: null,
        description: null,
        projectOwnerId: null,
        scrumMasterId: null,
        member: null,
      },
    };
  },
  computed: {
    ...mapGetters({
      currentUser: "user/getUser",
      user: "user/getUser",
      isAdmin: "user/isAdmin",
      isNormalUser: "user/isNormalUser",
    }),
  },
  async mounted() {
    this.id = this.$route.params.id;
    if (!this.id) return;
    this.getProject();

    this.getUsers();
  },
  methods: {
    async removeMember(id) {
      let confirmed = false;
      try {
        confirmed = await this.$bvModal.msgBoxConfirm(
          "Are you sure you want to remove this developer?",
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
          if (!res) throw new Error;
          this.projectDevelopers = this.projectDevelopers.filter(
            (p) => p.id !== id
          );
          this.$toast.success("Developer successfully removed", {
            duration: 3000,
          });
        })
        .catch((reason) => {
          console.error(reason);
          this.$toast.error("An error has occurred, while removing developer.", {
            duration: 3000,
          });
        });
    },
    addMember() {
      this.$axios
        .$post(`/project-developers`, {
          userId: this.form.member,
          projectId: parseInt(this.id),
        })
        .then((res) => {
          this.error = null;
          this.responseErrors = [];
          this.getProject();
          // reset form
          this.$refs.addMemberProvider.reset(); // not working
          this.form.member = null;
          console.log(this.$refs.addMemberProvider);
          this.$toast.success("New developer added", {
            duration: 3000,
          });
        })
        .catch((reason) => {
          console.error(reason);
          this.$toast.error(
            "An error has occurred, while adding new developer. Make sure developer isn't product owner, or already a developer.",
            {
              duration: 3000,
            }
          );
        });
    },
    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    },
    async getProject() {
      this.$axios
        .$get(`project/${this.id}`)
        .then((res) => {
          this.form.title = res?.title;
          this.form.description = res?.description;
          if (res?.projectOwner !== null) {
            this.form.projectOwnerId = res?.projectOwner.id;
          }
          if (res?.scrumMaster !== null) {
            this.form.scrumMasterId = res?.scrumMaster.id;
          }
          this.projectDevelopers = res?.developers;
        })
        .catch((reason) => {
          console.error(reason);
          this.$toast.error(
            "An error has occurred, while getting project information",
            {
              duration: 3000,
            }
          );
        });
    },
    async onSubmit() {
      await this.$axios
        .$put(`project/${this.id}`, {
          title: this.form.title,
          description: this.form.description,
          projectOwnerId: this.form.projectOwnerId,
          scrumMasterId: this.form.scrumMasterId,
        })
        .then((res) => {
          this.error = null;
          this.responseErrors = [];
          this.updateBreadcrumbs(this.id);
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
    updateBreadcrumbs(id) {
      this.$store.commit("route-id/setProjectId", +id)
    },
    async getUsers() {
      this.$axios
        .$get("users")
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
tbody > tr:hover > td > a {
  text-decoration: underline;
}

td > a {
  color: black;
}
</style>
