<template>
  <div>
    <p>{{ time | secondsInMinutes }}</p>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
var moment = require("moment");

export default {
  name: "stopwatch",
  props: {
    running: {
      type: Boolean,
      default: false
    },
    resetWhenStart: {
      type: Boolean,
      default: false
    },
    restWhenStop: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters({
      timerInterval: "user/getTimerInterval",
    }),
  },
  watch: {
    running: function(newVal, oldVal) {
      if (newVal) this.startT();
      else this.stopT();
    }
  },
  mounted() {
    if(this.timerInterval !== null){
      clearInterval(this.timerInterval);
      this.startTime = Date.parse(localStorage.getItem("loggerStartTime"));

      this.timer = setInterval(() => {
        var timeNow = new Date();
        this.time = Math.floor(((timeNow - this.startTime)/1000));
        this.$store.commit("user/setTimerInterval", this.timer);
        localStorage.setItem("timerInterval", this.timer);
       }, 1000);
      
    }else if(localStorage.getItem("timerInterval") !== null){
      clearInterval(this.timerInterval);
      this.startTime = Date.parse(localStorage.getItem("loggerStartTime"));

      this.timer = setInterval(() => {
        var timeNow = new Date();
        this.time = Math.floor(((timeNow - this.startTime)/1000));
        this.$store.commit("user/setTimerInterval", this.timer);
        localStorage.setItem("timerInterval", this.timer);
       }, 1000);

    }
  },
  data() {
    return { 
      startTime: null,
      timeNow: null,
      time: 0, 
      timer: null 
    };
  },
  methods: {
    stopT: function() {
      clearInterval(this.timerInterval);

      localStorage.setItem("loggerActive", this.running);


      if (this.restWhenStop) this.resetT();
    },
    startT: function() {
      localStorage.setItem("loggerActive", this.running);
      //localStorage.setItem("taskId", this.logger.taskId);

      if (this.resetWhenStart) this.resetT();
      this.startTime = new Date();
      localStorage.setItem("loggerStartTime", this.startTime);

      this.timer = setInterval(() => {
        var timeNow = new Date();
        this.$store.commit("user/setTimerInterval", this.timer);
        localStorage.setItem("timerInterval", this.timer);
        this.time = Math.floor(((timeNow - this.startTime)/1000));
        }, 1000);

      
    },
    resetT: function() {
      this.resetStorage();
      this.startTime = 0;
      this.startTime = 0;
      this.currentTask = null;
      this.time = 0;
    },
    resetStorage: function() {
      localStorage.removeItem("loggerTimer");
      localStorage.removeItem("loggerStartTime");
      localStorage.removeItem("loggerTime");
      localStorage.removeItem("taskId");
    }
  },
  filters: {
    secondsInMinutes: function(seconds) {
      return moment("2015-01-01")
        .startOf("day")
        .seconds(seconds)
        .format("HH:mm:ss");
    },
  }
};
</script>

<style scoped>
p {
  font-weight: bold;
  font-size: x-large;
}
</style>
