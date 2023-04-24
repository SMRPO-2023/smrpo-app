export const state = () => ({
  token: null,
  user: null,
  lastLogin: null,
  timerInterval: null,
});

export const mutations = {
  setToken(state, value) {
    state.token = value;
  },
  setUser(state, value) {
    state.user = value;
  },
  setLastLogin(state, value) {
    state.lastLogin = value;
  },
  setTimerInterval(state, value) {
    state.timerInterval = value;
  },
  unsetUser(state, value) {
    state.user = null;
  },
  unsetToken(state, value) {
    state.user = null;
  },
  unsetLastLogin(state) {},
  unsetTimerInterval(state) {
    state.timerInterval = null;
  },
};

export const getters = {
  getTimerInterval(state) {
    return state.timerInterval;
  },
  getUser(state) {
    return state.user;
  },
  getLastLogin(state) {
    return state.lastLogin;
  },
  isAdmin(state) {
    if (!state.user) return false;
    return state.user.role === "ADMIN";
  },
  isNormalUser(state) {
    if (!state.user) return false;
    return state.user.role === "USER";
  },
};

export const actions = {
  async fetchUser({ commit }, userId) {
    await this.$axios
      .$get(`/users/me`)
      .then((res) => {
        commit("setUser", res);
      })
      .catch((res) => {
        commit("set", null);
      });
  },
  unsetUser({ commit }) {
    commit("unsetUser");
    commit("unsetToken");
  },
};
