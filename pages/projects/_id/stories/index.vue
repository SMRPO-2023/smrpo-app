<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1 class="mb-0">Product backlog</h1>

      <nuxt-link v-if="hasPermission()" to="stories/create">
        <b-button v-b-tooltip.hover title="Create user story" variant="primary">Create</b-button>
      </nuxt-link>
    </div>
    <div class="d-flex justify-content-end align-items-center pb-3" v-if="canSee">
      <b-button-group  size="sm" class="align-items-center flex-wrap">
        <b-button 
          @click="showFutureReleases()" 
          :variant="getVariantForFilterState('future')"
        >Feature releases</b-button>
        <b-button 
          @click="showAll()" 
          :variant="getVariantForFilterState('all')"
        >All</b-button>
        <b-button 
          @click="showRealized()" 
          :variant="getVariantForFilterState('realized')"
        >Realized</b-button>
        <b-button 
          @click="showOnSprint()" 
          :variant="getVariantForFilterState('unrealizedOnSprint')"
        >Unrealized on sprint</b-button>
        <b-button 
          @click="showUnrealized()" 
          :variant="getVariantForFilterState('unrealized')"
        >Unrealized</b-button>
      </b-button-group>
    </div>

    <div class="table-responsive" v-if="canSee">
      <table class="table table-hover mt-3">
        <thead>
          <tr>
            <th scope="col">Title</th>
            <th scope="col">Description</th>
            <th scope="col">Business value</th>
            <th scope="col">Points</th>
            <th scope="col">Priority</th>
            <th scope="col">Accepted</th>
            <th scope="col" v-if="isProductOwner() || isAdmin">Accept</th>
            <th scope="col">Sprint</th>
            <th scope="col">Criteria</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="story of stories" :key="story.id">
            <td>
              <nuxt-link :to="{ path: `stories/${story.id}` }">
                #{{ story.id }} - {{ story.title }}
              </nuxt-link>
            </td>
            <td>{{ story.description | limit(100) }}</td>
            <td>{{ story.businessValue }}</td>
            <td>{{ story.points }}</td>
  
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
                :variant="getVariantForImplemented(story.acceptanceTest)"
                disabled
              >
                {{ getNameForImplemented(story.acceptanceTest) }}
              </b-button>
            </td>
            <td v-if="isProductOwner() || isAdmin">
              <b-button
                :disabled="!story.canBeAccepted"
                :variant="getVariantForImplemented(story.canBeAccepted)"
                @click="acceptStory(story.id)"
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
    </div>

    <div class="w-100 text-center text-muted" v-if="!canSee">
      <span
        >You don't have any permission or aren't a part of any user story</span
      >
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
      currentUser: "user/getUser",
      isAdmin: "user/isAdmin",
      projectId: "route-id/getProjectId",
    }),
  },
  data() {
    return {
      tasksFilterState: "all",
      project: null,
      stories: [],
      featureReleases: [],
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
    this.getFutureReleases();
  },
  methods: {
    getVariantForFilterState(state) {
      return this.tasksFilterState === state ? "dark" : "secondary";
    },
    showFutureReleases() {
      this.stories = this.featureReleases;
      this.tasksFilterState = "future";
    },
    showAll() {
      this.stories = this.allStories;
      this.tasksFilterState = "all";
    },
    showOnSprint() {
      this.stories = this.storiesUnrealizedSprint;
      this.tasksFilterState = "unrealizedOnSprint";
    },
    showUnrealized() {
      this.stories = this.storiesUnrealized;
      this.tasksFilterState = "unrealized";
    },
    showRealized() {
      this.stories = this.storiesRealized;
      this.tasksFilterState = "realized";
    },
    canChange(story) {
      return (
        this.hasPermission() && !story.acceptanceTest && story.sprintId === null
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
    isProductOwner() {
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
    async getFutureReleases() {
      if (!this.projectId) return;

      await this.$axios
        .$get(`user-stories/future-releases`, {
          params: {
            "project-id": this.projectId,
          },
        })
        .then((res) => {
          if (!res) return;
          this.featureReleases = res;
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

          this.allStories = res.stories;
          this.stories = res.stories;
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
        .$put(`user-stories/${story.id}`, {
          priority: priority.value,
          title: story.title,
          description: story.description,
          points: story.points,
          acceptanceTest: story.acceptanceTest,
          projectId: story.projectId,
          businessValue: story.businessValue,
          acceptanceCriteria: story.acceptanceCriteria
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
