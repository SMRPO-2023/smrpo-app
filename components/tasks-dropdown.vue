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
    <b-dropdown-item
      v-if="task.status === 'UNASSIGNED'"
      @click="acceptRejectTask(true)"
    >Assign to me</b-dropdown-item>
    <b-dropdown-item
      v-if="isMyTask && task.status !== 'UNASSIGNED'"
      @click="acceptRejectTask(true)" 
      :disabled="!canAccept"
    >Accept</b-dropdown-item>
    <b-dropdown-item
      v-if="isMyTask && task.status !== 'UNASSIGNED'"
      @click="acceptRejectTask(false)"
      :disabled="!canReject"
    >Reject</b-dropdown-item>
    <b-dropdown-item 
      v-if="hasPermissionToDelete && canDelete"
      @click="deleteTask"
    >Delete</b-dropdown-item>
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
      return this.task.status === 'UNASSIGNED' || 
            (this.isMyTask && this.task.status !== 'UNASSIGNED') || 
            (this.hasPermissionToDelete && this.canDelete);
    },
    isMyTask() {
      if (!this.currentUser || !this.task) return false;
      return this.task.userId === this.currentUser.id;
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
    async acceptRejectTask(isAccepting) {
      let confirmed = false;
      try {
        confirmed = await this.$bvModal.msgBoxConfirm(
          "Are you sure you want to " + (isAccepting ? 'accept' : 'reject') + " this task?",
          {
            title: (isAccepting ? 'Accept' : 'Reject') + " task",
            cancelTitle: "Cancel",
            okTitle: "Confirm",
          }
        );
      } catch (error) {
        console.error(error);
      }
      if (!confirmed) return;

      this.$axios
        .$post(`tasks/${this.task.id}/${isAccepting ? 'accept' : 'reject'}`)
        .then((res) => {
          if (!res) return;
          this.$emit("taskUpdated", res)
          this.$toast.success("Task successfully " + (isAccepting ? 'accepted' : 'rejected'), {
            duration: 3000,
          });
        })
        .catch((reason) => {
          console.error(reason);
          this.$toast.error(
            "An error has occurred, while " + (isAccepting ? 'accepting' : 'rejecting') + " the task",
            {
              duration: 3000,
            }
          );
        });
    },
    async deleteTask(task) {
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
  },
}
</script>

<style scoped>
</style>