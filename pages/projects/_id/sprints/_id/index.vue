<template>
  <div>
    <h1>View sprint</h1>
    <br />

    <p>
      <span class="title">Name:</span> <span>{{ sprint.name }}</span>
    </p>
    <p>
      <span class="title">Start date:</span> <span>{{ formatDate(sprint.start) }}</span>
    </p>
    <p>
      <span class="title">End date:</span> <span>{{ formatDate(sprint.end) }}</span>
    </p>
    <p>
      <span class="title">Velocity:</span> <span>{{ sprint.velocity }}</span>
    </p>
  </div>
</template>

<script>
import { BIcon } from "bootstrap-vue";
import datetime from "@/mixins/datetime";

export default {
  name: "view-sprint",
  components: {
    BIcon,
  },
  mixins: [datetime],
  data() {
    return {
      id: null,
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
    if (!this.id) return;
    this.getSprint();
  },
  methods: {
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
