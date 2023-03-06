<template>
  <b-container fluid>
    <b-row>
      <b-col offset-lg="2" lg="8" cols="12" class="my-3">
        <div class="d-flex justify-content-between align-items-center">
            <h1>Uporabniki</h1>
            <b-button variant="primary" href="users/create" class="d-flex flex-column justify-content-center">Ustvari</b-button>
        </div>
        <table class="table table-hover mt-3 w-100">
          <thead>
          <tr>
            <th scope="col">Ime</th>
            <th scope="col">Email</th>
            <th scope="col">Vloga</th>
            <th scope="col" class="d-none">Akcije</th>
          </tr>
          </thead>
          <tbody>
          <tr
            v-for="user of users"
            :key="user._id"
          >
            <td>{{ user.firstname }} {{ user.lastname }}</td>
            <td>{{ user.email }}</td>
            <td>
              <b-dropdown
                id="dropdown-right"
                size="sm"
                right
                :text="getNameForRole(user.role)"
                :variant="getVariantForRole(user.role)"
              >
                <b-dropdown-item
                  v-for="role of roles"
                  :value="role.value"
                  :key="role.value"
                  @click="updateRole(user, role)"
                >
                  {{ role.text }}
                </b-dropdown-item>
              </b-dropdown>
            </td>
            <td class="d-none">Akcije</td>
          </tr>
          </tbody>
        </table>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import roles from "@/mixins/roles";

export default {
  name: "users",
  mixins: [roles],
  data() {
    return {
      users: [],
    }
  },
  async created() {
    await this.getUsers();
  },
  methods: {
    async getUsers() {
      this.$axios.$get('admin/users')
      .then(res => {
        this.users = res;
      })
      .catch(reason => {
        console.error(reason)
        this.$toast.error('Napaka pri pridobivanju uporabnikov', { duration: 3000 });
      })
    },
    updateRole(user, role) {
      this.$axios.$put(`admin/users/${user.id}/role`, { role: role.value })
        .then(res => {
          for (const user of this.users) {
            if (user.id === res.id) {
              user.role = res.role
              return;
            }
          }
        })
        .catch(reason => {
          console.error(reason)
          this.$toast.error('Napaka pri pridobivanju uporabnikov', { duration: 3000 });
        })
    }
  }
}
</script>

<style scoped>

</style>
