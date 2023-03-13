<template>
<div>
  <div v-if="success">
    <span class="d-block mt-3"><b>Geslo uspešno spremenjeno</b></span>
    <span class="d-block mt-3">Pojdi na <nuxt-link to="login">prijavo</nuxt-link>.</span>
  </div>
  <div v-else>
    <span class="d-block mt-3"><b>Spremeni geslo</b></span>
    <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
      <b-form class="w-100 mt-3" @submit.stop.prevent="handleSubmit(onSubmit)">
        <div :slot="'default'">

          <ValidationProvider
            v-if="type === 'int'"
            name="staro geslo"
            :rules="{ required: true }"
            v-slot="v"
          >
            <b-form-group
              id="input-group-1"
              label="Staro geslo"
              label-for="oldpass"
            >
              <b-form-input
                :type="showPassword"
                class="form-control"
                id="oldpass"
                placeholder="Vnesi staro geslo"
                v-model="form.old_pass"
                aria-describedby="input-1-live-feedback"
                :state="getValidationState(v)"
                autocomplete="current-password"
              />
              <b-form-invalid-feedback id="input-1-live-feedback">{{
                  v.errors[0]
                }}
              </b-form-invalid-feedback>
            </b-form-group>
          </ValidationProvider>

          <ValidationProvider name="novo geslo" :rules="{ required: true }" v-slot="v" vid="password">
            <b-form-group
              id="input-group-6"
              label="Geslo"
              label-for="password"
            >
              <b-form-input
                :type="showPassword"
                id="password"
                placeholder="Geslo"
                v-model="form.new_pass"
                :state="getValidationState(v)"
                aria-describedby="input-3-live-feedback"
                autocomplete="new-password"
              />
              <b-form-invalid-feedback id="input-3-live-feedback">{{
                  v.errors[0]
                }}
              </b-form-invalid-feedback>
            </b-form-group>
          </ValidationProvider>

          <ValidationProvider name="ponovitev gesla" :rules="{required: true, confirmed: 'password'}" v-slot="v">
            <b-form-group
              label="Ponovi geslo"
              label-for="pass_repeat"
            >
              <b-form-input
                :type="showPassword"
                id="pass_repeat"
                placeholder="Geslo"
                v-model="form.new_pass_rep"
                :state="getValidationState(v)"
                aria-describedby="input-4-live-feedback"
                autocomplete="new-password"
              />
              <b-form-invalid-feedback id="input-4-live-feedback">{{
                  v.errors[0]
                }}
              </b-form-invalid-feedback>
            </b-form-group>
          </ValidationProvider>

          <b-form-checkbox
            id="showpass"
            v-model="show_pass"
            name="showpasscheckbox"
            :value="true"
            :unchecked-value="false"
          >
            Pokaži gesla
          </b-form-checkbox>

          <div v-if="error" class="text-center text-danger">{{ error }}</div>
          <ul v-if="responseErrors.length > 0" class="text-danger">
            <li v-for="err of responseErrors">{{ err }}</li>
          </ul>

          <b-button type="submit" class="btn-primary mt-2">Spremeni geslo</b-button>
        </div>
      </b-form>
    </ValidationObserver>
  </div>
</div>
</template>

<script>
export default {
  name: "ChangePass",
  props: {
    type: {
      type: String,
      default: 'int'
    }
  },
  data() {
    return {
      form: {
        old_pass: null,
        new_pass: null,
        new_pass_rep: null,
      },
      show_pass: [],
      success: false,
      error: null,
      responseErrors: [],
    }
  },
  computed: {
    showPassword() {
      return this.show_pass.length > 0 ? 'text' : 'password'
    }
  },
  methods: {
    getValidationState({dirty, validated, valid = null}) {
      return dirty || validated ? valid : null;
    },
    async onSubmit() {
      if (this.type === 'int') {
        await this.$axios.$post('/users/change-password', {
          oldPassword: this.form.old_pass,
          newPassword: this.form.new_pass
        })
        .then(async res => {
          this.error = null;
          this.responseErrors = [];
          
          if (!res.success) {
          } else {
            this.$toast.success("Geslo uspešno spremenjeno", { duration: 3000 })
          }
        })
        .catch((error) => {
          const status = error?.response?.status;
          const data = error?.response?.data;
          // some instances of errors return main message along with array of detailed shorter messages
          if (status && status === 400) {
            if (data && data.message instanceof Array) {
              this.responseErrors = data.message;
              this.error = "Napaka pri posodabljanju gesla";
            } else {
              this.responseErrors = [];
              this.error = data.message;
            }
          } else {
            this.error = data.message;
            this.responseErrors = [];
          }
          this.$toast.error("Napaka pri posodabljanju gesla", { duration: 3000 });
        });
      } else {
        await this.$axios.$post('/users/ext-change-password', {
          newPassword: this.form.new_pass,
          token: this.$route.query.token,
          userId: this.$route.query.userId,
        })
        .then(async res => {
          if (res.success) {
            this.success = true
            this.$toast.success("Geslo uspešno spremenjeno", { duration: 3000 })
          }
        })
        .catch((error) => {
          const status = error?.response?.status;
          const data = error?.response?.data;
          // some instances of errors return main message along with array of detailed shorter messages
          if (status && status === 400) {
            if (data && data.message instanceof Array) {
              this.responseErrors = data.message;
              this.error = "Napaka pri posodabljanju gesla";
            } else {
              this.responseErrors = [];
              this.error = data.message;
            }
          } else {
            this.error = data.message;
            this.responseErrors = [];
          }
          this.$toast.error("Napaka pri posodabljanju gesla", { duration: 3000 });
        });
      }
    }
  }
}
</script>

<style scoped>

</style>
