export default {
  methods: {
    getUserInitials(user) {
      if (!user) return null;
      const { firstname, lastname } = user;
      if (!firstname && !lastname) return null;
      else if (!firstname) return lastname[0];
      else if (!lastname) return firstname[0];
      else return `${firstname[0]}${lastname[0]}`;
    },
  },
};