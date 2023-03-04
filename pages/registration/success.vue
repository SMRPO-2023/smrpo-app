<template>
  <b-container>
    <b-row>
      <b-col offset-md="3" md="6" cols="12" class="my-3">
        <div class="text-center">
          <h1>Registracija uspešna!</h1>
          <div>Preusmerjam v aplikacjio v {{ time }} sekundah.</div>
        </div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
export default {
  name: "verify",
  data() {
    return {
      time: 3,
      timer : null,
    }
  },
  created() {
    setTimeout(() => {
      this.$router.push("/");
    }, this.time * 1000);
    this.timer = setInterval(() => this.time--, 1000)
  },
  beforeDestroy(){
    clearInterval(this.timer)
  }
}
</script>

<style scoped>

</style>
