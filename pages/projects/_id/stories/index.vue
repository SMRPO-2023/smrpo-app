<template>
  <div>
    <div class="d-flex justify-content-between align-items-center">
      <h1 class="mb-0">Stories</h1>

      <b-button
        v-if="hasPermission()"
        variant="primary"
        href="stories/create"
        class="d-flex flex-column justify-content-center"
        >Create</b-button
      >
    </div>
    <div class="d-flex justify-content-end pb-3 pt-3" v-if="canSee">
      <b-button-group>
        <b-button variant="info" @click="showAll()">All</b-button>
        <b-button variant="success" @click="showRealized()">Realized</b-button>

        <b-button variant="warning" @click="showOnSprint()"
          >Unrealized on sprint</b-button
        >
        <b-button variant="danger" @click="showUnrealized()"
          >Unrealized</b-button
        >
      </b-button-group>
    </div>
    <table class="table table-hover mt-3 w-100" v-if="canSee">
      <thead>
        <tr>
          <th scope="col">Title</th>
          <th scope="col">Description</th>
          <th scope="col">Business value</th>
          <th scope="col">Priority</th>
          <th scope="col">Accepted</th>
          <th scope="col">Accept</th>
          <th scope="col">Sprint</th>
          <th scope="col">Criteria</th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="story of stories" :key="story.id">
          <td>
            <!--
            <nuxt-link
              v-if="canChange(story)"
              :to="{ path: `stories/${story.id}`}"
            >
            #{{ story.id }} - {{ story.title }}
           </nuxt-link>
            <span>#{{ story.id }} - {{ story.title }}</span>-->
            <span>#{{ story.id }} - {{ story.title }}</span>
          </td>
          <td>{{ story.description | limit(100) }}</td>
          <td>{{ story.businessValue }}</td>

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
              :variant="getVariantForImplemented(!story.acceptanceTest)"
              disabled
            >
              {{ getNameForImplemented(story.acceptanceTest) }}
            </b-button>
          </td>
          <td>
            <b-button
              :disabled="!story.canBeAccepted"
              :variant="getVariantForImplemented(!story.canBeAccepted)"
              @click="acceptStory(story.id)"
              v-if="isProjectOwner() || isAdmin"
            >
              Accept
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
          <td>{{ story.acceptanceCriteria | limit(100) }}</td>

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
   
    <div class="w-100 text-center text-muted" v-if="!canSee">
      <span>You don't have any permission or aren't a part of any user story</span>
    </div>
  </div>
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
      isAdmin: "user/isAdmin",
      currentUser: "user/getUser",
      isAdmin: "user/isAdmin",
      projectId: "route-id/getProjectId",
    }),
  },
  data() {
    return {
      project: null,
      stories: [],
      allStories: [],
      storiesRealized: [],
      storiesUnrealizedSprint: [],
      storiesUnrealized: [],
      sprints: [],
      developers: [],
      canSee: false,
    };
  },
  created() {
    this.getProjectWithData();
    this.getProjectStories();
    this.getRealizedStories();
    this.getUnrealizedSprint();
    this.getUnrealized();
  },
  methods: {
    showAll() {
      this.stories = this.allStories;
    },
    showOnSprint() {
      this.stories = this.storiesUnrealizedSprint;
    },
    showUnrealized() {
      this.stories = this.storiesUnrealized;
    },
    showRealized() {
      this.stories = this.storiesRealized;
    },
    canChange(story) {
      return (
        this.hasPermission() && !story.implemented && story.sprintId === null
      );
    },
    hasPermission() {
      if (!this.currentUser || !this.project) return false;
      return (
        this.currentUser.id === this.project.projectOwnerId ||
        this.currentUser.id === this.project.scrumMasterId ||
        this.isAdmin
      );
    },
    isProjectOwner() {
      return this.currentUser.id === this.project.projectOwnerId;
    },
    findSprintName(sprintId) {
      if (!sprintId || !this.sprints || !this.sprints.length) return null;
      return this.sprints.find((s) => s.id === sprintId)?.name;
    },
    async acceptStory(storyId) {
      if (!storyId) return;

      await this.$axios
        .$post(`/user-stories/accept/${storyId}`, {
          acceptanceTest: true,
        })
        .then((res) => {
          if (!res) return;
          this.$router.go(0);
        });
    },
    async getUnrealizedSprint() {
      if (!this.projectId) return;

      await this.$axios
        .$get(`user-stories/unrealized-with-sprint`, {
          params: {
            "project-id": this.projectId,
          },
        })
        .then((res) => {
          if (!res) return;
          this.storiesUnrealizedSprint = res;
        });
    },
    async getUnrealized() {
      if (!this.projectId) return;

      await this.$axios
        .$get(`user-stories/unrealized-without-sprint`, {
          params: {
            "project-id": this.projectId,
          },
        })
        .then((res) => {
          if (!res) return;
          this.storiesUnrealized = res;
        });
    },
    async getRealizedStories() {
      if (!this.projectId) return;

      await this.$axios
        .$get(`user-stories/realized`, {
          params: {
            "project-id": this.projectId,
          },
        })
        .then((res) => {
          if (!res) return;
          this.storiesRealized = res;
        });
    },
    async getProjectStories() {
      if (!this.projectId) return;

      await this.$axios
        .$get(`user-stories`, {
          params: {
            "project-id": this.projectId,
          },
        })
        .then((res) => {
          if (!res) return;

          this.allStories = res;
          this.stories = res;
        });
    },
    async getProjectWithData() {
      if (!this.projectId) return;

      await this.$axios.$get(`project/${this.projectId}`).then((res) => {
        if (!res) return;
        this.project = res;
        this.developers = res.developers;

        let found = false;

        for (const key in this.developers) {
          const developer = this.developers[key];

          if (this.currentUser.id === developer.user.id) {
            this.found = true;
          }
        }

        if (
          this.currentUser.id === this.project.projectOwnerId ||
          this.currentUser.id === this.project.scrumMasterId
        ) {
          found = true;
        }

        this.canSee = this.isAdmin || found;

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
        .$patch(`user-stories/${story.id}`, {
          ...story,
          priority: priority.value,
        })
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
          this.$toast.error(
            "An error has occurred, while updating the story's priority",
            {
              duration: 3000,
            }
          );
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
          this.stories = this.stories.filter((s) => s.id !== story.id);
          this.$toast.success("Story successfully removed", {
            duration: 3000,
          });
        })
        .catch((reason) => {
          console.error(reason);
          this.$toast.error(
            "An error has occurred, while deleting the user story",
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
