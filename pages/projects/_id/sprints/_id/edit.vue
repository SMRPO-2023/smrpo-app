<template>
<div>
    <h1>Edit sprint</h1>
    <create-edit-sprint :sprint="sprint" />
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "edit-sprint",
  computed: {
    ...mapGetters({
      sprintId: "route-id/getSprintId",
    }),
  },
  data() {
    return {
      sprint: null,
    };
  },
  created() {
    this.getSprint();
  },
  methods: {
    async getSprint() {
      if (!this.sprintId) return;

      this.$axios
        .$get(`sprints/${this.sprintId}`)
        .then((res) => {
          this.sprint = res.sprint;
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
}
</script>

<style scoped>

</style>