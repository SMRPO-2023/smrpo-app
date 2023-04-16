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
    <h2 class="pb-3">Comments</h2>
    <div v-for="comment of story.comments" :key="comment.id">
      <div class="card"><div class="font-weight-bold h5 pb-2">{{comment.User.username}}</div>
      <div class="pb-3">{{comment.message}}</div>
      <div class="date">{{formatDateTime(comment.createdAt)}}</div>
    </div>
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
</style>