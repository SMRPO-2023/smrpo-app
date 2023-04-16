<template>
  <ul class="list-group list-group-flush">
    <template v-for="task of tasks">
      <li 
        class="list-group-item pl-0 py-2 d-flex justify-content-between align-items-center"
      >
        <b-row cols="3" class="w-100">
          <!-- Task title -->
          <b-col cols="6">
            <b-icon icon="caret-right-fill"></b-icon>
            <nuxt-link :to="{ path: `/projects/${story.projectId}/stories/${story.id}/tasks/${task.id}` }">
              {{ task.title }}
            </nuxt-link>
          </b-col>

          <!-- Task hours -->
          <b-col cols="2">
            <b-avatar icon="clock" size="sm"></b-avatar>
            <span>{{ task.hours }}h</span>
          </b-col>
          
          <!-- Task developer and status -->
          <b-col cols="4">
            <b-avatar size="sm"></b-avatar>
            <template v-if="task.status !== 'UNASSIGNED'">
              <span>{{ task.assignedTo?.username }}</span>
            </template>
            <b-badge :variant="getVariantForTaskStatus(task.status)">
              {{ task.status }}
            </b-badge>
          </b-col>
        </b-row>
      </li>
    </template>
  </ul>
</template>
<script>
import priorities from "@/mixins/priorities";

export default {
  name: "task-list",
  mixins: [priorities],
  props: {
    story: {
      type: Object,
      required: true
    },
    tasks: {
      type: Array,
      default: () => []
    },
  },
}
</script>
<style scoped>
a {
  color: black !important;
}
</style>