<template>
  <b-container>
    <b-row>
      <b-col offset-md="3" md="6" cols="12" class="my-3">
        <div class="text-center">
          <h1>Registracija</h1>
        </div>
        <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
          <b-form @submit.stop.prevent="handleSubmit(onSubmit)" class="mt-4">
            <ValidationProvider
              name="ime"
              :rules="{ required: true, min: 1 }"
              v-slot="v"
            >
              <b-form-group
                id="input-group-1"
                label="Ime"
                label-for="firstname"
              >
                <b-form-input
                  type="text"
                  id="firstname"
                  placeholder="Vnesi ime"
                  v-model="form.firstname"
                  :state="getValidationState(v)"
                  aria-describedby="input-1-live-feedback"
                />
                <b-form-invalid-feedback id="input-1-live-feedback">{{
                    v.errors[0]
                  }}
                </b-form-invalid-feedback>
              </b-form-group>
            </ValidationProvider>

            <ValidationProvider
              name="priimek"
              :rules="{ required: true, min: 1 }"
              v-slot="v"
            >
              <b-form-group
                id="input-group-1"
                label="Priimek"
                label-for="lastname"
              >
                <b-form-input
                  type="text"
                  id="lastname"
                  placeholder="Vnesi priimek"
                  v-model="form.lastname"
                  :state="getValidationState(v)"
                  aria-describedby="input-1-live-feedback"
                />
                <b-form-invalid-feedback id="input-1-live-feedback">{{
                    v.errors[0]
                  }}
                </b-form-invalid-feedback>
              </b-form-group>
            </ValidationProvider>

            <ValidationProvider name="elektronski naslov" :rules="{ required: true, email: true }" v-slot="v">
              <b-form-group
                id="input-group-5"
                label="Elektronski naslov"
                label-for="email"
              >
                <b-form-input
                  type="text"
                  id="email"
                  placeholder="Elektronski naslov"
                  v-model="form.email"
                  :state="getValidationState(v)"
                  aria-describedby="input-2-live-feedback"
                />
                <b-form-invalid-feedback id="input-2-live-feedback">{{
                    v.errors[0]
                  }}
                </b-form-invalid-feedback>
              </b-form-group>
            </ValidationProvider>

            <ValidationProvider name="geslo" :rules="{ required: true }" v-slot="v" vid="password">
              <b-form-group
                id="input-group-6"
                label="Geslo"
                label-for="password"
              >
                <b-form-input
                  type="password"
                  id="password"
                  placeholder="Geslo"
                  v-model="form.password"
                  :state="getValidationState(v)"
                  aria-describedby="input-3-live-feedback"
                />
                <b-form-invalid-feedback id="input-3-live-feedback">{{
                    v.errors[0]
                  }}
                </b-form-invalid-feedback>
              </b-form-group>
            </ValidationProvider>

            <ValidationProvider name="potrditev gesla" :rules="{required: true, confirmed: 'password'}" v-slot="v">
              <b-form-group
                label="Ponovi geslo"
                label-for="pass_repeat"
              >
                <b-form-input
                  type="password"
                  id="pass_repeat"
                  placeholder="Geslo"
                  v-model="form.passwordRepeat"
                  :state="getValidationState(v)"
                  aria-describedby="input-4-live-feedback"
                />
                <b-form-invalid-feedback id="input-4-live-feedback">{{
                    v.errors[0]
                  }}
                </b-form-invalid-feedback>
              </b-form-group>
            </ValidationProvider>

            <div v-if="error" class="text-center text-danger">{{ error }}</div>
            <ul v-if="responseErrors.length > 0" class="text-danger">
              <li v-for="err of responseErrors">{{ err }}</li>
            </ul>

            <div class="text-center">
              <b-button type="submit" variant="primary" class="w-50 mt-3">Vpiši se</b-button>
            </div>
          </b-form>
        </ValidationObserver>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { mapMutations, mapActions } from "vuex";

export default {
  name: "registration",
  data() {
    return {
      error: null,
      responseErrors: [],
      form: {
        firstname: null,
        lastname: null,
        email: null,
        password: null,
        passwordRepeat: null,
      },
    }
  },
  methods: {
    ...mapMutations(["user/setUser", "user/setToken"]),
    ...mapActions(["user/fetchUser", "user/unsetUser"]),

    getValidationState({dirty, validated, valid = null}) {
      return dirty || validated ? valid : null;
    },
    async onSubmit() {
      await this.$axios.$post('/auth/signup', {
        firstname: this.form.firstname,
        lastname: this.form.lastname,
        email: this.form.email,
        password: this.form.password
      })
      .then(async res => {
        localStorage.setItem('jwt', res?.accessToken)
        localStorage.setItem('userId', res?.userId)
        await this.$store.commit('user/setToken', res?.accessToken)
        await this.$store.dispatch('user/fetchUser', res?.userId)
        await this.$router.replace({ path: '/registration/success'})
      })
      .catch(error => {
        const status = error?.response?.status;
        const data = error?.response?.data;
        if (status && status === 400) {
          if (data && data.message instanceof Array) {
            this.responseErrors = data.message;
          }
          this.error = "Napačni podatki za registracijo"
        }
        this.error = data?.message;
        this.$toast.error("Napaka pri registraciji", { duration: 3000 })
      })
    },
    async onReset() {
      this.form = {
        firstname: null,
        lastname: null,
        email: null,
        password: null,
        passwordRepeat: null,
      };
    },
  }
}
</script>

<style scoped>

</style>
