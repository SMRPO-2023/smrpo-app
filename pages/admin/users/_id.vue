<template>
  <b-container fluid>
    <b-row>
      <b-col offset-lg="2" lg="8" cols="12" class="my-3">
        <h1>Edit user</h1>

        <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
          <b-form @submit.stop.prevent="handleSubmit(onSubmit)" class="mt-4">
            <ValidationProvider
              name="System role"
              :rules="{ required: true }"
              v-slot="v"
            >
              <b-form-group label="System role" label-for="role">
                <b-form-select
                  id="role"
                  v-model="form.role"
                  :options="roles"
                  :state="getValidationState(v)"
                  aria-describedby="input-1-live-feedback"
                ></b-form-select>
                <b-form-invalid-feedback id="input-1-live-feedback"
                  >{{ v.errors[0] }}
                </b-form-invalid-feedback>
              </b-form-group>
            </ValidationProvider>

            <ValidationProvider
              name="username"
              :rules="{ required: true, min: 3 }"
              v-slot="v"
            >
              <b-form-group label="Username" label-for="username">
                <b-form-input
                  type="text"
                  id="username"
                  placeholder="Enter username"
                  v-model="form.username"
                  :state="getValidationState(v)"
                  aria-describedby="input-1_1-live-feedback"
                />
                <b-form-invalid-feedback id="input-1_1-live-feedback"
                  >{{ v.errors[0] }}
                </b-form-invalid-feedback>
              </b-form-group>
            </ValidationProvider>

            <ValidationProvider
              name="firstname"
              :rules="{ alpha_spaces: true }"
              v-slot="v"
            >
              <b-form-group label="First name" label-for="firstname">
                <b-form-input
                  type="text"
                  id="firstname"
                  placeholder="Enter firstname"
                  v-model="form.firstname"
                  :state="getValidationState(v)"
                  aria-describedby="input-2-live-feedback"
                />
                <b-form-invalid-feedback id="input-2-live-feedback"
                  >{{ v.errors[0] }}
                </b-form-invalid-feedback>
              </b-form-group>
            </ValidationProvider>

            <ValidationProvider
              name="lastname"
              :rules="{ alpha_spaces: true }"
              v-slot="v"
            >
              <b-form-group label="Lastname" label-for="lastname">
                <b-form-input
                  type="text"
                  id="lastname"
                  placeholder="Enter lastname"
                  v-model="form.lastname"
                  :state="getValidationState(v)"
                  aria-describedby="input-3-live-feedback"
                />
                <b-form-invalid-feedback id="input-3-live-feedback"
                  >{{ v.errors[0] }}
                </b-form-invalid-feedback>
              </b-form-group>
            </ValidationProvider>

            <ValidationProvider
              name="Email address"
              :rules="{ required: true, email: true }"
              v-slot="v"
            >
              <b-form-group label="Email address" label-for="email">
                <b-form-input
                  type="text"
                  id="email"
                  placeholder="Email address"
                  v-model="form.email"
                  :state="getValidationState(v)"
                  aria-describedby="input-4-live-feedback"
                />
                <b-form-invalid-feedback id="input-4-live-feedback"
                  >{{ v.errors[0] }}
                </b-form-invalid-feedback>
              </b-form-group>
            </ValidationProvider>
            
            <div
              class="mt-4 d-flex align-items-baseline"
              :class="editPassword ? null : 'collapsed'"
              :aria-expanded="editPassword ? 'true' : 'false'"
              aria-controls="collapse-password"
              style="cursor: pointer;"
              @click="editPassword = !editPassword"
            >
              <h4>Change password</h4>
              <b-icon v-if="!editPassword" icon="caret-down-fill" class="ml-2"></b-icon>
              <b-icon v-if="editPassword" icon="caret-up-fill" class="ml-2"></b-icon>
            </div>

            <b-collapse id="collapse-password" v-model="editPassword">
              <ValidationProvider 
                name="password" 
                :rules="{ required: editPassword, min: 12, max: 128 }" 
                v-slot="v" 
                vid="password"
              >
                <b-form-group label="Password" label-for="password">
                  <b-form-input
                    :type="passwordType"
                    id="password"
                    placeholder="Password"
                    v-model="form.password"
                    :state="getValidationState(v)"
                    aria-describedby="input-5-live-feedback"
                  />
                  <b-form-invalid-feedback id="input-5-live-feedback"
                    >{{ v.errors[0] }}
                  </b-form-invalid-feedback>
                </b-form-group>
              </ValidationProvider>

              <ValidationProvider
                name="repeat password"
                :rules="{ required: editPassword, confirmed: 'password' }"
                v-slot="v"
              >
                <b-form-group label="Repeat password" label-for="pass_repeat">
                  <b-form-input
                    :type="passwordType"
                    id="pass_repeat"
                    placeholder="Repeat password"
                    v-model="form.passwordRepeat"
                    :state="getValidationState(v)"
                    aria-describedby="input-6-live-feedback"
                  />
                  <b-form-invalid-feedback id="input-6-live-feedback"
                    >{{ v.errors[0] }}
                  </b-form-invalid-feedback>
                </b-form-group>
              </ValidationProvider>

              <b-form-checkbox
                id="checkbox-1"
                name="checkbox-1"
                v-model="passwordType"
                value="text"
                unchecked-value="password"
              >
                Show password
              </b-form-checkbox>
            </b-collapse>

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
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { BIcon } from "bootstrap-vue";

export default {
  name: "edit-user",
  components: {
    BIcon,
  },
  data() {
    return {
      id: null,
      error: null,
      responseErrors: [],
      user: null,
      passwordType: "password",
      editPassword: false,
      form: {
        role: null,
        username: null,
        firstname: null,
        lastname: null,
        email: null,
        password: null,
        passwordRepeat: null,
      },
      roles: [
        { value: null, text: "Choose system role" },
        { value: "USER", text: "User" },
        { value: "ADMIN", text: "Administrator" },
      ],
    };
  },
  async mounted() {
    this.id = this.$route.params.id;
    if (!this.id) return;

    this.$axios
      .$get(`admin/users/${this.id}`)
      .then((res) => {
        this.user = res;
        if (!res) return;

        this.form.role = res.role;
        this.form.email = res.email;
        this.form.username = res.username;
        this.form.firstname = res.firstname;
        this.form.lastname = res.lastname;
      })
      .catch((reason) => {
        console.error(reason);
        this.$toast.error(
          "An error has occurred, while getting user information",
          {
            duration: 3000,
          }
        );
      });
  },
  methods: {
    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    },
    async onSubmit() {
      let confirmed = false;
      try {
        confirmed = await this.$bvModal.msgBoxConfirm(
          "Are you sure you want to update this user's information?",
          {
            title: "Update",
            cancelTitle: "Cancel",
            okTitle: "Confirm",
          }
        );
      } catch (error) {
        console.error(error);
      }

      if (!confirmed) return;

      await this.$axios
        .$put(`admin/users/${this.user.id}`, {
          username: this.form.username,
          firstname: this.form.firstname,
          lastname: this.form.lastname,
          email: this.form.email,
          password: this.form.password,
          role: this.form.role,
        })
        .then((res) => {
          this.error = null;
          this.responseErrors = [];
          this.$toast.success("User information successfully updated", {
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
              this.error = "An error has occurred, while updating user";
            } else {
              this.responseErrors = [];
              this.error = data.message;
            }
          } else {
            this.responseErrors = [];
            this.error = data?.message;
          }
          this.$toast.error("An error has occurred, while updating user", {
            duration: 3000,
          });
        });
    },
  },
};
</script>

<style scoped></style>
