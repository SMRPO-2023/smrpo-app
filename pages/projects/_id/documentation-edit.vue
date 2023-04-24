<template>
    <div>
        <h1>Edit documentation</h1>
        <div class="d-flex justify-content-end mb-3"><b-button @click="updateDocumentation()">Save</b-button></div>
            <b-form-textarea
            id="documentation"
            placeholder="Enter documentation"
            v-model="markdown"
            />
        
    </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      markdown: " Hellow world"
    }
  },
  computed: {
    ...mapGetters({
      currentUser: "user/getUser",
      projectId: "route-id/getProjectId",
    })
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
          this.markdown = this.project.documentation;
        })
        .catch((reason) => {
          console.error(reason);
          this.$toast.error("An error has occurred, while getting project.", {
            duration: 3000,
          });
        });
    },
    async updateDocumentation() {
      if (!this.projectId) return;

      await this.$axios
        .$put(`project/update-documentation/${this.projectId}`, {
          documentation: this.markdown,
        })
        .then(async (res) => {
          this.error = null;
          this.responseErrors = [];
          this.$toast.success("Project documentation successfully updated", {
            duration: 3000,
          });
        })
        .catch((error) => {
          const status = error?.response?.status;
          const data = error?.response?.data;
          this.$toast.error(
            "An error has occurred, while updating the project documentation",
            {
              duration: 3000,
            }
          );
        });
    },
    }
}
  
</script>