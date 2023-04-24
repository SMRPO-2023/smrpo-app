<template>
  <b-dropdown 
    v-show="dropdownHasItems"
    :size="small ? 'sm' : 'md'"
    variant="link" 
    toggle-class="text-decoration-none simple-dropdown-btn" 
    no-caret 
    right
    down
    no-flip
  >
    <template #button-content>
      <b-icon icon="three-dots-vertical" class="center-and-clickable"></b-icon>
      <span class="sr-only">Task options</span>
    </template>
    
    <!-- <b-dropdown-item> maps into the following form -->
    <!-- needed to be able to show tooltip when disabled -->
    <li 
      v-if="isMyTask" 
      role="presentation" 
      id="task-dropdown-item-finish"
    >
      <a 
        role="menuitem" 
        href="#" 
        :class="{disabled: !canFinish, 'dropdown-item': true}" 
        @click="changeTaskAction('finish')"
      >
        Mark as done
      </a>
    </li>

    <!-- other dropdown items -->
    <b-dropdown-item
      v-if="task.status === 'UNASSIGNED'"
      @click="changeTaskAction('accept')"
    >Assign to me</b-dropdown-item>
    <b-dropdown-item
      v-if="isMyTask && task.status !== 'UNASSIGNED'"
      @click="changeTaskAction('accept')" 
      :disabled="!canAccept"
    >Accept</b-dropdown-item>
    <b-dropdown-item
      v-if="isMyTask && task.status !== 'UNASSIGNED'"
      @click="changeTaskAction('reject')"
      :disabled="!canReject"
    >Reject</b-dropdown-item>
    <b-dropdown-item 
      v-if="hasPermissionToDelete && canDelete"
      @click="deleteTask"
    >Delete</b-dropdown-item>
    
    <!-- dropdown item tooltips -->
    <b-tooltip 
      target="task-dropdown-item-finish" 
      triggers="hover"
      :disabled="canFinish"
    >
      Last logged time must have 0 remaining hours
    </b-tooltip>
  </b-dropdown>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "tasks-dropdown",
  props: {
    task: {
      type: Object,
      required: true
    },
    small: {
      type: Boolean,
      default: false
    },
    hasPermissionToDelete: {
      type: Boolean,
      default: false
    },
  },
  computed: {
    ...mapGetters({
      isAdmin: "user/isAdmin",
      currentUser: "user/getUser",
    }),
    dropdownHasItems() {
      if (this.task.status === 'FINISHED') return false;
      // individual dropdown item conditions
      return this.isMyTask ||
            this.task.status === 'UNASSIGNED' || 
            (this.isMyTask && this.task.status !== 'UNASSIGNED') || 
            (this.hasPermissionToDelete && this.canDelete);
    },
    isMyTask() {
      if (!this.currentUser || !this.task) return false;
      return this.task.userId === this.currentUser.id;
    },
    canFinish() {
      if (!this.isMyTask || !this.task.timeLogs.length) return false;
      return this.task.timeLogs.sort((a, b) => b.id - a.id)[0].remainingHours === 0;
    },
    canAccept() {
      if (!this.isMyTask) return false;
      return this.task.status !== 'ACCEPTED' && this.task.status !== 'FINISHED';
    },
    canReject() {
      if (!this.isMyTask) return false;
      return this.task.status === 'ASSIGNED' || this.task.status === 'ACCEPTED';
    },
    canDelete() {
      if (!this.task) return false;
      return this.task.status === 'UNASSIGNED' || this.task.status === 'ASSIGNED';
    },
  },
  methods: {
    /**
     * @param action: accept, reject, finish, (assign - is not sent from here)
     */
    async changeTaskAction(action) {
      let confirmed = false;
      try {
        confirmed = await this.$bvModal.msgBoxConfirm(
          "Are you sure you want to " + action + " this task?",
          {
            title: this.capitalize(action) + " task",
            cancelTitle: "Cancel",
            okTitle: "Confirm",
          }
        );
      } catch (error) {
        console.error(error);
      }
      if (!confirmed) return;

      this.$axios
        .$post(`tasks/${this.task.id}/${action}`)
        .then((res) => {
          if (!res) return;
          this.$emit("taskUpdated", res)
          this.$toast.success("Task successfully " + action + "ed", {
            duration: 3000,
          });
        })
        .catch((reason) => {
          console.error(reason);
          this.$toast.error(
            "An error has occurred, while marking task as " + action + "ed",
            {
              duration: 3000,
            }
          );
        });
    },
    async deleteTask() {
      let confirmed = false;
      try {
        confirmed = await this.$bvModal.msgBoxConfirm(
          "Are you sure you want to delete this task?",
          {
            title: "Delete",
            cancelTitle: "Cancel",
            okTitle: "Confirm",
          }
        );
      } catch (error) {
        console.error(error);
      }

      if (!confirmed) return;

      this.$axios
        .$delete(`tasks/${this.task.id}`)
        .then((res) => {
          if (!res) throw new Error;
          this.$emit("taskDeleted", this.task)
          this.$toast.success("Task successfully removed", {
            duration: 3000,
          });
        })
        .catch((reason) => {
          console.error(reason);
          this.$toast.error(
            "An error has occurred, while deleting the task",
            {
              duration: 3000,
            }
          );
        });
    },
    capitalize(str) {
      const lower = str.toLowerCase();
      return str.charAt(0).toUpperCase() + lower.slice(1);
    },
  },
}
</script>

<style scoped>
</style>