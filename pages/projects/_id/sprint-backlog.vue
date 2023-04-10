<template>
  <div>
    <h1>
      Sprint backlog<template v-if="sprint">: {{ sprint.name }}</template>
    </h1>

    <div class="d-flex justify-content-end pb-3" v-if="sprint">
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
            class="text-muted mb-n2 position-relative" 
            style="z-index: 1"
          >Tasks</b-card-text>
          <ul class="list-group list-group-flush">
            <template v-for="task of story.Task">
              <li 
                v-if="canShowTask(task)" 
                class="list-group-item pl-0 py-2 d-flex justify-content-between align-items-center"
              >
                <b-row cols="3" class="w-100">
                  <!-- Task title -->
                  <b-col cols="6">
                    <b-icon icon="caret-right-fill"></b-icon>
                    <nuxt-link :to="{ path: `/projects/${story.projectId}/stories/${story.id}/tasks/${task.id}` }">
                      {{ task.title }}
                    </nuxt-link>
                  </b-col>
  
                  <!-- Task hours -->
                  <b-col cols="2">
                    <b-avatar icon="clock" size="sm"></b-avatar>
                    <span>{{ task.hours }}h</span>
                  </b-col>
                  
                  <!-- Task developer and status -->
                  <b-col cols="4">
                    <template v-if="task.status !== 'UNASSIGNED'">
                      <b-avatar size="sm"></b-avatar>
                      <span>{{ task.assignedTo?.username }}</span>
                    </template>
                    <b-badge 
                      :variant="getVariantForTaskStatus(task.status)"
                      :class="task.status !== 'UNASSIGNED' ? 'ml-1' : null"
                    >{{ task.status }}</b-badge>
                  </b-col>
                </b-row>
              </li>
            </template>
          </ul>
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
      anyStoriesMatchFilter: false,
      stories: [],
      sprint: null,
    };
  },
  async mounted() {
    this.getSprint();
  },
  methods: {
    hasStoryAnyRelevantTasks(story) {
      return story.Task.some((task) => {
        return this.canShowTask(task);
      });
    },
    canShowTask(task) {
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
      this.$axios
        .$get(`sprints/active-sprint`,{
          params: {
            "project-id": this.projectId,
          },
        })
        .then((res) => {
          if (!res) return;

          this.sprint = res;
          this.stories = res.UserStories;
          this.showAllTasks();
        })
        .catch((reason) => {
          console.error(reason);
          this.$toast.error(
            "An error has occurred, while getting sprint information",
            {
              duration: 3000,
            }
          );
        });
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
</style>
