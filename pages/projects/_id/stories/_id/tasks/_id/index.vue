<template>
  <div>
    <h1>View task</h1>
    <br />

    <p>
      <span class="title">Title:</span> <span>{{ task.title }}</span>
    </p>

    <p>
      <span class="title">Description:</span>
    </p>
    <p style="white-space: pre-line">{{ task.description }}</p>

    <p>
      <span class="title">Estimated hours:</span> <span>{{ task.estimate }}</span>
    </p>

    <p>
      <span class="title">Status:</span> <span>{{ task.status }}</span>
    </p>

    <p>
      <span class="title">Assigned to:</span> <span>
          <template v-if="task.status !== 'UNASSIGNED'">
            {{ task.assignedTo?.username }}
          </template>
          <span v-else class="text-muted">
            Nobody
          </span>
        </span>
    </p>

    <p>
      <span class="title">Done:</span> <span>
        <template v-if="task.done">Yes</template>
        <template v-else>No</template>
      </span>
    </p>
  </div>
</template>

<script>
export default {
  name: "view-task",
  data() {
    return {
      id: null,
      task: {
        title: null,
        description: null,
        estimate: null,
        status: null,
        userId: null,
        done: null,
      },
    };
  },
  async mounted() {
    this.id = this.$route.params.id;
    if (!this.id) return;
    this.getTask();
  },
  methods: {
    async getTask() {
      this.$axios
        .$get(`tasks/${this.id}`)
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
.title {
  font-size: 1.17em;
  margin-top: 1em;
  margin-bottom: 1em;
  margin-left: 0;
  margin-right: 0;
  font-weight: bold;
}
</style>