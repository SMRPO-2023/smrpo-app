<template>
  <b-container fluid>
    <b-row>
      <b-col offset-lg="2" lg="8" cols="12" class="my-3">
        <div class="d-flex justify-content-between align-items-center">
          <h1 class="pt-3">Stories in sprint</h1>
        </div>
      <table class="table table-hover mt-3 w-100">
        <thead>
          <tr>
            <th scope="col">Title</th>
            <th scope="col">Description</th>
            <th scope="col">Business value</th>
            <th scope="col">Priority</th>
            <th scope="col">Acceptance test</th>
            <th scope="col">Points</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="story of stories" :key="story.id">
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
        .$get(`sprints/active-sprint`,{
          params: {
            "project-id": this.id,
          },
        })
        .then((res) => {
          this.getProject(res.projectId);
          this.sprint = res;
          this.name = res.name;
          this.start = res.start;
          this.end = res.end;
          this.velocity = res.velocity;
          this.stories = res.UserStories;
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

<style scoped></style>
