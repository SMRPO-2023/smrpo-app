<template>
  <b-container fluid>
    <b-row>
      <b-col offset-lg="2" lg="8" cols="12" class="my-3">
        <h1>New project</h1>

        <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
          <b-form @submit.stop.prevent="handleSubmit(onSubmit)" class="mt-4">
            <ValidationProvider
              name="title"
              :rules="{ required: true }"
              v-slot="v"
            >
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

            <ValidationProvider
              name="documentation"
              v-slot="v"
            >
              <b-form-group label="Documentation" label-for="documentation">
                <b-form-input
                  type="text"
                  id="documentation"
                  placeholder="Enter documentation"
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
              :rules="{ required: true }"
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
              :rules="{ required: true }"
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

            <div class="text-center">
              <b-button type="submit" variant="primary" class="w-50 mt-3"
                >Submit</b-button
              >
            </div>
          </b-form>
        </ValidationObserver>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
export default {
  name: "create-project",
  data() {
    return {
      error: null,
      users: [],
      usersId: [],
      responseErrors: [],
      passwordType: "password",
      form: {
        title: null,
        documentation: null,
        projectOwnerId: null,
        scrumMasterId: null,
      },
    };
  },
  async created() {
    await this.getUsers();
  },
  methods: {
    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    },
    async getUsers() {
      this.$axios
        .$get("admin/users")
        .then((res) => {
          this.users.push({ value: null, text: "Choose user" }),
            res.forEach((user) => {
              this.users.push({ value: user.id, text: user.username });
            });
        })
        .catch((reason) => {
          console.error(reason);
          this.$toast.error("An error has occurred, while getting users.", {
            duration: 3000,
          });
        });
    },
    async onSubmit() {
      await this.$axios
        .$post("/project", {
          title: this.form.title,
          documentation: this.form.documentation,
          projectOwnerId: this.form.projectOwnerId,
          scrumMasterId: this.form.scrumMasterId,
        })
        .then(async (res) => {
          await this.$router.replace("/projects");
        })
        .catch((error) => {
          const status = error?.response?.status;
          const data = error?.response?.data;
          // some instances of errors return main message along with array of detailed shorter messages
          if (status && status === 400) {
            if (data && data.message instanceof Array) {
              this.responseErrors = data.message;
            }
            this.error = "Wrong input, while creating project.";
          } else {
            this.error = data?.message;
          }
          this.$toast.error("An error has occurred, while creating project.", {
            duration: 3000,
          });
        });
    },
  },
};
</script>

<style scoped></style>
