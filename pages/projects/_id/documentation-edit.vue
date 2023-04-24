<template>
    <div>
        <h1><back-btn /> Edit documentation</h1>
        
        <div class="d-flex justify-content-end mb-3">
            <b-button class="mr-3" @click="updateDocumentation()">Save</b-button>
            <b-button @click="downloadDocumentation()"><h4><b-icon icon="download"></b-icon></h4></b-button>
        </div>
            <b-form-textarea
            id="documentation"
            placeholder="Enter documentation"
            v-model="markdown"
            />
        <div class="d-flex justify-content-end mt-3">
        <form>
            <div class="input_container">
                <input type="file" @change="onFileChange">
            </div>
        </form>
        </div>
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
    onFileChange(e){
        const files = event.target.files
        const fileReader = new FileReader()
        fileReader.addEventListener(
            "load",
            () => {
            // this will then display a text file
            this.markdown = fileReader.result;
            },
            false
        );

        if (files[0]) {
            fileReader.readAsText(files[0]);
        }
        
    },
    downloadDocumentation(){
        let text = (this.markdown);
        let filename = 'documentation.md';
        let element = document.createElement('a');
        element.setAttribute('href', 'data:application/md;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();
        document.body.removeChild(element);  
    },
    async getProject() {
      this.$axios
        .$get(`/project/${this.projectId}`)
        .then((res) => {
          this.project = res;
          this.markdown = this.project.documentation  ?? '';
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

<style scoped>
textarea {
  height: 300px;
}
.input_container {
  border: 1px solid #e5e5e5;
}

input[type=file]::file-selector-button {
  background-color: #fff;
  color: #000;
  border: 0px;
  border-right: 1px solid #e5e5e5;
  padding: 10px 15px;
  margin-right: 20px;
  transition: .5s;
}

input[type=file]::file-selector-button:hover {
  background-color: #eee;
  border: 0px;
  border-right: 1px solid #e5e5e5;
}
</style>