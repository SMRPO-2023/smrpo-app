<template>
  <b-container style="height: 66vh">
    <b-row class="h-100 justify-content-center">
      <b-col sm="12" md="8" lg="6" xl="6">
        <div
          class="d-flex flex-column flex-nowrap justify-content-center align-content-center h-100 loginContainer"
        >
          <div class="text-center p-4">
            <h1>Login</h1>
          </div>
          <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
            <b-form @submit.stop.prevent="handleSubmit(onSubmit)">
              <ValidationProvider
                name="email address"
                :rules="{ required: true }"
                v-slot="v"
              >
                <b-input
                  type="text"
                  id="email"
                  placeholder="Email address"
                  v-model="form.email"
                  :state="getValidationState(v)"
                  aria-describedby="input-3-live-feedback"
                />
                <b-form-invalid-feedback id="input-3-live-feedback"
                  >{{ v.errors[0] }}
                </b-form-invalid-feedback>
              </ValidationProvider>
              <br />
              <ValidationProvider
                name="password"
                :rules="{ required: true }"
                v-slot="v"
                vid="password"
              >
                <b-input
                  :type="passwordType"
                  id="password"
                  placeholder="Password"
                  v-model="form.password"
                  :state="getValidationState(v)"
                  aria-describedby="input-4-live-feedback"
                />
                <b-form-invalid-feedback id="input-4-live-feedback"
                  >{{ v.errors[0] }}
                </b-form-invalid-feedback>
              </ValidationProvider>

              <br />

              <b-form-checkbox
                id="checkbox-1"
                name="checkbox-1"
                v-model="passwordType"
                value="text"
                unchecked-value="password"
              >
                Show password
              </b-form-checkbox>

              <div class="text-center mt-4">
                <b-button type="submit" variant="success" class="w-50">
                  <b-spinner v-if="loading" small></b-spinner>
                  Submit
                </b-button>
              </div>
            </b-form>
          </ValidationObserver>
        </div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { mapMutations, mapActions } from "vuex";

export default {
  name: "login",
  data() {
    return {
      errorField: { email: false, password: false },
      form: {
        email: null,
        password: null,
      },
      loading: false,
      passwordType: "password",
    };
  },
  methods: {
    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    },

    ...mapMutations(["user/setUser", "user/setToken"]),
    ...mapActions(["user/fetchUser", "user/unsetUser"]),
    async onSubmit() {
      this.loading = true;

      await this.$axios
        .$post("/auth/login", this.form)
        .then(async (res) => {
          localStorage.setItem("jwt", res?.accessToken);
          localStorage.setItem("userId", res?.userId);
          await this.$store.commit("user/setToken", res?.accessToken);
          await this.$store.dispatch("user/fetchUser", res?.userId);
          await this.$router.push("/");
        })
        .catch((reason) => {
          console.error(reason);
          this.error = "Wrong login information";
          this.$toast.error("Wrong login information", { duration: 3000 });
        });

      this.loading = false;
    },
  },
};
</script>

<style scoped>
.loginContainer {
  margin-top: 2rem;
  padding: 3rem;
}

.checkmark {
  font: inherit;
  color: currentColor;
  width: 1.15em;
  height: 1.15em;
  border: 0.15em solid currentColor;
  border-radius: 0.15em;
  transform: translateY(-0.075em);
}
</style>
