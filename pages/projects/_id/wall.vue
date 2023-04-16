<template>
  <div>
    <h1>Project wall</h1>
    
    <!-- New post -->
    <div class="mt-4 mb-5">
      <b-row>
        <!-- User avatar -->
        <b-col cols="auto" class="pr-0">
          <b-avatar :text="getUserInitials(this.currentUser)" variant="dark"></b-avatar>
        </b-col>

        <!-- Form -->
        <b-col>
          <ValidationObserver ref="form" v-slot="{ handleSubmit }">
            <b-form @submit.stop.prevent="handleSubmit(onSubmit)">
              <!-- Message -->
              <ValidationProvider
                name="post"
                :rules="{ required: true }"
                v-slot="v"
                class="flex-grow-1"
              >
                <b-form-group class="mb-0">
                  <b-form-textarea
                    id="post"
                    placeholder="What's on your mind?"
                    v-model="form.message"
                    :state="getValidationState(v)"
                    aria-describedby="post-live-feedback"
                  />
                  <b-form-invalid-feedback id="post-live-feedback" class="mb-0"
                    >{{ v.errors[0] }}
                  </b-form-invalid-feedback>
                </b-form-group>
              </ValidationProvider>
      
              <div class="d-flex justify-content-end mt-3">
                <b-button type="submit" variant="primary">
                  Post
                </b-button>
              </div>
            </b-form>
          </ValidationObserver>
        </b-col>
      </b-row>
    </div>

    <!-- Posts -->
    <template v-if="posts.length">
      <b-card v-for="post of posts" :key="post.id" class="mb-3">
        <!-- Header -->
        <div class="d-flex">
          <b-avatar :text="getUserInitials(post.user)" size="3rem" class="mr-3"></b-avatar>
          <div class="d-flex flex-column justify-content-between">
            <div class="d-flex align-items-center">
              <span class="mr-2">{{ post.user.firstname }} {{ post.user.lastname }}</span>
              <b-badge :variant="getVariantForPostUserProjectRole(post)">
                {{ getNameForPostUserProjectRole(post) }}
              </b-badge>
            </div>
            <span class="text-muted">{{ formatDateTimeFull(post.createdAt) }}</span>
          </div>
        </div>
        <!-- Body -->
        <div class="mt-3">
          <p class="clamp mb-0">{{ post.message }}</p>
        </div>
      </b-card>
    </template>
    <template v-else>
      <div class="w-100 text-center text-muted">
        There are no posts yet.
      </div>
    </template>
  </div>
</template>

<script>
import { BIcon } from "bootstrap-vue";
import { mapGetters } from "vuex";
import datetime from "@/mixins/datetime";
import roles from "@/mixins/roles";

export default {
  name: "project-wall",
  components: {
    BIcon,
  },
  mixins: [datetime, roles],
  computed: {
    ...mapGetters({
      currentUser: "user/getUser",
      isAdmin: "user/isAdmin",
      projectId: "route-id/getProjectId",
    }),
  },
  data() {
    return {
      posts: [],
      error: null,
      responseErrors: [],
      form: {
        message: "",
      },
    };
  },
  mounted() {
    this.getPosts();
  },
  methods: {
    getVariantForPostUserProjectRole(post) {
      if (!post) return null;
      const { user, Project } = post;
      return this.getVariantForProjectRole(
        this.isUserAProductOwner(user, Project),
        this.isUserAScrumMaster(user, Project),
        this.isUserADeveloper(user, Project),
        this.isUserAnAdmin(user)
      );
    },
    getNameForPostUserProjectRole(post) {
      if (!post) return null;
      const { user, Project } = post;
      return this.getNameForProjectRole(
        this.isUserAProductOwner(user, Project),
        this.isUserAScrumMaster(user, Project),
        this.isUserADeveloper(user, Project),
        this.isUserAnAdmin(user)
      );
    },
    isUserAnAdmin(user) {
      if (!user) return false;
      return user.role === "ADMIN";
    },
    isUserAProductOwner(user, project) {
      if (!user || !project) return false;
      return user.id === project.projectOwnerId;
    },
    isUserAScrumMaster(user, project) {
      if (!user || !project) return false;
      return user.id === project.scrumMasterId;
    },
    isUserADeveloper(user, project) {
      if (!user || !project) return false;
      return project.developers.find((u) => u.userId === user.id);
    },
    getUserInitials(user) {
      if (!user) return null;
      const { firstname, lastname } = user;
      const first = firstname || "";
      const last = lastname || "";
      return `${first[0]}${last[0]}`;
    },
    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    },
    async onSubmit() {
      if (!this.projectId) return;

      try {
        // TODO: remove unnecessary fields when updated on backend
        const res = await this.$axios.$post("posts", {
          title: "/",
          content: "/",
          published: true,
          message: this.form.message,
          projectId: this.projectId,
        });
        if (res) {
          // reset form
          this.$refs.form.reset();
          this.form.message = "";
          this.$toast.success("Post created successfully", { duration: 3000, });
          // fetch posts
          this.getPosts();
        }
      } catch (error) {
        const status = error?.response?.status;
        const data = error?.response?.data;
        // some instances of errors return main message along with array of detailed shorter messages
        if (status && status === 400) {
          if (data && data.message instanceof Array) {
            this.responseErrors = data.message;
          }
          this.error = "Wrong input, while creating your post";
        } else {
          this.error = data?.message;
        }
        this.$toast.error("An error has occurred, while creating your post", {
          duration: 3000,
        });
      }
    },
    async getPosts() {
      if (!this.projectId) return;
      try {
        const res = await this.$axios.get(`/posts`, {
          params: {
            "pid": this.projectId,
          },
        });
        this.posts = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } catch (error) {
        console.error(error);
        this.$toast.error("An error has occurred, while getting posts", { duration: 3000, });
      }
    },
  },
}
</script>

<style scoped>
.clamp {
  white-space: pre-line;
  /* display: -webkit-box;
  -webkit-line-clamp: 6;
  -webkit-box-orient: vertical;
  overflow: hidden; */
}
</style>