export default function ({ store, route }) {
  const path = route.fullPath;
  store.commit("route-id/setProjectId", parsePathId(projectIdRegex, path))
  store.commit("route-id/setStoryId", parsePathId(storyIdRegex, path))
  store.commit("route-id/setSprintId", parsePathId(sprintIdRegex, path))
}

const projectIdRegex = /^\/projects\/([0-9]+)/;
const storyIdRegex = /^\/projects\/[0-9]+\/stories\/([0-9]+)/;
const sprintIdRegex = /^\/projects\/[0-9]+\/sprints\/([0-9]+)/;

/**
 * The regex must be formulated so that the first group (encapsulated in parentheses) is the id we are looking for
 * @param {*} re - regex pattern
 * @param {*} path - route path string so search for
 * @returns id or null
 */
const parsePathId = (re, path) => {
  const match = path.match(re);
  return match ? +match[1] : null;
}