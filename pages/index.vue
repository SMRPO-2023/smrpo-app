<template>
  <b-container>
    <b-row class="my-2">
      Hello world
    </b-row>
  </b-container>
</template>

<script>

export default {
  middleware: 'redirect-to-home',
}
</script>

<style lang="scss">
@import '../node_modules/bootstrap/scss/functions';
@import '../node_modules/bootstrap/scss/variables';
@import '../node_modules/bootstrap/scss/mixins';
// button styles
.btn-icon {
  cursor: pointer;

  &:focus, &:active {
    border-radius: 50%;
    border-color: #0062cc;
    box-shadow: 0 0 0 0.2rem rgba(38, 143, 255, 0.5);
  }
}

// table styles
.center-and-clickable {
  vertical-align: middle !important;
  text-align: center;
  cursor: pointer;
}

tbody > tr:hover > td > a {
  text-decoration: underline;
}

td > a {
  color: black !important;
}

.no-break, th {
  white-space: nowrap;
}

/* must not be scoped */
// is used when we want to use only an icon as dropdown toggle
.simple-dropdown-btn {
  padding: 0 !important;
  color: initial !important;
}
</style>
