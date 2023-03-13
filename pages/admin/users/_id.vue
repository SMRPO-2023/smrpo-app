<template>
  <b-container fluid>
    <b-breadcrumb :items="items"></b-breadcrumb>

    <b-row>
      <b-col offset-lg="2" lg="8" cols="12">
        <h1>Uredi uporabnika</h1>

        <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
          <b-form @submit.stop.prevent="handleSubmit(onSubmit)" class="mt-4">

            <ValidationProvider name="role" :rules="{ required: true }" v-slot="v">
              <b-form-group label="Sistemske pravice" label-for="role">
                <b-form-select id="role" v-model="form.role" :options="roles"
                  :state="getValidationState(v)" aria-describedby="input-1-live-feedback"></b-form-select>
                <b-form-invalid-feedback id="input-1-live-feedback">{{
                  v.errors[0]
                }}
                </b-form-invalid-feedback>
              </b-form-group>
            </ValidationProvider>

            <ValidationProvider name="username" :rules="{ required: true, min: 3 }" v-slot="v">
              <b-form-group label="Uporabniško ime" label-for="username">
                <b-form-input type="text" id="username" placeholder="Vnesi uporabniško ime" v-model="form.username"
                  :state="getValidationState(v)" aria-describedby="input-1_1-live-feedback" />
                <b-form-invalid-feedback id="input-1_1-live-feedback">{{
                  v.errors[0]
                }}
                </b-form-invalid-feedback>
              </b-form-group>
            </ValidationProvider>

            <ValidationProvider name="ime" v-slot="v">
              <b-form-group label="Ime" label-for="firstname">
                <b-form-input type="text" id="firstname" placeholder="Vnesi ime" v-model="form.firstname"
                  :state="getValidationState(v)" aria-describedby="input-2-live-feedback" />
                <b-form-invalid-feedback id="input-2-live-feedback">{{
                  v.errors[0]
                }}
                </b-form-invalid-feedback>
              </b-form-group>
            </ValidationProvider>

            <ValidationProvider name="priimek" v-slot="v">
              <b-form-group label="Priimek" label-for="lastname">
                <b-form-input type="text" id="lastname" placeholder="Vnesi priimek" v-model="form.lastname"
                  :state="getValidationState(v)" aria-describedby="input-3-live-feedback" />
                <b-form-invalid-feedback id="input-3-live-feedback">{{
                  v.errors[0]
                }}
                </b-form-invalid-feedback>
              </b-form-group>
            </ValidationProvider>

            <ValidationProvider name="elektronski naslov" :rules="{ required: true, email: true }" v-slot="v">
              <b-form-group label="Elektronski naslov" label-for="email">
                <b-form-input type="text" id="email" placeholder="Elektronski naslov" v-model="form.email"
                  :state="getValidationState(v)" aria-describedby="input-4-live-feedback" />
                <b-form-invalid-feedback id="input-4-live-feedback">{{
                  v.errors[0]
                }}
                </b-form-invalid-feedback>
              </b-form-group>
            </ValidationProvider>

            <div v-b-toggle.collapse-password class="mt-4 d-flex align-items-baseline">
              <h4>Posodobi geslo</h4>
              <b-icon icon="caret-down-fill" class="ml-2"></b-icon>
            </div>

            <b-collapse id="collapse-password">
              <ValidationProvider name="geslo" v-slot="v" vid="password">
                <b-form-group label="Geslo" label-for="password">
                  <b-form-input type="password" id="password" placeholder="Geslo" v-model="form.password"
                    :state="getValidationState(v)" aria-describedby="input-5-live-feedback" />
                  <b-form-invalid-feedback id="input-5-live-feedback">{{
                    v.errors[0]
                  }}
                  </b-form-invalid-feedback>
                </b-form-group>
              </ValidationProvider>

              <ValidationProvider name="potrditev gesla" :rules="{ confirmed: 'password' }" v-slot="v">
                <b-form-group label="Ponovi geslo" label-for="pass_repeat">
                  <b-form-input type="password" id="pass_repeat" placeholder="Geslo" v-model="form.passwordRepeat"
                    :state="getValidationState(v)" aria-describedby="input-6-live-feedback" />
                  <b-form-invalid-feedback id="input-6-live-feedback">{{
                    v.errors[0]
                  }}
                  </b-form-invalid-feedback>
                </b-form-group>
              </ValidationProvider>
            </b-collapse>

            <div v-if="error" class="text-center text-danger">{{ error }}</div>
            <ul v-if="responseErrors.length > 0" class="text-danger">
              <li v-for="err of responseErrors">{{ err }}</li>
            </ul>

            <div class="text-center">
              <b-button type="submit" variant="primary" class="w-50 mt-3">Shrani</b-button>
            </div>

          </b-form>
        </ValidationObserver>
      </b-col>
    </b-row>
  </b-container>
</template>
  
<script>
import { BIcon } from 'bootstrap-vue'

export default {
  name: 'edit-user',
  components: {
    BIcon,
  },
  data() {
    return {
      id: null,
      error: null,
      responseErrors: [],
      user: null,
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
        { value: null, text: 'Izberite sistemske pravice' },
        { value: 'USER', text: 'Navadni uporabnik' },
        { value: 'ADMIN', text: 'Administrator' },
      ],
      items: [
          {
            text: 'Admin',
            href: '/'
          },
          {
            text: 'Uporabniki',
            href: '/admin/users'
          },
          {
            text: 'Uredi',
            active: true
          }
        ]
    }
  },
  async mounted() {
    this.id = this.$route.params.id;
    if (!this.id) return;

    this.$axios.$get(`admin/users/${this.id}`)
      .then(res => {
        this.user = res;
        if (!res) return;

        this.form.role = res.role;
        this.form.email = res.email;
        this.form.username = res.username;
        this.form.firstname = res.firstname;
        this.form.lastname = res.lastname;
      })
      .catch(reason => {
        console.error(reason)
        this.$toast.error('Napaka pri pridobivanju uporabnika', { duration: 3000 });
      })
  },
  methods: {
    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    },
    async onSubmit() {
      await this.$axios.$put(`admin/users/${this.user.id}`, {
        username: this.form.username,
        firstname: this.form.firstname,
        lastname: this.form.lastname,
        email: this.form.email,
        password: this.form.password,
        role: this.form.role
      })
      .then(res => {
        this.error = null;
        this.responseErrors = [];
      })
      .catch(error => {
        const status = error?.response?.status;
        const data = error?.response?.data;
        // some instances of errors return main message along with array of detailed shorter messages
        if (status && status === 400) {
          if (data && data.message instanceof Array) {
            this.responseErrors = data.message;
          }
          this.error = "Napačni podatki za uporabnika"
        } else {
          this.error = data?.message;
        }
        this.$toast.error("Napaka pri posodabljanju uporabnika", { duration: 3000 })
      })
    }
  },
}
</script>

<style scoped></style>