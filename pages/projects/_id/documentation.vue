<template>
    <div>
        <h1>Documentation</h1>
        <div class="d-flex justify-content-end"><b-button  to="documentation-edit" style=" background: transparent; color:gray; border:none;"><h3><b-icon icon="pencil-fill"></b-icon></h3> </b-button></div>
        <hr>
        <div v-html="markdownToHtml"> </div>
    </div>
</template>

<script>
import { marked } from 'marked';
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      markdown: "# Hellow world",
      project: null,
    }
  },
  computed: {
    ...mapGetters({
      currentUser: "user/getUser",
      projectId: "route-id/getProjectId",
    }),
    markdownToHtml() {
      return marked(this.markdown);
    }
  },
  mounted(){
    this.getProject();
  },
  methods: {
    async getProject() {
      this.$axios
        .$get(`/project/${this.projectId}`)
        .then((res) => {
          this.project = res;
          this.markdown = this.project.documentation ?? '';
        })
        .catch((reason) => {
          console.error(reason);
          this.$toast.error("An error has occurred, while getting project.", {
            duration: 3000,
          });
        });
    },
  }
}
</script>