<template>
  <div>
    <h1>
      Sprint backlog<template v-if="sprint">: {{ sprint.name }}</template>
    </h1>

    <div class="d-flex justify-content-end align-items-center pb-3" v-if="sprint">
      <b-form-checkbox
        id="show-accepted-checkbox"
        v-model="showAcceptedStories"
        name="show-accepted-checkbox"
        class="mr-3"
      >
        Show accepted stories
      </b-form-checkbox>
      <b-button-group>
        <b-button 
          @click="filterBy('mine')" 
          :variant="getVariantForFilterState('mine')"
        >My tasks</b-button>
        <b-button 
          @click="filterBy('all')" 
          :variant="getVariantForFilterState('all')"
        >All</b-button>
        <b-button 
          @click="filterBy('unassigned')" 
          :variant="getVariantForFilterState('unassigned')"
        >Unassigned</b-button>
        <b-button 
          @click="filterBy('assigned')" 
          :variant="getVariantForFilterState('assigned')"
        >Assigned</b-button>
        <b-button 
          @click="filterBy('finished')" 
          :variant="getVariantForFilterState('finished')"
        >Finished</b-button>
        <b-button 
          @click="filterBy('active')" 
          :variant="getVariantForFilterState('active')"
        >Active</b-button>
      </b-button-group>
    </div>

    <div v-if="sprint">
      <b-card 
        v-if="hasStoryAnyRelevantTasks(story)"
        v-for="story of stories" 
        :key="story.id"
        class="mb-3"
      >
        <h5 class="card-title">
          <nuxt-link :to="{ path: `/projects/${story.projectId}/stories/${story.id}` }">
            #{{ story.id }} - {{ story.title }}
          </nuxt-link>
        </h5>
        <h6 class="card-subtitle mb-2 text-muted">
          <b-badge 
            :variant="getVariantForPriority(story.priority)"
          >{{ getNameForPriority(story.priority) }}</b-badge>
          &middot;
          <b-badge 
            :variant="getVariantForImplemented(story.acceptanceTest)"
          >{{ getLongNameForImplemented(story.acceptanceTest) }}</b-badge>
          &middot;
          <span class="subtitle-content">Points: {{ story.points }}</span>
          &middot;
          <span class="subtitle-content">Business value: {{ story.businessValue }}</span>
        </h6>
        <hr>
        <b-card-text class="text-muted mb-0">Description</b-card-text>
        <b-card-text>{{ story.description | limit(200) }}</b-card-text>

        <b-card-text class="text-muted mb-0">Acceptance test</b-card-text>
        <b-card-text>{{ story.acceptanceCriteria | limit(200) }}</b-card-text>

        <template v-if="story.Task.length">
          <b-card-text 
            class="text-muted mb-n2 position-relative d-flex justify-content-between" 
            style="z-index: 1"
          >
            <span>Tasks</span>
            <a class="cursor-pointer">
              <small v-if="story.numFinishedTasks" v-b-toggle="`story-tasks-collapse-${story.id}`">
                <span class="when-open">Hide</span><span class="when-closed">Show</span> finished
              </small>
            </a>
          </b-card-text>
          <task-list 
            :story="story" 
            :tasks="getStoryUnfinishedFilteredTasks(story)" 
          />
          <b-collapse :id="`story-tasks-collapse-${story.id}`">
            <small>Finished</small>
            <task-list 
              :story="story" 
              :tasks="getStoryFinishedFilteredTasks(story)" 
            />
          </b-collapse>
        </template>
      </b-card>

      <div class="w-100 text-center text-muted" v-if="!anyStoriesMatchFilter">
        <span>No stories or their tasks match this filter</span>
      </div>
    </div>

    <div class="w-100 text-center text-muted" v-if="!sprint">
      <span>There is currently no active sprint</span>
    </div>
  </div>
</template>

<script>
import { BIcon } from "bootstrap-vue";
import { mapGetters } from "vuex";
import priorities from "@/mixins/priorities";

