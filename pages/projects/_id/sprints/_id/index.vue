<template>
  <div>
    <h1>View sprint</h1>
    <br />

    <p>
      <span class="title">Name:</span> <span>{{ name }}</span>
    </p>
    <p>
      <span class="title">Start date:</span>
      <span>{{ formatDate(start) }}</span>
    </p>
    <p>
      <span class="title">End date:</span>
      <span>{{ formatDate(end) }}</span>
    </p>
    <p>
      <span class="title">Velocity:</span> <span>{{ velocity }}</span>
    </p>
    <div v-if="isSprintActive(sprint)">
      <h2 class="pt-3">Stories in current sprint</h2>

      <div class="table-responsive">
        <table class="table table-hover mt-3">
          <thead>
            <tr>
              <th scope="col">Title</th>
              <th scope="col">Description</th>
              <th scope="col">Business value</th>
              <th scope="col">Priority</th>
              <th scope="col">Acceptance test</th>
              <th scope="col">Points</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody v-if="sprint.UserStories.length">
            <tr v-for="story of sprint.UserStories" :key="story.id">
              <td>
                <a> #{{ story.id }} - {{ story.title }} </a>
              </td>
              <td>{{ story.description | limit(100) }}</td>
              <td>{{ story.businessValue }}</td>
  
              <td>
                <b-button
                  id="dropdown-right"
                  right
                  :variant="getVariantForPriority(story.priority)"
                >
                  {{ getNameForPriority(story.priority) }}
                </b-button>
              </td>
  
              <td>{{ story.acceptanceCriteria | limit(100) }}</td>
              <td>{{ story.points }}</td>
              <td>
                <b-input-group size="lg" style="font-scale: 12px">
                  <p class="h3">
                    <b-button
                      v-if="isProjectOwner()"
                      variant="danger"
                      @click="removeFromSprint(story.id)"
                      class="center-and-clickable"
                    >Reject</b-button>
                    
                  </p>
                </b-input-group>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td class="text-muted text-center" colspan="7">
                No stories in this sprint yet
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <hr>
      <h4 class="d-flex justify-content-end mr-5">Sum : {{currentLoad}} / {{ velocity }}</h4>
      
      <br>
      
      <div v-if="isScrumMaster()">
        <h2 class="pt-3">Stories</h2>

        <div class="table-responsive">
          <table class="table table-hover mt-3">
            <thead>
              <tr>
                <th scope="col">Title</th>
                <th scope="col">Description</th>
                <th scope="col">Business value</th>
                <th scope="col">Priority</th>
                <th scope="col">Acceptance test</th>
                <th scope="col">Points</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody v-if="addableStories.length">
              <tr v-for="story of addableStories" :key="story.id">
                <td>
                  <nuxt-link :to="{ path: `stories/${story.id}` }">
                    #{{ story.id }} - {{ story.title }}
                  </nuxt-link>
                </td>
                <td>{{ story.description | limit(100) }}</td>
                <td>{{ story.businessValue }}</td>
                <td>
                  <b-button
                    id="dropdown-right"
                    right
                    :variant="getVariantForPriority(story.priority)"
                  >
                    {{ getNameForPriority(story.priority) }}
                  </b-button>
                </td>
  
                <td>{{ story.acceptanceCriteria | limit(100) }}</td>
                <td>{{ story.points }}</td>
                <td>
                  <b-input-group size="lg" style="font-scale: 12px" v-if="canBeAdded(story.points)">
                    <p class="h3">
                      <b-icon
                        icon="arrow-up-circle"
                        @click="moveToSprint(story.id)"
                        class="center-and-clickable"
                      ></b-icon>
                    </p>
                  </b-input-group>
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr>
                <td class="text-muted text-center" colspan="7">
                  No more addable stories left
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { BIcon } from "bootstrap-vue";
import { mapGetters } from "vuex";
import datetime from "@/mixins/datetime";
import priorities from "@/mixins/priorities";

export default {
  name: "view-sprint",
  components: {
    BIcon,
  },
  mixins: [datetime, priorities],
  computed: {
    ...mapGetters({
      currentUser: "user/getUser",
      isAdmin: "user/isAdmin",
    }),
  },
  data() {
    return {
      id: null,
      stories: [],
      addableStories: [],
      sprint: null,
      name: null,
      start: null,
      end: null,
      velocity: null,
      currentLoad: null,
      project: null,
    };
  },
  async mounted() {
    this.id = this.$route.params.id;
    if (!this.id) return;
    this.getSprint();
    
   
  },
  methods: {
    isProjectOwner() {
      if (!this.currentUser || !this.project) return false;
      if (this.isAdmin){
        return true;
      }
      return this.currentUser.id === this.project.projectOwnerId;
    },
    isScrumMaster() {
      if (this.isAdmin){
        return true;
      }
      if (!this.currentUser || !this.project) return false;
      return this.currentUser.id === this.project.scrumMasterId;
    },
    async getProject(projectId) {
      if (!projectId) return;

      await this.$axios.$get(`project/${projectId}`).then((res) => {
        if (!res) return;
        this.project = res;
      });
    },
    canBeAdded(points) {
      if(this.currentLoad + points < this.velocity){
        return true;
      }
      return false;
    },
    isSprintActive(sprint) {
      if(sprint != null){
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return new Date(sprint.start) <= now && new Date(sprint.end) >= now;
      }
    },
    async removeFromSprint(storyId) {
      await this.$axios
        .$post(`user-stories/remove-from-sprint/${storyId}`)
        .then(async (res) => {
          this.getSprint();
          this.$toast.success("Story removed from sprint.", {
            duration: 3000,
          });
        })
        .catch((error) => {
          this.$toast.error(
            "An error has occurred, while removing story from sprint.",
            {
              duration: 3000,
            }
          );
        });
    },
    async moveToSprint(storyId) {
      await this.$axios
        .$post("user-stories/add-to-sprint", {
          sprintId: parseInt(this.id),
          stories: [storyId],
        })
        .then(async (res) => {
          this.getSprint();
          this.$toast.success("Story moved to sprint.", {
            duration: 3000,
          });
        })
        .catch((error) => {
          this.$toast.error(
            "An error has occurred, while adding story to sprint.",
            {
              duration: 3000,
            }
          );
        });
    },
    async getAddableStories(projectId) {
      this.$axios
        .$get(`user-stories/get-addable`,{
          params: {
            "project-id": projectId,
          },
        })
        .then((res) => {
          this.addableStories = res;
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
    async getSprint() {
      this.$axios
        .$get(`sprints/${this.id}`)
        .then((res) => {
          this.getAddableStories(res.sprint.projectId);
          this.getProject(res.sprint.projectId);
          this.sprint = res.sprint;
          this.name = res.sprint.name;
          this.start = res.sprint.start;
          this.end = res.sprint.end;
          this.velocity = res.sprint.velocity;
          this.stories = res.sprint.UserStories;
          this.currentLoad = res.currentLoad;
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
.title {
  font-size: 1.17em;
  margin-top: 1em;
  margin-bottom: 1em;
  margin-left: 0;
  margin-right: 0;
  font-weight: bold;
}
</style>
