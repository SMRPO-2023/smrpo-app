<template>
  <div>
    <h1>Sprint backlog</h1>
    <h4 class="text-muted">{{ name }}</h4>
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
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import priorities from "@/mixins/priorities";

export default {
  name: "active-sprint-backlog",
  mixins: [priorities],
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
    async getProject(projectId) {
      if (!projectId) return;

      await this.$axios.$get(`project/${projectId}`).then((res) => {
        if (!res) return;
        this.project = res;
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