export default {
  name: "active-sprint-backlog",
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
      tasksDisplayDict: new Map(), // dictionary of tasks, where each task has property to show or not
      anyStoriesMatchFilter: true,
      showAcceptedStories: false,
      allStories: [],
      stories: [],
      sprint: null,
    };
  },
  async mounted() {
    await this.getSprint();
    await this.getUserStories();
  },
  methods: {
    getStoryUnfinishedFilteredTasks(story) {
      if (!story?.Task?.length) return [];
      return story.Task.filter((task) => !task.done && this.taskMatchesFilter(task));
    },
    getStoryFinishedFilteredTasks(story) {
      if (!story?.Task?.length) return [];
      return story.Task.filter((task) => task.done && this.taskMatchesFilter(task));
    },
    /**
     * Tells if the story has any tasks that match the current filter
     * Used to determine if the story from the list should be displayed
     */
    hasStoryAnyRelevantTasks(story) {
      if (!story?.Task?.length) return false;
      return story.Task.some((task) => {
        return this.taskMatchesFilter(task);
      });
    },
    taskMatchesFilter(task) {
      if (!this.stories || !task) return false;
      return this.tasksDisplayDict.get(task.id);
    },
    isMyTask(task) {
      if (!this.currentUser || !task) return false;
      return task.userId === this.currentUser.id;
    },
    getVariantForFilterState(state) {
      return this.tasksFilterState === state ? "dark" : "secondary";
    },
    filterBy(state) {
      this.tasksFilterState = state;

      if (state === 'mine') this.showMyTasks();
      else if (state === 'all') this.showAllTasks();
      else if (state === 'unassigned') this.showUnassignedTasks();
      else if (state === 'assigned') this.showAssignedTasks();
      else if (state === 'finished') this.showFinishedTasks();
      else if (state === 'active') this.showActiveTasks();

      this.anyStoriesMatchFilter = this.stories.some(story => this.hasStoryAnyRelevantTasks(story));
    },
    showMyTasks() {
      this.setDisplayForTasks(task => this.isMyTask(task));
    },
    showAllTasks() {
      this.setDisplayForTasks(() => true);
    },
    showUnassignedTasks() {
      this.setDisplayForTasks(task => task.status === 'UNASSIGNED');
    },
    showAssignedTasks() {
      this.setDisplayForTasks(task => task.status === 'ASSIGNED');
    },
    showFinishedTasks() {
      this.setDisplayForTasks(task => task.status === 'FINISHED');
    },
    showActiveTasks() {
      this.setDisplayForTasks(task => task.status === 'ACTIVE');
    },
    setDisplayForTasks(check) {
      for (const story of this.stories) {
        for (const task of story.Task) {
          this.tasksDisplayDict.set(task.id, check(task));              
        }
      }
    },
    async getSprint() {
      await this.$axios
        .$get(`sprints/active-sprint`,{
          params: {
            "project-id": this.projectId,
          },
        })
        .then((res) => {
          if (!res) return;
          this.sprint = res;
        })
        .catch((error) => {
          this.handleFetchError(error, "An error has occurred, while getting sprint information");
        });
    },
    async getUserStories() {
      if (!this.projectId || !this.sprint) return;
      this.$axios
        .$get(`user-stories`, {
          params: {
            "project-id": this.projectId,
            "sprint-id": this.sprint.id,
          },
        })
        .then((res) => {
          if (!res) return;
          this.allStories = res.stories;
          this.refreshStories();
          this.showAllTasks();
        })
        .catch((error) => {
          this.handleFetchError(error, "An error has occurred, while getting user stories");
        });
    },
    refreshStories() {
      this.stories = this.allStories
      .filter((story) => this.showAcceptedStories || !story.acceptanceTest)
      .sort((a, b) => {
        if (!a.acceptanceTest && b.acceptanceTest) return -1;
        else if (a.acceptanceTest && !b.acceptanceTest) return 1;
        else if (a.acceptanceTest === b.acceptanceTest) {
          const aPriority = this.getPriorityOrdinal(a.priority);
          const bPriority = this.getPriorityOrdinal(b.priority);
          if (aPriority < bPriority) return -1;
          else if (aPriority > bPriority) return 1;
          else return 0;
        }
      });
    },
    handleFetchError(error, message) {
      console.error(error);
      this.$toast.error(message, { duration: 3000, });
    },
  },
  watch: {
    showAcceptedStories() {
      this.refreshStories();
      this.filterBy(this.tasksFilterState);
    },
  },
};
</script>

<style scoped>
.subtitle-content {
  font-size: 75%;
  font-weight: 700;
  line-height: 1;
}
.card:hover > .card-body > .card-title > a {
  text-decoration: underline;
}
a {
  color: black !important;
}
.collapsed > .when-open,
.not-collapsed > .when-closed {
  display: none;
}
</style>
