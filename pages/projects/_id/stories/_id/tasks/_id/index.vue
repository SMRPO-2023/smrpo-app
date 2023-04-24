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

  <h3 class="pt-5">Time logs</h3>
  <template v-if="task.timeLogs?.length">
    <div class="table-responsive">
      <table class="table table-hover mt-3">
        <thead>
              <tr>
                <th scope="col">Username</th>
                <th scope="col">Title</th>
                <th scope="col">Hours</th>
                <th scope="col">Hours remaining</th>
                <th scope="col"></th>
                <th scope="col"></th>
              </tr>
            </thead>
      
      <tbody>
        <tr v-for="log of task.timeLogs" :key="log.id">
          <td>{{ log.User.username }}</td>
          <td>{{ log.title }}</td>
          <td>{{ log.hours }} h</td>
          <td>{{ log.remainingHours }} h</td>
          <td>
            <h3>
              <b-icon
                v-b-tooltip.hover title="Edit log"
                icon="pencil-fill"
                :class="hasPermission(log) ? 'text-dark' : 'text-secondary'"
                @click="openEditModal(log)"
              ></b-icon>
            </h3>
          </td>
          <td>
            <h3>
              <b-icon
                v-b-tooltip.hover title="Remove log"
                :class="hasPermission(log) ? 'text-dark' : 'text-secondary'"
                icon="trash-fill" 
                @click="removeLog(log)"
              ></b-icon>
            </h3>
          </td>
        </tr>
      </tbody>
      </table>
    </div>
    </template>
    <div v-else class="text-muted">
      There are no time logs yet.
    </div>
    <!---------------------  Model edit  ------------------------------------>
    <b-modal ref="edit-modal" id="edit-modal" hide-footer>
      <template #modal-title>Edit</template>
      <b-form-group label="Title" label-for="">
        <b-form-input
            type="text"
            id="title"
            placeholder="Enter title"
            v-model="currentTimeLog.title"
            aria-describedby="input-1-live-feedback"
        />
      </b-form-group>
      <!-- hours -->
      <ValidationProvider
          name="hours"
          :rules="{
            min_value: 0,
            max_value: 30,
          }"
          v-slot="v"
        >
          <b-form-group label="Hours" label-for="hours">
            <b-input-group append="h">
              <b-form-input
                type="number"
                id="hours"
                placeholder="Enter hours"
                v-model="currentTimeLog.hours"
                :state="getValidationState(v)"
                :step="0.0001"
                aria-describedby="hours-live-feedback"
              />
            </b-input-group>
            <b-form-invalid-feedback 
              id="hours-live-feedback"
              :state="getValidationState(v)"
            >
              {{ v.errors[0] }}
            </b-form-invalid-feedback>
          </b-form-group>
        </ValidationProvider>
        <!-- hours -->
        <!-- remaining hours -->
        <ValidationProvider
          name="hoursRemaining"
          :rules="{
            min_value: 0,
            max_value: 30,
          }"
          v-slot="v"
        >
          <b-form-group label="Hours remaining" label-for="hoursRemaining">
            <b-input-group append="h">
              <b-form-input
                type="number"
                id="hours"
                placeholder="Enter remaining hours"
                v-model="currentTimeLog.remainingHours"
                :state="getValidationState(v)"
                :step="0.0001"
                aria-describedby="hours-remaining-live-feedback"
              />
            </b-input-group>
            <b-form-invalid-feedback 
              id="hours-remaining-live-feedback"
              :state="getValidationState(v)"
            >
              {{ v.errors[0] }}
            </b-form-invalid-feedback>
          </b-form-group>
        </ValidationProvider>
      <!-- remaining hours -->
      <div class=" w-100 d-flex justify-content-end pb-2 pt-4">
        <b-button class=" w-25 p-2 mr-2 btn-danger"  @click="$bvModal.hide('edit-modal')"
        >Cancel</b-button>
        <b-button class=" w-25 p-2 btn-success"  @click="editLog()"
        >Edit</b-button>
      </div>
    </b-modal>
    <!---------------------  Model edit  ------------------------------------>

  </div>
</template>

<script>
import { mapGetters } from "vuex";
import datetime from "@/mixins/datetime";

export default {
  mixins: [datetime],
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
      },
      currentTimeLog: {
        timeLog: null,
        title: null,
        hours: null,
        remainingHours : null,
      }
    };
  },
  computed: {
    ...mapGetters({
      isAdmin: "user/isAdmin",
      currentUser: "user/getUser",
    }),
  },
  async mounted() {
    this.id = this.$route.params.id;
    if (!this.id) return;
    this.getTask();
  },
  methods: {
    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    },
    hasPermission(log){
      return parseInt(this.currentUser.id) === parseInt(log.userId) || this.isAdmin
    },
    async openEditModal(timeLog) {
      if(this.hasPermission(timeLog)){
        this.currentTimeLog.timeLog = timeLog;
        this.currentTimeLog.title = timeLog.title;
        this.currentTimeLog.hours = timeLog.hours;
        this.currentTimeLog.remainingHours = timeLog.remainingHours;
        this.$refs["edit-modal"].show();
      }else{
        this.$toast.error("You dont have the permissions to edit this log.", {
            duration: 3000,
        });
      }
    },
    async removeLog(log){
      if(!this.hasPermission(log)){
        this.$toast.error("You dont have the permissions to remove this log.", {
            duration: 3000,
        });
      }else{
        let confirmed = false;
        try {
          confirmed = await this.$bvModal.msgBoxConfirm(
            "Are you sure you want to remove this log?",
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
          .$delete(`time-logs/${log.id}`)
          .then((res) => {
            this.getTask();
            this.$toast.success("Log successfully removed", {
              duration: 3000,
            });
          })
          .catch((reason) => {
            console.error(reason);
            this.$toast.error(
              "An error has occurred, while deleting the log",
              {
                duration: 3000,
              }
            );
          });
        }
    },
    async editLog(){
      await this.$axios
        .$put(`time-logs/${this.currentTimeLog.timeLog.id}`, {
          day: this.currentTimeLog.timeLog.day,
          hours: parseFloat(this.currentTimeLog.hours),
          remainingHours: parseFloat(this.currentTimeLog.remainingHours),
          userId: this.currentTimeLog.timeLog.userId,
          taskId: this.currentTimeLog.timeLog.taskId,
          title: this.currentTimeLog.title,
        })
        .then((res) => {
          this.error = null;
          this.responseErrors = [];
          this.$toast.success("Log time succesfully updated.", {
            duration: 3000,
          });
          this.getTask();
          this.$bvModal.hide('edit-modal')
        })
        .catch((error) => {
          const status = error?.response?.status;
          const data = error?.response?.data;
          // some instances of errors return main message along with array of detailed shorter messages
          if (status && status === 400) {
            if (data && data.message instanceof Array) {
              this.responseErrors = data.message;
            }
            this.error = "Wrong input, while updating log time";
          } else {
            this.error = data?.message;
          }
          this.$toast.error("An error has occurred, while log time", {
            duration: 3000,
          });
        });
    },
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