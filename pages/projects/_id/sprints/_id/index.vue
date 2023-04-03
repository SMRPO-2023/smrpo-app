<template>
  <div>
    <h1>View sprint</h1>
    <br />

    <p>
      <span class="title">Name:</span> <span>{{ sprint.name }}</span>
    </p>
    <p>
      <span class="title">Start date:</span>
      <span>{{ formatDate(sprint.start) }}</span>
    </p>
    <p>
      <span class="title">End date:</span>
      <span>{{ formatDate(sprint.end) }}</span>
    </p>
    <p>
      <span class="title">Velocity:</span> <span>{{ sprint.velocity }}</span>
    </p>
    <h2 class="pt-3">Stories in sprint</h2>
    <table class="table table-hover mt-3 w-100">
      <thead>
        <tr>
          <th scope="col">Title</th>
          <th scope="col">Description</th>
          <th scope="col">Business value</th>
          <th scope="col">Priority</th>
          <th scope="col">Criteria</th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="story of sprintStories" :key="story.id">
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
          <td>
            <b-input-group size="lg" style="font-scale: 12px">
              <p class="h3">
                <b-icon
                  icon="arrow-down-circle"
                  @click="removeFromSprint(story.id)"
                  class="center-and-clickable"
                ></b-icon>
              </p>
            </b-input-group>
          </td>
        </tr>
      </tbody>
    </table>
    <h2 class="pt-3">Stories</h2>
    <table class="table table-hover mt-3 w-100">
      <thead>
        <tr>
          <th scope="col">Title</th>
          <th scope="col">Description</th>
          <th scope="col">Business value</th>
          <th scope="col">Priority</th>
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
          <td>
            <b-input-group size="lg" style="font-scale: 12px">
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
    </table>
  </div>
</template>

<script>
import datetime from "@/mixins/datetime";
import priorities from "@/mixins/priorities";

export default {
  name: "view-sprint",
  components: {
    BIcon,
  },
  mixins: [datetime, priorities],
  data() {
    return {
      id: null,
      projectId: null,
      stories: [],
      sprintStories: [],
      sprint: {
        name: null,
        start: null,
        end: null,
        velocity: null,
      },
    };
  },
  async mounted() {
    this.id = this.$route.params.id;
    this.projectId = this.$route.query.projectId;
    if (!this.id) return;
    this.getSprint();
    this.getProjectStories();
    this.getSprintStories();
  },
  methods: {
    async getSprintStories() {
      await this.$axios
        .$get(`user-stories`, {
          params: {
            sprintId: this.id,
          },
        })
        .then((res) => {
          if (!res) return;
          this.sprintStories = res;
        });
    },
    async removeFromSprint(storyId) {
      await this.$axios
        .$post(`user-stories/remove-from-sprint/${storyId}`)
        .then(async (res) => {
          this.getProjectStories();
          this.getSprintStories();
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
          this.getProjectStories();
          this.getSprintStories();
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
    async getProjectStories() {
      if (!this.id) return;

      await this.$axios
        .$get(`user-stories/get-addable`, {
          params: {
            "project-id": this.projectId,
          },
        })
        .then((res) => {
          if (!res) return;
          this.stories = res;
        });
    },
    async getSprint() {
      this.$axios
        .$get(`sprints/${this.id}`)
        .then((res) => {
          this.sprint = res;
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
