<template>
  <div>
    <h1 class="d-flex align-items-center">
      <back-btn />
      <span>New sprint</span>
    </h1>

    <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
      <b-form @submit.stop.prevent="handleSubmit(onSubmit)" class="mt-4">
        <!-- Name -->
        <ValidationProvider name="name" :rules="{ required: true }" v-slot="v">
          <b-form-group label="Name" label-for="name">
            <b-form-input
              type="text"
              id="name"
              placeholder="Enter name"
              v-model="form.name"
              :state="getValidationState(v)"
              aria-describedby="name-live-feedback"
            />
            <b-form-invalid-feedback id="name-live-feedback"
              >{{ v.errors[0] }}
            </b-form-invalid-feedback>
          </b-form-group>
        </ValidationProvider>

        <b-row>
          <b-col>
            <!-- Start -->
            <ValidationProvider
              name="start"
              :rules="{ required: true, between: [minDate, maxStartDate] }"
              v-slot="v"
            >
              <b-form-group label="Start date" label-for="start">
                <b-form-datepicker
                  id="start"
                  placeholder="Choose start date"
                  v-model="form.start"
                  :state="getValidationState(v)"
                  :min="minDate"
                  :max="maxStartDate"
                  :date-disabled-fn="dateDisabled"
                  today-button
                  reset-button
                  value-as-date
                  aria-describedby="start-live-feedback"
                />
                <b-form-invalid-feedback id="start-live-feedback"
                  >{{ v.errors[0] }}
                </b-form-invalid-feedback>
              </b-form-group>
            </ValidationProvider>
          </b-col>

          <b-col>
            <!-- End -->
            <ValidationProvider
              name="end"
              :rules="{ required: true, between: [minEndDate, maxDate] }"
              v-slot="v"
            >
              <b-form-group label="End date" label-for="end">
                <b-form-datepicker
                  id="end"
                  placeholder="Choose end date"
                  v-model="form.end"
                  :state="getValidationState(v)"
                  :min="minEndDate"
                  :max="maxDate"
                  :date-disabled-fn="dateDisabled"
                  today-button
                  reset-button
                  value-as-date
                  aria-describedby="end-live-feedback"
                />
                <b-form-invalid-feedback id="end-live-feedback"
                  >{{ v.errors[0] }}
                </b-form-invalid-feedback>
              </b-form-group>
            </ValidationProvider>
          </b-col>
        </b-row>

        <!-- Velocity -->
        <ValidationProvider
          name="velocity"
          :rules="{
            required: true,
            numeric: true,
            min_value: 0,
            max_value: 100,
          }"
          v-slot="v"
        >
          <b-form-group label="Velocity" label-for="velocity">
            <b-form-input
              type="number"
              id="velocity"
              placeholder="Enter velocity"
              v-model="form.velocity"
              :state="getValidationState(v)"
              aria-describedby="velocity-live-feedback"
            />
            <b-form-invalid-feedback id="velocity-live-feedback"
              >{{ v.errors[0] }}
            </b-form-invalid-feedback>
          </b-form-group>
        </ValidationProvider>

        <!-- footer -->
        <div v-if="error" class="text-center text-danger">{{ error }}</div>
        <ul v-if="responseErrors.length > 0" class="text-danger">
          <li v-for="err of responseErrors">{{ err }}</li>
        </ul>

        <div class="text-center">
          <b-button
            :disabled="!isScrumMaster()"
            type="submit"
            variant="primary"
            class="w-50 mt-3"
          >
            Create
          </b-button>
        </div>
      </b-form>
    </ValidationObserver>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "create-sprint",
  computed: {
    ...mapGetters({
      currentUser: "user/getUser",
      projectId: "route-id/getProjectId",
    }),
    maxStartDate() {
      return this.form.end || this.maxDate;
    },
    minEndDate() {
      return this.form.start || this.minDate;
    },
  },
  data() {
    return {
      minDate: new Date(), // today
      maxDate: new Date("2300-01-01"), // max possible date to choose from
      project: null,
      error: null,
      responseErrors: [],
      form: {
        name: null,
        start: null,
        end: null,
        velocity: null,
      },
    };
  },
  created() {
    this.getProject();
    // reset date values to start of day
    this.minDate.setHours(0, 0, 0, 0);
    this.maxDate.setHours(0, 0, 0, 0);
  },
  methods: {
    dateDisabled(ymd, date) {
      const weekday = date.getDay();
      const day = date.getDate();
      return weekday === 0 || weekday === 6 || day === 13;
    },
    isScrumMaster() {
      if (!this.currentUser || !this.project) return false;
      return this.currentUser.id === this.project.scrumMasterId;
    },
    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    },
    async getProject() {
      if (!this.projectId) return;

      await this.$axios.$get(`project/${this.projectId}`).then((res) => {
        if (!res) return;
        this.project = res;
      });
    },
    async onSubmit() {
      if (!this.projectId) return;

      await this.$axios
        .$post("sprints", {
          name: this.form.name,
          start: this.form.start,
          end: this.form.end,
          velocity: +this.form.velocity,
          projectId: this.projectId,
        })
        .then(async (res) => {
          await this.$router.replace(`/projects/${this.projectId}/sprints`);
        })
        .catch((error) => {
          const status = error?.response?.status;
          const data = error?.response?.data;
          // some instances of errors return main message along with array of detailed shorter messages
          if (status && status === 400) {
            if (data && data.message instanceof Array) {
              this.responseErrors = data.message;
            }
            this.error = "Wrong input, while creating sprint";
          } else {
            this.error = data?.message;
          }
          this.$toast.error("An error has occurred, while creating sprint", {
            duration: 3000,
          });
        });
    },
  },
};
</script>

<style scoped></style>
