<template>
  <div>
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
            min_value: 0.1,
            max_value: 50,
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
              :step="0.0001"
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

        <!-- footer -->
        <div v-if="error" class="text-center text-danger">{{ error }}</div>
        <ul v-if="responseErrors.length > 0" class="text-danger">
          <li v-for="err of responseErrors">{{ err }}</li>
        </ul>

        <div class="text-center">
          <b-button
            :disabled="!hasPermission"
            type="submit"
            variant="primary"
            class="w-50 mt-3"
          >
            <template v-if="story">
              Save
            </template>
            <template v-else>
              Create
            </template>
          </b-button>
        </div>
      </b-form>
    </ValidationObserver>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import priorities from "@/mixins/priorities";

export default {
  name: "create-edit-user-story",
  props: {
    story: {
      type: Object,
      default: null,
    },
  },
  mixins: [priorities],
  computed: {
    ...mapGetters({
      isAdmin: "user/isAdmin",
      currentUser: "user/getUser",
      projectId: "route-id/getProjectId",
      storyId: "route-id/getStoryId",
    }),
    isProjectOwner() {
      if (!this.currentUser || !this.project) return false;
      return this.currentUser.id === this.project.projectOwnerId;
    },
    isScrumMaster() {
      if (!this.currentUser || !this.project) return false;
      return this.currentUser.id === this.project.scrumMasterId;
    },
    hasPermission() {
      return this.isAdmin || this.isProjectOwner || this.isScrumMaster;
    },
  },
  data() {
    return {
      project: null,
      error: null,
      responseErrors: [],
      prioritiesOptions: [{ value: null, text: "Choose priority" }],
      form: {
        title: null,
        description: null,
        priority: null,
        points: null,
        businessValue: null,
        acceptanceCriteria: null,
      },
    };
  },
  created() {
    this.getProjectWithData();
  },
  mounted() {
    this.prioritiesOptions = this.prioritiesOptions.concat(this.priorities);
  },
  methods: {
    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    },
    async onSubmit() {
      if (!this.projectId) return;

      if (this.storyId && this.story) {
        await this.updateStory();
      } else {
        await this.createStory();
      }
    },
    async getProjectWithData() {
      if (!this.projectId) return;

      await this.$axios.$get(`project/${this.projectId}`).then((res) => {
        if (!res) return;
        this.project = res;
      });
    },
    async updateStory() {
      if (!this.storyId) return;

      await this.$axios
        .$put(`user-stories/${this.storyId}`, {
          title: this.form.title,
          description: this.form.description,
          priority: this.form.priority,
          points: parseFloat(this.form.points),
          projectId: this.projectId,
          businessValue: parseInt(this.form.value),
          acceptanceCriteria: this.form.acceptanceCriteria,
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
    async createStory() {
      if (!this.projectId) return;

      await this.$axios
        .$post("user-stories", {
          title: this.form.title,
          description: this.form.description,
          priority: this.form.priority,
          points: parseFloat(this.form.points),
          projectId: this.projectId,
          businessValue: parseInt(this.form.value),
          acceptanceCriteria: this.form.acceptanceCriteria,
        })
        .then(async (res) => {
          await this.$router.replace(`/projects/${this.projectId}/stories`);
        })
        .catch((error) => {
          const status = error?.response?.status;
          const data = error?.response?.data;
          // some instances of errors return main message along with array of detailed shorter messages
          if (status && status === 400) {
            if (data && data.message instanceof Array) {
              this.responseErrors = data.message;
            }
            this.error = "Wrong input, while creating the user story";
          } else {
            this.error = data?.message;
          }
          this.$toast.error(
            "An error has occurred, while creating the user story",
            {
              duration: 3000,
            }
          );
        });
    },
  },
  watch: { 
    story: function(value) {
      // fill form data
      if (value) {
        this.form = {
          title: value.title,
          description: value.description,
          acceptanceCriteria: value.acceptanceCriteria,
          priority: value.priority,
          points: value.points,
          businessValue: value.businessValue,
        };
      }
    }
  }
}
</script>

<style scoped>
</style>