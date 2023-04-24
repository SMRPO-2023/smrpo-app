<template>
  <div>
    <h1>View project</h1>
    <br />

    <p>
      <span class="title">Title:</span> <span>{{ form.title }}</span>
    </p>
    <p>
      <span class="title">Description:</span>
    </p>
    <p style="white-space: pre-line">{{ form.description }}</p>
    <p>
      <span class="title">Product owner:</span>
      <span
        >{{ form.projectOwnerUsername }}
        <span v-if="form.projectOwnerUsername == null"> / </span></span
      >
    </p>
    <p>
      <span class="title">Scrum master:</span>
      <span
        >{{ form.scrumMasterUsername }}
        <span v-if="form.scrumMasterUsername == null"> / </span></span
      >
    </p>
    <div v-if="isAdmin">
      <p>
        <span class="title">Developers</span>
      </p>
      <div>
        <b-card-group 
          v-if="projectDevelopers.length" 
          columns
        >
          <b-card
            v-for="developer of projectDevelopers"
            :key="developer.id"
            class="p-3"
            no-body
          >
            <div class="d-flex align-items-center">
              <b-avatar 
                :text="getUserInitials(developer.user)" 
                size="sm" 
                class="mr-2"
              ></b-avatar>
              <b-card-text>
                {{ developer.user.username }}
              </b-card-text>
            </div>
          </b-card>
        </b-card-group>
        <div v-else class="text-muted">No members</div>
      </div>
    </div>
  </div>
</template>

<script>
import { BIcon } from "bootstrap-vue";
import { mapGetters } from "vuex";
import avatar from "@/mixins/avatar";

export default {
  name: "view-project",
  components: {
    BIcon,
  },
  mixins: [avatar],
  data() {
    return {
      id: null,
      error: null,
      responseErrors: [],
      // user: null,
      users: [],
      allUsers: [],
      projectDevelopers: [],
      passwordType: "password",
      form: {
        title: null,
        description: null,
        projectOwner: null,
        projectOwnerUsername: null,
        scrumMaster: null,
        scrumMasterUsername: null,
      },
    };
  },
  computed: {
    ...mapGetters({
      user: "user/getUser",
      isAdmin: "user/isAdmin",
      isNormalUser: "user/isNormalUser",
    }),
  },
  async mounted() {
    this.id = this.$route.params.id;
    if (!this.id) return;
    this.getProject();
  },
  methods: {
    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    },
    async getProject() {
      this.$axios
        .$get(`project/${this.id}`)
        .then((res) => {
          // this.user = res;
          // if (!res) return;

          this.form.title = res?.title;
          this.form.description = res?.description;
          if (res?.projectOwner !== null) {
            this.form.projectOwner = res?.projectOwner;
            this.form.projectOwnerUsername = res?.projectOwner.username;
          }
          if (res?.scrumMaster !== null) {
            this.form.scrumMaster = res?.scrumMaster;
            this.form.scrumMasterUsername = res?.scrumMaster.username;
          }
          this.projectDevelopers = res?.developers;
        })
        .catch((reason) => {
          console.error(reason);
          this.$toast.error(
            "An error has occurred, while getting project information",
            {
              duration: 3000,
            }
          );
        });
    },
  },
};
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
span {
  white-space: nowrap;
}
</style>
