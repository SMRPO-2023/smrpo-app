<template>
  <div>
    <h1 class="d-flex align-items-center">
      <back-btn />
      <span>Edit user story</span>
    </h1>

    <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
      <b-form @submit.stop.prevent="handleSubmit(onSubmit)" class="mt-4">
        <!-- Title -->
        <ValidationProvider name="title" :rules="{ required: true }" v-slot="v">
          <b-form-group label="Title" label-for="title">
            <b-form-input
              type="text"
              id="title"
              placeholder="Enter title"
              v-model="form.title"
              :state="getValidationState(v)"
              aria-describedby="title-live-feedback"
            />
            <b-form-invalid-feedback id="title-live-feedback"
              >{{ v.errors[0] }}
            </b-form-invalid-feedback>
          </b-form-group>
        </ValidationProvider>

        <!-- Description -->
        <ValidationProvider
          name="description"
          :rules="{ required: true }"
          v-slot="v"
        >
          <b-form-group label="Description" label-for="description">
            <b-form-textarea
              id="description"
              placeholder="Enter description"
              v-model="form.description"
              :state="getValidationState(v)"
              aria-describedby="description-live-feedback"
            />
            <b-form-invalid-feedback id="description-live-feedback"
              >{{ v.errors[0] }}
            </b-form-invalid-feedback>
          </b-form-group>
        </ValidationProvider>

        <!-- Acceptance criteria -->
        <ValidationProvider
          name="acceptanceCriteria"
          :rules="{ required: true }"
          v-slot="v"
        >
          <b-form-group
            label="Acceptance Criteria"
            label-for="acceptanceCriteria"
          >
            <b-form-textarea
              id="acceptanceCriteria"
              placeholder="Enter Criteria"
              v-model="form.acceptanceCriteria"
              :state="getValidationState(v)"
              aria-describedby="acceptanceCriteria-live-feedback"
            />
            <b-form-invalid-feedback id="acceptanceCriteria-live-feedback"
              >{{ v.errors[0] }}
            </b-form-invalid-feedback>
          </b-form-group>
        </ValidationProvider>
        <!-- Priority -->
        <ValidationProvider
          name="priority"
          :rules="{ required: true }"
          v-slot="v"
        >
          <b-form-group label="Priority" label-for="priority">
            <b-form-select
              id="priority"
              v-model="form.priority"
              :options="prioritiesOptions"
              :state="getValidationState(v)"
              aria-describedby="priority-live-feedback"
            ></b-form-select>
            <b-form-invalid-feedback id="priority-live-feedback"
              >{{ v.errors[0] }}
            </b-form-invalid-feedback>
          </b-form-group>
        </ValidationProvider>

        <!-- Points -->
        <ValidationProvider
          name="points"
          :rules="{
            required: true,
            numeric: true,
            min_value: 0.1,
            max_value: 20,
          }"
          v-slot="v"
        >
          <b-form-group label="Points" label-for="points">
            <b-form-input
              type="number"
              id="points"
              placeholder="Enter points"
              v-model="form.points"
              :state="getValidationState(v)"
              aria-describedby="points-live-feedback"
            />
            <b-form-invalid-feedback id="points-live-feedback"
              >{{ v.errors[0] }}
            </b-form-invalid-feedback>
          </b-form-group>
        </ValidationProvider>

        <!-- Business value -->
        <ValidationProvider
          name="businessValue"
          :rules="{ numeric: true, min_value: 1, max_value: 10 }"
          v-slot="v"
        >
          <b-form-group label="Business value" label-for="businessValue">
            <b-form-input
              type="number"
              id="businessValue"
              placeholder="Enter business value"
              v-model="form.businessValue"
              :state="getValidationState(v)"
              aria-describedby="businessValue-live-feedback"
            />
            <b-form-invalid-feedback id="businessValue-live-feedback"
              >{{ v.errors[0] }}
            </b-form-invalid-feedback>
          </b-form-group>
        </ValidationProvider>

        <!-- Sprint -->
        <ValidationProvider name="sprint" v-slot="v">
          <b-form-group label="Sprint" label-for="sprint">
            <b-form-select
              id="sprint"
              v-model="form.sprintId"
              :options="sprintsOptions"
              :state="getValidationState(v)"
              :disabled="sprintsOptions.length <= 1"
              aria-describedby="sprint-live-feedback"
            ></b-form-select>
            <b-form-invalid-feedback id="sprint-live-feedback"
              >{{ v.errors[0] }}
            </b-form-invalid-feedback>
          </b-form-group>
        </ValidationProvider>

        <!-- Implemented -->
        <b-form-group label="" label-for="implemented">
          <b-form-checkbox
            id="implemented"
            name="implemented"
            v-model="form.implemented"
          >
            Has been accepted?
          </b-form-checkbox>
        </b-form-group>

        <!-- footer -->
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
import priorities from "@/mixins/priorities";

