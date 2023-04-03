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

        <!-- Hours -->
        <ValidationProvider
          name="hours"
          :rules="{
            required: true,
            min_value: 0.1,
          }"
          v-slot="v"
        >
          <b-form-group label="Hours" label-for="hours">
            <b-form-input
              type="number"
              id="hours"
              placeholder="Enter hours"
              v-model="form.hours"
              :state="getValidationState(v)"
              aria-describedby="hours-live-feedback"
            />
            <b-form-invalid-feedback id="hours-live-feedback"
              >{{ v.errors[0] }}
            </b-form-invalid-feedback>
          </b-form-group>
        </ValidationProvider>

        <!-- User -->
        <ValidationProvider
          name="userId"
          v-slot="v"
        >
          <b-form-group label="Assignee" label-for="assignee">
            <b-form-select
              id="assignee"
              v-model="form.userId"
              :options="userOptions"
              :state="getValidationState(v)"
              aria-describedby="assignee-live-feedback"
            ></b-form-select>
            <b-form-invalid-feedback id="assignee-live-feedback"
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
            :disabled="!canCreate"
            type="submit"
            variant="primary"
            class="w-50 mt-3"
          >
            <template v-if="task">
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

export default {
  name: "create-edit-task",
  props: {
    task: {
      type: Object,
      default: null,
    },
  },
  computed: {
    ...mapGetters({
      isAdmin: "user/isAdmin",
      currentUser: "user/getUser",
      projectId: "route-id/getProjectId",
      storyId: "route-id/getStoryId",
      taskId: "route-id/getTaskId",
    }),
    isScrumMaster() {
      if (!this.currentUser || !this.project) return false;
      return this.currentUser.id === this.project.scrumMasterId;
    },
    isDeveloper() {
      if (!this.currentUser || !this.project) return false;
      return this.project.developers.find((u) => u.user.id === this.currentUser.id);
    },
    hasPermission() {
      return this.isAdmin || this.isScrumMaster || this.isDeveloper
    },
    canCreate() {
      if (!this.project || !this.story || !this.sprint) return false;
      return this.hasPermission && !this.story.acceptanceTest && this.story.sprintId && this.isSprintActive;
    },
    isSprintActive() {
      if (!this.sprint) return false;
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return new Date(this.sprint.start) <= now && new Date(this.sprint.end) >= now;
    },
  },
  data() {
    return {
      project: null,
      story: null,
      sprint: null,
      error: null,
      responseErrors: [],
      userOptions: [{ value: null, text: "Choose user" }],
      form: {
        title: null,
        description: null,
        hours: null,
        userId: null,
      },
    };
  },
  created() {
    this.getProjectWithData();
  },
  methods: {
    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    },
    async onSubmit() {
      if (!this.projectId) return;

      if (this.taskId && this.task) {
        await this.updateTask();
      } else {
        await this.createTask();
      }
    },
    async getProjectWithData() {
      if (!this.projectId) return;

      await this.$axios.$get(`project/${this.projectId}`).then((res) => {
        if (!res) return;
        // project
        this.project = res;
        // story
        this.story = res.UserStory.find((s) => s.id === this.storyId);
        // sprint
        this.sprint = res.sprints.find((s) => s.id === this.story.sprintId);
        // developers
        const developers = res.developers.map(u => ({ value: u.user.id, text: u.user.username }));
        const scrumMasterIsDeveloper = developers.find(u => u.value === res.scrumMasterId);
        if (!scrumMasterIsDeveloper) {
          developers.push({ value: res.scrumMasterId, text: res.scrumMaster.username });
        }
        developers.sort((a, b) => a.text.localeCompare(b.text))
        this.userOptions = this.userOptions.concat(developers);
      });
    },
    async createTask() {
      if (!this.projectId || !this.storyId) return;

      await this.$axios
        .$post("tasks", {
          title: this.form.title,
          description: this.form.description,
          hours: parseInt(this.form.hours),
          userId: this.form.userId,
          userStoryId: this.storyId,
        })
        .then(async (res) => {
          await this.$router.replace(`/projects/${this.projectId}/stories/${this.storyId}/tasks`);
        })
        .catch((error) => {
          const status = error?.response?.status;
          const data = error?.response?.data;
          // some instances of errors return main message along with array of detailed shorter messages
          if (status && status === 400) {
            if (data && data.message instanceof Array) {
              this.responseErrors = data.message;
            }
            this.error = "Wrong input, while creating the task";
          } else {
            this.error = data?.message;
          }
          this.$toast.error(
            "An error has occurred, while creating the task",
            {
              duration: 3000,
            }
          );
        });
    },
  }
  // TODO: watch for task changes
}
</script>

<style scoped>  
</style>