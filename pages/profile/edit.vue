<template>
  <b-container fluid>
    <b-row>
      <b-col v-if="user" offset-lg="2" lg="8" cols="12" class="my-3">
        <div class="d-flex justify-content-between align-items-center">
          <h1>Edit your profile</h1>
        </div>
        <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
          <b-form @submit.stop.prevent="handleSubmit(onSubmit)" class="mt-4">
            <ValidationProvider
              name="System role"
              :rules="{ required: true }"
              v-slot="v"
              v-if="isAdmin"
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
              v-slot="v"
              :rules="{ alpha_spaces: true, required: true, min: 3 }"
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
              :rules="{ alpha_spaces: true, required: true, min: 3 }"
              v-slot="v"
            >
              <b-form-group label="Last name" label-for="lastname">
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

            <div v-if="error" class="text-center text-danger">{{ error }}</div>

            <b-button type="submit" variant="primary" class="mt-3 pr-4 pl-4"
              >Save</b-button
            >
          </b-form>
        </ValidationObserver>
        <hr />

        <change-pass type="int" class="mt-4" />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import roles from "@/mixins/roles";
import { mapActions, mapGetters } from "vuex";

export default {
  name: "profile",
  computed: {
    ...mapGetters({
      user: "user/getUser",
      isAdmin: "user/isAdmin",
    }),
  },
  data() {
    return {
      error: null,
      form: {
        role: null,
        username: null,
        firstname: null,
        lastname: null,
        email: null,
      },
    };
  },
  async created() {
    await this.fetchUser();
  },

  mixins: [roles],
  ...mapActions(["user/fetchUser"]),
  methods: {
    async fetchUser() {
      await this.$axios
        .$get(`/users/me`)
        .then((res) => {
          this.form.role = res.role;
          this.form.username = res.username;
          this.form.firstname = res.firstname;
          this.form.lastname = res.lastname;
          this.form.email = res.email;
        })
        .catch((res) => {
          this.$toast.success("Could not get user information.", {
            duration: 3000,
          });
        });
    },
    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    },
    async onSubmit() {
      await this.$axios
        .$put(`users`, {
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
          this.$store.dispatch("user/fetchUser", res?.userId);
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
