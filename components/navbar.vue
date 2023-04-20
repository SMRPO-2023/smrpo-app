<template>
  <b-navbar toggleable="md" type="dark" variant="dark" class="fixed-top">
    <nuxt-link class="navbar-brand py-0" href="/" :to="`/`">
      <div class="d-flex justify-content-center align-content-center">
        <div class="ml-3" style="line-height: 2.25rem">SMRPO Project</div>
      </div>
    </nuxt-link>

    <b-navbar-toggle v-if="user" target="nav-collapse"></b-navbar-toggle>

    <b-collapse v-if="user" id="nav-collapse" is-nav>
      <b-navbar-nav>
        <b-nav-item v-if="isAdmin" :to="'/admin/users'">Users</b-nav-item>
        <b-nav-item :to="'/projects'">Projects</b-nav-item>
      </b-navbar-nav>

      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
        <!-- user project role status -->
        <b-badge
          v-if="this.projectId && this.project"
          class="align-self-center"
          :variant="getVariantForProjectRole(isProductOwner, isScrumMaster, isDeveloper, isAdmin, true)"
        >
          {{ getNameForProjectRole(isProductOwner, isScrumMaster, isDeveloper, isAdmin) }}
        </b-badge>

        <!-- user dropdown -->
        <b-nav-item-dropdown right>
          <template #button-content>
            <em>{{ user.firstname }} {{ user.lastname }}</em>
          </template>
          <b-dropdown-item :to="`/profile`">Profile</b-dropdown-item>
          <b-dropdown-item @click="logout">Logout</b-dropdown-item>
          <b-dropdown-divider></b-dropdown-divider>
          <b-dropdown-text style="width: 240px"
            ><small v-if="firstLogin != null"
              >Last login: <b>{{ formatDateTime(firstLogin) }}</b></small
            >
            <small v-else
              ><b>This is your first login</b></small
            ></b-dropdown-text
          >
        </b-nav-item-dropdown>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
import datetime from "@/mixins/datetime";
import roles from "@/mixins/roles";
import { mapActions, mapGetters } from "vuex";

export default {
  name: "navbar",
  mixins: [datetime, roles],
  async mounted() {
    // get logged in user
    const userId = localStorage.getItem("userId");
    const accessToken = localStorage.getItem("jwt");
    if (userId && accessToken) {
      await this.$store.dispatch("user/fetchUser", userId);
    }
  },
  computed: {
    ...mapGetters({
      user: "user/getUser",
      firstLogin: "user/getLastLogin",
      isAdmin: "user/isAdmin",
      isNormalUser: "user/isNormalUser",
      projectId: "route-id/getProjectId",
    }),
    ...mapActions(["user/unsetUser", "user/fetchUser"]),
    isProductOwner() {
      if (!this.user || !this.project) return false;
      return this.user.id === this.project.projectOwnerId;
    },
    isScrumMaster() {
      if (!this.user || !this.project) return false;
      return this.user.id === this.project.scrumMasterId;
    },
    isDeveloper() {
      if (!this.user || !this.project) return false;
      return !!this.project.developers.find((u) => u.user.id === this.user.id);
    },
  },
  data() {
    return {
      project: null,
    };
  },
  created() {
    this.getProject();
  },
  methods: {
    async logout() {
      localStorage.removeItem("jwt");
      localStorage.removeItem("userId");
      await this.$store.dispatch("user/unsetUser");
      await this.$router.replace("/login");
    },
    async getProject() {
      if (!this.projectId) return;

      await this.$axios.$get(`project/${this.projectId}`).then((res) => {
        if (!res) return;
        this.project = res;
      });
    },
  },
};
</script>

<style lang="scss" scoped></style>