export default {
  name: "edit-user-story",
  components: {
    BIcon,
  },
  mixins: [priorities],
  computed: {
    ...mapGetters({
      projectId: "route-id/getProjectId",
    }),
  },
  data() {
    return {
      id: null,
      error: null,
      responseErrors: [],
      sprintsOptions: [{ value: null, text: "Choose sprint" }],
      prioritiesOptions: [{ value: null, text: "Choose priority" }],
      form: {
        title: null,
        description: null,
        acceptanceCriteria: null,
        priority: null,
        points: null,
        implemented: false,
        businessValue: null,
        sprintId: null,
      },
    };
  },
  created() {
    this.getSprints();
  },
  mounted() {
    this.id = +this.$route.params.id;
    this.prioritiesOptions = this.prioritiesOptions.concat(this.priorities);
    this.getUserStory();
  },
  methods: {
    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    },
    async onSubmit() {
      let confirmed = false;
      try {
        confirmed = await this.$bvModal.msgBoxConfirm(
          "Are you sure you want to update this user story?",
          {
            title: "Update",
            cancelTitle: "Cancel",
            okTitle: "Confirm",
          }
        );
      } catch (error) {
        console.error(error);
      }

      if (!confirmed || !this.projectId || !this.id) return;

      await this.$axios
        .$put(`user-stories/${this.id}`, {
          title: this.form.title,
          description: this.form.description,
          acceptanceCriteria: this.form.acceptanceCriteria,
          priority: this.form.priority,
          points: parseInt(this.form.points),
          implemented: this.form.implemented,
          businessValue: this.form.businessValue,
          sprintId: this.form.sprintId,
          projectId: this.projectId,
        })
        .then(async (res) => {
          this.error = null;
          this.responseErrors = [];
          this.$toast.success("User story successfully updated", {
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
              this.error =
                "An error has occurred, while updating the user story";
            } else {
              this.responseErrors = [];
              this.error = data.message;
            }
          } else {
            this.responseErrors = [];
            this.error = data?.message;
          }
          this.$toast.error(
            "An error has occurred, while updating the user story",
            {
              duration: 3000,
            }
          );
        });
    },
    async getSprints() {
      if (!this.projectId) return;

      await this.$axios.$get(`project/${this.projectId}`).then((res) => {
        if (!res) return;
        const sprints = res.sprints.map((s) => ({ value: s.id, text: s.name }));
        this.sprintsOptions = this.sprintsOptions.concat(sprints);
      });
    },
    async getUserStory() {
      if (!this.projectId || !this.id) return;

      await this.$axios
        .$get(`user-stories/${this.id}`)
        .then((res) => {
          if (!res) return Promise.reject("No data");

          this.form.title = res.title;
          this.form.description = res.description;
          this.form.priority = res.priority;
          this.form.points = res.points;
          this.form.implemented = res.implemented;
          this.form.businessValue = res.businessValue;
          this.form.sprintId = res.sprintId;
          this.form.projectId = res.projectId;
        })
        .catch((reason) => {
          console.error(reason);
          this.$toast.error(
            "An error has occurred, while getting user story information",
            {
              duration: 3000,
            }
          );
        });
    },
  },
};
</script>

<style scoped></style>
