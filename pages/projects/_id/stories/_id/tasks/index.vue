<template>
  <div>
    <div class="d-flex justify-content-between align-items-center">
      <h1 class="mb-0">Tasks</h1>
      <nuxt-link v-if="canCreate" to="tasks/create">
        <b-button v-b-tooltip.hover title="Add task" variant="primary">Create</b-button>
      </nuxt-link>
    </div>

    <div class="table-responsive">
      <table class="table table-hover mt-3">
        <thead>
          <tr>
            <th scope="col">Title</th>
            <th scope="col">Description</th>
            <th scope="col">Remaining</th>
            <th scope="col">Total spent</th>
            <th scope="col">Estimated</th>
            <th scope="col">Assigned to</th>
            <th scope="col">Status</th>
            <th scope="col">Done</th>
            <th></th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody v-if="tasks.length">
          <tr v-for="task of tasks" :key="task.id">
            <td>
              <nuxt-link :to="{ path: `tasks/${task.id}` }">
                {{ task.title }}
              </nuxt-link>
            </td>
            <td>{{ task.description | limit(80) }}</td>
            <td>{{ getRemainingHours(task) }}h</td>
            <td>{{ getTotalSpentHours(task) }}h</td>
            <td>{{ task.estimate }}h</td>

            <td>
              <span v-if="task.status !== 'UNASSIGNED'">
                <template v-if="task.assignedTo && task.userId">
                  {{ task.assignedTo?.username }}
                  <span class="text-muted" v-if="isMyTask(task)"> (you)</span>
                </template>
                <span v-else class="text-muted">
                  Unknown
                </span>
              </span>
              <span v-else class="text-muted">
                Nobody
              </span>
            </td>
            <td>
              <b-badge :variant="getVariantForTaskStatus(task.status)">{{ task.status }}</b-badge>
            </td>
            <td>
              <b-badge v-if="task.done" variant="success">Yes</b-badge>
              <b-badge v-else variant="danger">No</b-badge>
            </td>
            <td > <!--<stopwatch v-if="task.active" :running ="running " :resetWhenStart="true" />--></td>
            <td class="narrow-col">
              <tasks-dropdown
                :task="task"
                :has-permission-to-delete="hasPermission"
                @taskUpdated="onTaskUpdate"
                @taskDeleted="onTaskDelete"
              />
            </td>
             <td>
              <h2 class="d-flex align-content-start">
                <b-button :disabled = "task.active === false" @click="toggle(task)"  style="background-color: Transparent; border: none;">
                  <h2>                
                    <b-icon
                      class="d-flex align-content-start"
                      v-b-tooltip.hover title="Log time"
                      variant="success"
                      icon="stopwatch" 
                    ></b-icon>
                  </h2>
                </b-button>
                
              </h2>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td class="text-muted text-center" colspan="8">
              No tasks yet
            </td>
          </tr>
        </tbody>
        <tfoot v-if="tasks.length" class="font-weight-bold">
          <tr>
            <td colspan="2">Total</td>
            <td>{{ getTasksRemainingHours }}h</td>
            <td>{{ getTasksTotalSpentHours }}h</td>
            <td>{{ getTasksEstimatedHours }}h</td>
            <td colspan="4"></td>
          </tr>
        </tfoot>
      </table>
      <!---------------------  Model stopwatch  ------------------------------------>
    <b-modal ref="stop-watch-modal" id="stop-watch-modal" hide-footer>
      <template #modal-title>Log time</template>
      <p>Do you wish to log your time?</p>
      <!-- title -->
      <ValidationProvider
          name="text"
          :rules="{ required: true }"
          v-slot="v"
        >
          <b-form-group label="Title" label-for="title">
            <b-input-group >
              <b-form-input
                type="text"
                id="title"
                placeholder="Enter title"
                v-model="title"
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
      <!-- title -->
      <!-- remaining hours -->
        <ValidationProvider
          name="hoursRemaining"
          :rules="{
            min_value: 0.1,
            max_value: 30,
          }"
          v-slot="v"
        >
          <b-form-group label="Hours" label-for="hoursRemaining">
            <b-input-group append="h">
              <b-form-input
                type="number"
                id="hours"
                placeholder="Enter hours"
                v-model="remainingHours"
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
      <!--<p>Hours : {{ parseFloat(time / 60 / 60).toFixed(2) }}</p>-->
      <p>Time spent : {{this.logger.hours}} : {{this.logger.minutes}} : {{this.logger.seconds}}</p>
      <div class=" w-100 d-flex justify-content-end pb-2 pt-4">
        <b-button class=" w-25 p-2 mr-2 btn-danger"  @click="$bvModal.hide('stop-watch-modal')"
        >Cancel</b-button>
        <b-button class=" w-25 p-2 btn-success"  @click="logTime()"
        >Submit</b-button>
      </div>
    </b-modal>
    <!---------------------  Model stopwatch  ------------------------------------>
    <div class="btn-container card w-50 mt-5"  v-show="this.loggerActive">
      <h2>Time log :</h2>
        <!--<button @click="startT">start</button> <button @click="stopT">stop</button>-->
        <stopwatch v-show="this.loggerActive" :running ="running " :resetWhenStart="true" />
    </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import priorities from "@/mixins/priorities";
