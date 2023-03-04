export default {
  data() {
    return {
      roles: [
        {
          text: "Administrator",
          value: "ADMIN"
        },
        {
          text: "Uporabnik",
          value: "USER"
        },
      ],
    }
  },
  methods: {
    getVariantForRole(role) {
      switch(role) {
        case 'ADMIN':
          return 'warning'
        case 'USER':
          return 'info'
        default:
          return 'light'
      }
    },
    getNameForRole(role) {
      return this.roles.find(r => r.value === role).text
    },
  }
}
