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
      console.log("Found old timer interval creating new one")
      clearInterval(this.timerInterval);
      this.startTime = Date.parse(localStorage.getItem("loggerStartTime"));

      this.timer = setInterval(() => {
        var timeNow = new Date();
        this.time = Math.floor(((timeNow - this.startTime)/1000));
        this.$store.commit("user/setTimerInterval", this.timer);
        console.log("New one made and saved ")
       }, 1000);
      
    }
    /*
    if(localStorage.getItem("loggerActive") === 'true'){
        console.log("killing old interval that was"+this.timerInterval);
        clearInterval(this.timerInterval);
        console.log("dead old interval that is"+this.timerInterval);
        this.startTime = Date.parse(localStorage.getItem("loggerStartTime"));
        console.log("old start time is : "+this.startTime);

        
        for (var i = 1; i < 99999; i++)
            window.clearInterval(i);


        
        this.timer = setInterval(() => {
        var timeNow = new Date();
        this.time = Math.floor(((timeNow - this.startTime)/1000));
        console.log("time now is "+timeNow);
        console.log("start time is "+this.startTime );
        console.log("calculation "+(timeNow - this.startTime));
        this.$store.commit("user/setTimerInterval", this.timer);
        }, 1000);

      
    }else{
      console.log("Did not get old timer "+localStorage.getItem("loggerActive"));
      console.log("Global time interval is "+this.timerInterval)
    }*/
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
      console.log("Clearing global timer"+this.timerInterval) 
      clearInterval(this.timerInterval);

      console.log("Setting localstorage logger status")
      localStorage.setItem("loggerActive", this.running);

      
      if (this.restWhenStop) this.resetT();
    },
    startT: function() {
      console.log("Setting localstorage logger status")
      localStorage.setItem("loggerActive", this.running);
      //localStorage.setItem("taskId", this.logger.taskId);

      if (this.resetWhenStart) this.resetT();
      this.startTime = new Date();
      localStorage.setItem("loggerStartTime", this.startTime);

      console.log("Creating new timer interval")
      this.timer = setInterval(() => {
        var timeNow = new Date();
        console.log("Saving interval "+this.timer)
        this.$store.commit("user/setTimerInterval", this.timer);
        this.time = Math.floor(((timeNow - this.startTime)/1000));
        }, 1000);

      
    },
    resetT: function() {
      console.log("rest")
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