import stopwatch from "@/components/stop-watch";

export default {
  name: "tasks",
  mixins: [priorities],
  components: {
    stopwatch
  },
  computed: {
    ...mapGetters({
      isAdmin: "user/isAdmin",
      currentUser: "user/getUser",
      projectId: "route-id/getProjectId",
      storyId: "route-id/getStoryId",
    }),
    isScrumMaster() {
      if (!this.currentUser || !this.project) return false;
      return this.currentUser.id === this.project.scrumMasterId;
    },
    isDeveloper() {
      if (!this.currentUser || !this.project) return false;
      return !!this.project.developers.find((u) => u.user.id === this.currentUser.id);
    },
    hasPermission() {
      return this.isAdmin || this.isScrumMaster || this.isDeveloper
    },
    canCreate() {
      if (!this.project || !this.story || !this.sprint) return false;
      return this.hasPermission && !this.story.acceptanceTest && this.story.sprintId && this.isSprintActive;
    },
    isSprintActive() {
      if (!this.sprint) return false;
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return new Date(this.sprint.start) <= now && new Date(this.sprint.end) >= now;
    },
    getTasksRemainingHours() {
      const sum = this.tasks.reduce((prev, curr) => prev + this.getRemainingHours(curr), 0);
      return Math.round(sum * 10) / 10;
    },
    getTasksTotalSpentHours() {
      const sum = this.tasks.reduce((prev, curr) => prev + this.getTotalSpentHours(curr), 0);
      return Math.round(sum * 10) / 10;
    },
    getTasksEstimatedHours() {
      const sum = this.tasks.reduce((prev, curr) => prev + curr.estimate, 0);
      return Math.round(sum * 10) / 10;
    },
  },
  data() {
    return {
      project: null,
      story: null,
      sprint: null,
      tasks: [],
      running: false,
      remainingHours: null,
      title: null,
      loggerActive: null,
      showLoggerTimer: null,
      logger: {
        currentTask: null,
        active: false,
        loggerTime: null,
        taskId: null,
        hours: null,
        minutes: null,
        seconds: null,
      },
    };
  },
  created() {
    this.getProjectWithData();
    this.getTasks();
    if(localStorage.getItem("loggerActive") === null){
      localStorage.setItem("loggerActive", this.running);
    }else{
      this.running = localStorage.getItem("loggerActive") === 'true';
      this.logger.taskId = localStorage.getItem("loggerTaskId");
    }
    this.showLogger();
  },
  unmounted(){
    localStorage.removeItem('loggerStartTime');
    localStorage.removeItem('loggerTime');
  },
  methods: {
    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    },
    convertTime(){
      //Smaller than a minute
      if(this.time < 60){
        this.time = 60;
        this.$toast.success("Logged less than 1 minute, rounding up to 1 minute.", {
            duration: 3000,
        });
      } 
      //Bigger thanm 15h (15h = 54.000s)
      if(this.time > 54000){
        this.time = 54000;
        this.$toast.success("Logged more than 15 hours, rounding down to 15 hours.", {
            duration: 3000,
        });
      }
      const totalMinutes = Math.floor(this.time / 60);
      this.logger.seconds = (this.time % 60).toString().padStart(2, '0');
      this.logger.hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
      this.logger.minutes = (totalMinutes % 60).toString().padStart(2, '0');
    },
    openStopWatchModal(task) {
      if(!this.isCorrectTask(task)){
        this.$toast.error("You dont have the permissions to log this  time.", {
            duration: 3000,
        });
      }else{
        this.currentTask = task;
        this.taskId = task.id;
        this.$refs["stop-watch-modal"].show();
      }
    },
    isCorrectTask(task){
      
      var loggerTaskId = (localStorage.getItem("loggerTaskId"));
      if(loggerTaskId == task.id || this.isAdmin){
          return true;
      }
      return false;

    },
    isRunning(){
      return this.running;
    },
    stopT: function() {
      this.running = false;
      this.logger.taskId = null;
      this.getTasks();
      this.showLogger();
      //clearInterval(this.timer);
      
      //if (this.restWhenStop) this.resetT();
      
    },
    startT: function() {
      this.running = true;
      this.showLogger();
      //this.running = true;
      //localStorage.setItem("taskId", this.logger.taskId);

      //localStorage.setItem("loggerTimer", this.timer);
    },
    toggle: function(task) { 
      if(this.running){
        //this.stopT();

        this.startTime = Date.parse(localStorage.getItem("loggerStartTime"));
        var timeNow = new Date();
        this.time = Math.floor(((timeNow - this.startTime)/1000));
        this.convertTime();
        this.openStopWatchModal(task);
      
      }else{
        if(task.userId === this.currentUser.id){
          this.logger.taskId = task.id;
          localStorage.setItem("loggerTaskId", task.id);
          localStorage.setItem("loggerStoryId", this.storyId);
          
          this.getTasks();
          this.startT();
        }else{
          this.$toast.error("You are not the owner of this task", {
              duration: 3000,
          });
        }

      } 
    },
    showLogger(){
      var loggerStoryId = localStorage.getItem("loggerStoryId");
      if(loggerStoryId === this.storyId.toString()){
        if(this.running){
          this.loggerActive = true;
          return;
        }else{
          this.loggerActive = false;
          return;
        }
      }
      this.loggerActive = false;
    },
    toggleTimeLog(task){
      this.running = !this.running;
      localStorage.setItem("loggerActive", this.running);
      this.logger.taskId = task.id;
    },
    getTotalSpentHours(task) {
      if (!task?.timeLogs?.length) return 0;
      const total = task.timeLogs.reduce((prev, curr) => prev + curr.hours, 0);
      return this.round(total);
    },
    getRemainingHours(task) {
      if (!task?.timeLogs?.length) return 0;
      const remaining = task.timeLogs.slice().sort((a, b) => b.createdAt - a.createdAt)[0]?.remainingHours || 0;
      return this.round(remaining);
    },
    round(num) {
      return Math.round(num * 10) / 10;
    },
    isMyTask(task) {
      if (!this.currentUser || !task) return false;
      return task.userId === this.currentUser.id;
    },
    async getProjectWithData() {
      if (!this.projectId) return;

      await this.$axios.$get(`project/${this.projectId}`).then((res) => {
      if (!res) return;
        this.project = res;
        this.story = res.UserStory.find((s) => s.id === this.storyId);
        this.sprint = res.sprints.find((s) => s.id === this.story.sprintId);
      });
    },
    async getTasks() {
      if (!this.storyId) return;

      await this.$axios
        .$get(`tasks`, { params: { usid: this.storyId } })
        .then((res) => {
          if (!res) return;
          this.logger.taskId = localStorage.getItem("loggerTaskId");
          if(this.running){
            res.forEach(element => {
              element['active'] = element['id'] == (this.logger.taskId).toString() ? true : false;
            });
          }else{
            res.forEach(element => {
              if(element['userId'] == this.currentUser.id && element['status'] == "ACCEPTED"){
                element['active'] = true;
              }else{
                element['active'] = false;
              }
              
            });
          }
          this.tasks = res;
        })
    },
    onTaskUpdate(task) {
      // find and replace updated task from tasks array
      const index = this.tasks.findIndex((t) => t.id === task.id);
      if (index < 0) return;
      this.tasks.splice(index, 1, task);
    },
    onTaskDelete(task) {
      this.tasks = this.tasks.filter((t) => t.id !== task.id);
    },
    async logTime(){
        this.$axios
          .$post(`time-logs/log-hours`,{
            day: new Date(),
            hours: parseFloat((this.time / 60 / 60).toFixed(2)),
            remainingHours: parseFloat(this.remainingHours),
            userId: this.currentUser.id,
            taskId: this.taskId,
            title: this.title,
          })
          .then((res) => {
            this.stopT();
            this.getTasks();
            this.title = null;
            this.remainingHours = null;
            this.$refs['stop-watch-modal'].hide()
            this.$toast.success("Log successfully added", {
              duration: 3000,
            });
          })
          .catch((reason) => {
            this.$toast.error(
              "An error has occurred, while adding the log",
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
.card{
  background: #28a745;
  color: white;
  padding: 2rem;
  margin-bottom: 1rem;
  border: none;
  border-radius: 25px;
}
</style>
