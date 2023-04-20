<template>
  <div>
    <h1>View user story</h1>
    <br />

    <p>
      <span class="title">Title:</span> <span>{{ story.title }}</span>
    </p>

    <p>
      <span class="title">Description:</span>
    </p>
    <p style="white-space: pre-line">{{ story.description }}</p>

    <p>
      <span class="title">Acceptance criteria:</span>
    </p>
    <p style="white-space: pre-line">{{ story.acceptanceCriteria }}</p>

    <p>
      <span class="title">Priority:</span> <span>{{ story.priority }}</span>
    </p>

    <p>
      <span class="title">Points:</span> <span>{{ story.points }}</span>
    </p>

    <p>
      <span class="title">Business value:</span> <span>{{ story.businessValue }}</span>
    </p>

    <p v-if="story.sprintId">
      <span class="title">Sprint:</span> <nuxt-link :to="{ path: `/projects/${story.projectId}/sprints/${story.sprintId}` }">{{ story.sprintId }}</nuxt-link>
    </p>
    <br>
    <h2>Comments</h2>
    <template v-if="story.comments?.length">
      <div  
        v-for="comment of story.comments" 
        :key="comment.id"
      >
        <div class="card">
          <div class="d-flex">
            <div class="d-flex flex-column justify-content-between">
              <div class="d-flex align-items-center">
                <b class="mr-2">{{ comment.User.firstname }} {{ comment.User.lastname }}</b>
              </div>
              <span class="text-muted">{{ formatDateTimeFull(comment.createdAt) }}</span>
            </div>
          </div>
          <!-- Body -->
          <div class="mt-3">
            <pre class="clamp mb-0">{{ comment.message }}</pre>
          </div>
        </div>
      </div>
    </template>
    <div v-else class="text-muted">
      There are no comments yet.
    </div>
  </div>
</template>

<script>
import datetime from "@/mixins/datetime";

export default {
  mixins: [datetime],
  name: "view-user-story",
  data() {
    return {
      story: {
        title: null,
        description: null,
        priority: null,
        points: null,
        projectId: null,
        sprintId: null,
        businessValue: null,
        acceptanceCriteria: null,
        comments: [],
      },
    };
  },
  async mounted() {
    this.id = this.$route.params.id;
    if (!this.id) return;
    this.getUserStory();
  },
  methods: {
    async getUserStory() {
      this.$axios
        .$get(`user-stories/${this.id}`)
        .then((res) => {
          this.story = res;
        })
        .catch((reason) => {
          console.error(reason);
          this.$toast.error(
            "An error has occurred, while getting user story information",
            {
              duration: 3000,
            }
          );
        });
    },
  },
}
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

.card{
  background: #f2f0f2;
  padding: 2rem;
  margin-bottom: 1rem;
  border: none;
  border-radius: 25px;
}

.date {
  display: block;
  font-size: .80em;
  color: #909090;
}
.clamp {
  white-space: pre-line;
}
</style>