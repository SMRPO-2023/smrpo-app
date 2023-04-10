export default {
  data() {
    return {
      priorities: [
        {
          text: "Must have",
          value: "MUST_HAVE",
        },
        {
          text: "Should have",
          value: "SHOULD_HAVE",
        },
        {
          text: "Could have",
          value: "COULD_HAVE",
        },
        {
          text: "Won't have",
          value: "WONT_HAVE",
        },
      ],
    };
  },
  methods: {
    getVariantForPriority(priority) {
      switch (priority) {
        case "MUST_HAVE":
          return "danger";
        case "SHOULD_HAVE":
          return "warning";
        case "COULD_HAVE":
          return "primary";
        case "WONT_HAVE":
          return "dark";
        default:
          return "light";
      }
    },
    getNameForPriority(priority) {
      return this.priorities.find((p) => p.value === priority).text;
    },
    getVariantForImplemented(implemented) {
      return implemented ? "success" : "danger";
    },
    getVariantForTaskStatus(status) {
      if (status === 'ACCEPTED') return "primary"; // task has been accepted
      else if (status === 'ASSIGNED') return "info"; // task has been assigned to someone
      else if (status === 'FINISHED') return "success"; // task has been finished
      else "secondary"; // task is not assigned to anyone
    },
    getNameForImplemented(implemented) {
      return implemented ? "Yes" : "No";
    },
    getLongNameForImplemented(implemented) {
      return implemented ? "Accepted" : "Not accepted";
    },
  },
};
