<template>
  <b-container fluid>
    <b-row>
      <b-col class="my-3" cols="12" offset-lg="1" lg="10" offset-xl="2" xl="8">
        <h1 class="d-flex align-items-center">
          <back-btn />
          <span>New project</span>
        </h1>

        <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
          <b-form @submit.stop.prevent="handleSubmit(onSubmit)" class="mt-4">
            <ValidationProvider
              name="title"
              :rules="{ required: true,  min: 3}"
              v-slot="v"
            >
              <b-form-group label="Title" label-for="title">
                <b-form-input
                  type="text"
                  id="title"
                  placeholder="Enter title"
                  v-model="form.title"
                  :state="getValidationState(v)"
                  aria-describedby="input-1-live-feedback"
                />
                <b-form-invalid-feedback id="input-1-live-feedback"
                  >{{ v.errors[0] }}
                </b-form-invalid-feedback>
              </b-form-group>
            </ValidationProvider>

            <ValidationProvider
              name="description"
              v-slot="v"
              :rules="{ required: true }"
            >
              <b-form-group label="Description" label-for="description">
                <b-form-textarea
                  type="text"
                  id="description"
                  placeholder="Enter description"
                  v-model="form.description"
                  :state="getValidationState(v)"
                  aria-describedby="input-1-live-feedback"
                />
                <b-form-invalid-feedback id="input-1-live-feedback"
                  >{{ v.errors[0] }}
                </b-form-invalid-feedback>
              </b-form-group>
            </ValidationProvider>
            <ValidationProvider
              name="project owner"
              :rules="{ required: true }"
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
                      :text="getUserInitials(getUserById(developer))" 
                      size="sm" 
                      class="mr-2"
                    ></b-avatar>
                    <b-card-text class="flex-grow-1 mb-0">
                      {{ getUserById(developer).username }}
                    </b-card-text>
                    <b-icon
                      v-b-tooltip.hover title="Remove developer"
                      icon="x-lg"
                      @click="removeMember(developer)"
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
              <b-form-group class="mb-0 w-25">
                <b-form-select
                  id="addMember"
                  v-model="form.member"
                  :options="users"
                ></b-form-select>
              </b-form-group>
              <b-button
                v-b-tooltip.hover title="Add developer"
                variant="primary"
                @click="addMember"
                class="ml-3"
              >Add</b-button>
            </div>

            <br />

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
import avatar from "@/mixins/avatar";

export default {
  name: "create-project",
  mixins: [avatar],
  data() {
    return {
      error: null,
      responseErrors: [],
      id: null,
      users: [],
      allUsers: [],
      usersId: [],
      responseErrors: [],
      passwordType: "password",
      projectDevelopers: [],
      form: {
        title: null,
        description: null,
        projectOwnerId: null,
        scrumMasterId: null,
        member: 0,
      },
    };
  },
  async created() {
    await this.getUsers();
  },
  methods: {
    getUserById(id) {
      this.foundUser = null;
      this.allUsers.forEach((user) => {
        if (user.id == id) {
          this.foundUser = user;
        }
      });

      return this.foundUser;
    },
    addMemberRequest(userId) {
      this.$axios
        .$post(`/project-developers`, {
          userId: userId,
          projectId: parseInt(this.id),
        })
        .then((res) => {
          this.error = null;
          this.responseErrors = [];
        })
        .catch((reason) => {
          console.error(reason);

          this.$toast.error("An error has occurred, while adding new member.", {
            duration: 3000,
          });
        });
    },
    removeMember(id) {
      const temp = [];
      for (let i = 0; i < this.projectDevelopers.length; i++) {
        if (this.projectDevelopers[i] !== id) {
          temp.push(this.projectDevelopers[i]);
        }
      }

      this.projectDevelopers = temp;
    },
    addMember() {
      if (this.form.member == 0) {
        this.$toast.error("Please choose a developer.", {
          duration: 3000,
        });
      } else if (!this.projectDevelopers.includes(this.form.member)) {
        this.projectDevelopers.push(this.form.member);
        // reset form
        this.form.member = 0;
      } else {
        this.$toast.error("This user is already a developer", {
          duration: 3000,
        });
      }
    },
    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    },
    async getUsers() {
      this.$axios
        .$get("admin/users")
        .then((res) => {
          this.allUsers = res;
          this.users.push({ value: 0, text: "Choose user" }),
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
    validateFields() {
      var valid = true;
      if (this.form.projectOwnerId == this.form.scrumMasterId) {
        this.$toast.error(
          "Product owner and scrum master can not be the same person.",
          {
            duration: 3000,
          }
        );
        valid = false;
        return false;
      }
      if (this.form.projectOwnerId == this.form.scrumMasterId) {
        this.$toast.error("Product owner can not be a member.", {
          duration: 3000,
        });
        valid = false;
        return false;
      }
      for (var key in this.projectDevelopers) {
        var id = this.projectDevelopers[key];
        if (this.form.projectOwnerId == id) {
          this.$toast.error("Project owner can not be a member.", {
            duration: 3000,
          });
          valid = false;
          return false;
        }
      }

      return valid;
    },
    async onSubmit() {
      if (this.validateFields()) {
        await this.$axios
          .$post("/project", {
            title: this.form.title,
            description: this.form.description,
            projectOwnerId: this.form.projectOwnerId,
            scrumMasterId: this.form.scrumMasterId,
          })
          .then(async (res) => {
            this.id = res.id;

            this.projectDevelopers.forEach((developerId) =>
              this.addMemberRequest(developerId)
            );
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
              this.error = data.message;
              this.responseErrors = data.message;
            } else if (status && status === 409) {
              this.$toast.error("Project with the same title already exists.", {
                duration: 3000,
              });
            } else {
              this.$toast.error(
                "An error has occurred, while creating projectttt.",
                {
                  duration: 3000,
                }
              );
            }
          });
      }
    },
  },
};
</script>

<style scoped></style>
