export default {
  data() {
    return {
      roles: [
        {
          text: "Administrator",
          value: "ADMIN",
        },
        {
          text: "User",
          value: "USER",
        },
      ],
    };
  },
  methods: {
    getVariantForRole(role) {
      switch (role) {
        case "ADMIN":
          return "warning";
        case "USER":
          return "info";
        default:
          return "light";
      }
    },
    getNameForRole(role) {
      return this.roles.find((r) => r.value === role).text;
    },
    getVariantForProjectRole(isProductOwner, isScrumMaster, isDeveloper, isAdmin, darkTheme = false) {
      if (isProductOwner) {
        return "warning";
      } else if (isScrumMaster) {
        return "primary";
      } else if (isDeveloper) {
        return darkTheme ? "light" : "dark";
      } else if (isAdmin) {
        return "danger";
      } else {
        return "secondary";
      }
    },
    getNameForProjectRole(isProductOwner, isScrumMaster, isDeveloper, isAdmin) {
      if (isProductOwner) {
        return "Product Owner";
      } else if (isScrumMaster) {
        return "Scrum Master";
      } else if (isDeveloper) {
        return "Developer";
      } else if (isAdmin) {
        return "Admin";
      } else {
        return "Unknown";
      }
    },
  },
};
