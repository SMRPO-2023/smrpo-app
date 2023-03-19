<template>
  <b-container fluid>
    <b-row>
      <b-col offset-lg="2" lg="8" cols="12" class="my-3">
        <div class="d-flex justify-content-between align-items-center">
          <h1 class="mb-0">Stories</h1>
          <b-button
            variant="primary"
            href="stories/create"
            class="d-flex flex-column justify-content-center"
            >Create</b-button
          >
        </div>
        <table class="table table-hover mt-3 w-100">
          <thead>
            <tr>
              <th scope="col">Title</th>
              <th scope="col">Description</th>
              <th scope="col">Priority</th>
              <th scope="col">Implemented</th>
              <th scope="col">Sprint</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="story of stories" :key="story.id">
              <td>
                <nuxt-link 
                  v-if="canChange(story)" 
                  :to="{ path: `stories/${story.id}` }"
                >
                  #{{ story.id }} - {{ story.title }}
                </nuxt-link>
                <span v-else>#{{ story.id }} - {{ story.title }}</span>
              </td>
              <td>{{ story.description | limit(100) }}</td>
              <td>
                <b-dropdown
                  id="dropdown-right"
                  size="sm"
                  right
                  :text="getNameForPriority(story.priority)"
                  :variant="getVariantForPriority(story.priority)"
                  :disabled="!canChange(story)"
                >
                  <b-dropdown-item
                    v-for="priority of priorities"
                    :value="priority.value"
                    :key="priority.value"
                    @click="updatePriority(story, priority)"
                  >
                    {{ priority.text }}
                  </b-dropdown-item>
                </b-dropdown>
              </td>
              <td>
                <b-button 
                  size="sm" 
                  :variant="getVariantForImplemented(story.implemented)" 
                  disabled
                >
                  {{ getNameForImplemented(story.implemented) }}
                </b-button>
              </td>
              <td>
                <nuxt-link 
                  v-if="story.sprintId" 
                  :to="{ path: `/projects/${projectId}/sprints/${story.sprintId}` }"
                >
                  {{ findSprintName(story.sprintId) }}
                </nuxt-link>
              </td>
              <td>
                <b-icon
                  v-if="canChange(story)"
                  icon="x-lg"
                  @click="deleteStory(story)"
                  class="center-and-clickable"
                ></b-icon>
              </td>
            </tr>
          </tbody>
        </table>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { BIcon } from "bootstrap-vue";
import { mapGetters } from "vuex";
import priorities from "@/mixins/priorities";

export default {
  name: "stories",
  components: {
    BIcon,
  },
  mixins: [priorities],
  computed: {
    ...mapGetters({
      currentUser: "user/getUser",
      projectId: "route-id/getProjectId"
    }),
  },
  data() {
    return {
      project: null,
      stories: [],
      sprints: [],
    };
  },
  created() {
    this.getProjectWithData();
  },
  methods: {
    canChange(story) {
      if (!this.currentUser || !this.project) return false;
      const permissions = this.currentUser.id === this.project.projectOwnerId ||
        this.currentUser.id === this.project.scrumMasterId;
      return permissions && !story.implemented && story.sprintId === null;
    },
    findSprintName(sprintId) {
      if (!sprintId || !this.sprints || !this.sprints.length) return null;
      return this.sprints.find(s => s.id === sprintId)?.name;
    },
    async getProjectWithData() {
      if (!this.projectId) return;

      await this.$axios
      .$get(`project/${this.projectId}`)
      .then((res) => {
        if (!res) return;
        this.project = res;
        this.stories = this.project.UserStory.sort((a,b) => this.canChange(b) - this.canChange(a));
        this.sprints = this.project.sprints;
      });
    },
    async updatePriority(story, priority) {
      let confirmed = false;
      try {
        confirmed = await this.$bvModal.msgBoxConfirm(
          "Are you sure you want to change this user story's priority?",
          {
            title: "Change priority",
            cancelTitle: "Cancel",
            okTitle: "Confirm",
          }
        );
      } catch (error) {
        console.error(error);
      }

      if (!confirmed) return;

      this.$axios
        .$patch(`user-stories/${story.id}`, { ...story, priority: priority.value })
        .then((res) => {
          for (const story of this.stories) {
            if (story.id === res.id) {
              story.priority = res.priority;
              return;
            }
          }
          this.$toast.success("Story priority successfully updated", {
            duration: 3000,
          });
        })
        .catch((reason) => {
          console.error(reason);
          this.$toast.error("An error has occurred, while updating the story's priority", {
            duration: 3000,
          });
        });
    },
    async deleteStory(story) {
      let confirmed = false;
      try {
        confirmed = await this.$bvModal.msgBoxConfirm(
          "Are you sure you want to delete this user story?",
          {
            title: "Delete",
            cancelTitle: "Cancel",
            okTitle: "Confirm",
          }
        );
      } catch (error) {
        console.error(error);
      }

      if (!confirmed) return;

      this.$axios
        .$delete(`user-stories/${story.id}`)
        .then((res) => {
          this.stories = this.stories.filter(s => s.id !== story.id);
          this.$toast.success("Story successfully removed", {
            duration: 3000,
          });
        })
        .catch((reason) => {
          console.error(reason);
          this.$toast.error("An error has occurred, while deleting the user story", {
            duration: 3000,
          });
        });
    },
  }
}
</script>

<style scoped>
.center-and-clickable {
  vertical-align: middle;
  text-align: center;
  cursor: pointer;
}

tbody > tr:hover > td > a {
  text-decoration: underline;
}

td > a {
  color: black;
}
</style>