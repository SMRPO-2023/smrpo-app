<template>
  <div>
    <h1>Edit task</h1>
    <create-edit-task :task="task" />
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "edit-task",
  computed: {
    ...mapGetters({
      taskId: "route-id/getTaskId",
    }),
  },
  data() {
    return {
      task: null,
    };
  },
  created() {
    this.getTask();
  },
  methods: {
    async getTask() {
      if (!this.taskId) return;

      this.$axios
        .$get(`tasks/${this.taskId}`)
        .then((res) => {
          this.task = res;
        })
        .catch((reason) => {
          console.error(reason);
          this.$toast.error(
            "An error has occurred, while getting task information",
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