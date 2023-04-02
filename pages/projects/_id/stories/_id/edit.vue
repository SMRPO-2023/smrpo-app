<template>
  <div>
    <h1>Edit user story</h1>

    <create-edit-user-story :story="story" />
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "edit-user-story",
  computed: {
    ...mapGetters({
      storyId: "route-id/getStoryId",
    }),
  },
  data() {
    return {
      story: null,
    };
  },
  created() {
    this.getUserStory();
  },
  methods: {
    async getUserStory() {
      if (!this.storyId) return;

      await this.$axios
        .$get(`user-stories/${this.storyId}`)
        .then((res) => {
          if (!res) return Promise.reject();
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
};
</script>

<style scoped></style>
