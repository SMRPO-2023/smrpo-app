export const state = () => ({
  projectId: null,
  storyId: null,
  sprintId: null,
});

export const mutations = {
  setProjectId(state, id) {
    state.projectId = +id
  },
  setStoryId(state, id) {
    state.storyId = +id
  },
  setSprintId(state, id) {
    state.sprintId = +id
  },
}

export const getters = {
  getProjectId(state) {
    return state.projectId
  },
  getStoryId(state) {
    return state.storyId
  },
  getSprintId(state) {
    return state.sprintId
  },
}