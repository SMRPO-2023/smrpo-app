<template>
  <div>
    <h1>View sprint <b-badge :variant="getVariantForSprintStatus(sprint)">{{ getNameForSprintStatus(sprint) }}</b-badge></h1>



    <br />

    <p>
      <span class="title">Name:</span> <span>{{ name }}</span>
    </p>
    <p>
      <span class="title">Start date:</span>
      <span>{{ formatDate(start) }}</span>
    </p>
    <p>
      <span class="title">End date:</span>
      <span>{{ formatDate(end) }}</span>
    </p>
    <p>
      <span class="title">Velocity:</span> <span>{{ velocity }}</span>
    </p>
    <div>
      <!---------------------  Unrealized stories  ------------------------------------>
      <div>
      <h2 class="pt-3">Stories in <span v-if="isSprintActive(sprint)">the current</span> sprint</h2>

      <div class="table-responsive">
        <table class="table table-hover mt-3">
          <thead>
            <tr>
              <th scope="col">Title</th>
              <th scope="col">Description</th>
              <th scope="col" v-html="'Business <br> value'"></th>
              <th scope="col">Priority</th>
              <th scope="col">Acceptance test</th>
              <th scope="col">Points</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody v-if="unrealizedStories.length">
            <tr v-for="story of unrealizedStories" :key="story.id">
              <td>
                <nuxt-link :to="{ path: `/projects/${story.projectId}/stories/${story.id}` }">
                  #{{ story.id }} - {{ story.title }}
                </nuxt-link>
              </td>
              <td>{{ story.description | limit(100) }}</td>
              <td>{{ story.businessValue }}</td>

              <td>
                <b-button
                  id="dropdown-right"
                  right
                  :variant="getVariantForPriority(story.priority)"
                >
                  {{ getNameForPriority(story.priority) }}
                </b-button>
              </td>

              <td>{{ story.acceptanceCriteria | limit(100) }}</td>
              <td>{{ story.points }}</td>
              <td>
                <b-input-group size="lg" style="font-size: 12px">
                  <p class="h3">
                    <b-button
                      v-b-tooltip.hover title="Accept this story"
                      v-if="isProductOwner()"
                      variant="success"
                      :disabled=!story.canBeAccepted
                      @click="acceptPrompt(story.id)"
                      class="center-and-clickable"
                    >Accept</b-button>
                  </p>
                  <p class="h3">
                    <b-button
                    v-b-tooltip.hover title="Reject this story"
                      v-if="isProductOwner()"
                      variant="danger"
                      @click="rejectPrompt(story.id)"
                      class="center-and-clickable"
                    >Reject</b-button>
                  </p>
                </b-input-group>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td class="text-muted text-center" colspan="7">
                No stories in this sprint yet
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      </div>
      <!---------------------  Unrealized stories  ------------------------------------>
      <br>

      <!---------------------  Realized stories  ------------------------------------>
      <div v-if="isSprintActive(sprint)">
      <h2
        @click="realizedToggle = !realizedToggle"
        class="pt-3 cursor-pointer">
        <span>Finished stories in sprint</span>
        <b-icon
          :icon="realizedToggle ? 'caret-up-fill' : 'caret-down-fill'"
          font-scale="0.75"
        ></b-icon>
      </h2>
      <b-collapse id="collapse-realized" class="mt-2" v-model="realizedToggle">
      <div class="table-responsive">
        <table class="table table-hover mt-3">
          <thead>
            <tr>
              <th scope="col">Title</th>
              <th scope="col">Description</th>
              <th scope="col" v-html="'Business <br> value'"></th>
              <th scope="col">Priority</th>
              <th scope="col">Acceptance test</th>
              <th scope="col">Points</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody v-if="realizedStories.length">
            <tr v-for="story of realizedStories" :key="story.id">
              <td>
                <nuxt-link :to="{ path: `/projects/${story.projectId}/stories/${story.id}` }">
                  #{{ story.id }} - {{ story.title }}
                </nuxt-link>
              </td>
              <td>{{ story.description | limit(100) }}</td>
              <td>{{ story.businessValue }}</td>

              <td>
                <b-button
                  id="dropdown-right"
                  right
                  :variant="getVariantForPriority(story.priority)"
                >
                  {{ getNameForPriority(story.priority) }}
                </b-button>
              </td>

              <td>{{ story.acceptanceCriteria | limit(100) }}</td>
              <td>{{ story.points }}</td>
              <td>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td class="text-muted text-center" colspan="7">
                No stories in this sprint yet
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      </b-collapse>
      <hr>
      <h4 class="d-flex justify-content-end mr-5">Sum : {{currentLoad}} / {{ velocity }}</h4>
      </div>
      <!---------------------  Realized stories  ------------------------------------>


      <!---------------------  Adding stories  ------------------------------------>
      <div v-if="isScrumMaster() && isSprintActive(sprint)">

        <h2 class="pt-3">Stories</h2>

        <div class="table-responsive">
          <table class="table table-hover mt-3">
            <thead>
              <tr>
                <th scope="col">Title</th>
                <th scope="col">Description</th>
                <th scope="col" v-html="'Business <br> value'"></th>
                <th scope="col">Priority</th>
                <th scope="col">Acceptance test</th>
                <th scope="col">Points</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody v-if="addableStories.length">
              <tr v-for="story of addableStories" :key="story.id">
                <td>
                  <nuxt-link :to="{ path: `/projects/${story.projectId}/stories/${story.id}` }">
                    #{{ story.id }} - {{ story.title }}
                  </nuxt-link>
                  <b-icon v-if="story?.comments.length" icon="exclamation-circle-fill" variant="danger"/>
                </td>
                <td>{{ story.description | limit(100) }}</td>
                <td>{{ story.businessValue }}</td>
                <td>
                  <b-button
                    id="dropdown-right"
                    right
                    :variant="getVariantForPriority(story.priority)"
                  >
                    {{ getNameForPriority(story.priority) }}
                  </b-button>
                </td>

                <td>{{ story.acceptanceCriteria | limit(100) }}</td>
                <td>{{ story.points }}</td>
                <td>
                  <b-input-group v-b-tooltip.hover title="Move story to sprint" size="lg" style="font-size: 12px" v-if="canBeAdded(story.points)">
                    <p class="h3">
                      <b-icon
                        icon="arrow-up-circle"
                        @click="moveToSprint(story.id)"
                        class="center-and-clickable"
                      ></b-icon>
                    </p>
                  </b-input-group>
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr>
                <td class="text-muted text-center" colspan="7">
                  No more addable stories left
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <!---------------------  Adding stories  ------------------------------------>
    </div>
    <!---------------------  Model reject  ------------------------------------>
    <b-modal ref="reject-modal" id="reject-modal" hide-footer>
      <template #modal-title>Reject</template>
      <div class="d-block d-flex pb-3">
        Please submit a reason for the rejection.
      </div>

      <!-- Comment form -->
      <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
        <b-form @submit.stop.prevent="handleSubmit(removeFromSprint)">
          <ValidationProvider
            name="comment"
            :rules="{ required: true }"
            v-slot="v"
          >
            <b-form-group label="" label-for="">
              <b-form-textarea
                  id="comment"
                  placeholder="Enter comment"
                  v-model="comment"
                  :state="getValidationState(v)"
                  aria-describedby="comment-live-feedback"
              />
              <b-form-invalid-feedback id="comment-live-feedback"
                >{{ v.errors[0] }}
              </b-form-invalid-feedback>
            </b-form-group>
          </ValidationProvider>
          <div class="w-100 d-flex justify-content-end">
            <b-button variant="secondary" class="mr-2" @click="$bvModal.hide('reject-modal')"
            >Cancel</b-button>
            <b-button type="submit" variant="primary"
            >Submit</b-button>
          </div>
        </b-form>
      </ValidationObserver>
    </b-modal>
    <!---------------------  Model reject  ------------------------------------>
    <!---------------------  Model accept  ------------------------------------>
    <b-modal ref="accept-modal" id="accept-modal" hide-footer>
      <template #modal-title>Accept</template>
      <div class="d-block d-flex pb-3">
        Are you sure you want to accept this story?
      </div>
      <div class=" w-100 d-flex justify-content-end pb-2 pt-4">
        <b-button class=" w-25 p-2 mr-2 btn-danger"  @click="$bvModal.hide('accept-modal') "
        >Cancel</b-button>
        <b-button class=" w-25 p-2 btn-success"  @click="acceptStory()"
        >Accept</b-button>
      </div>
    </b-modal>
    <!---------------------  Model accept  ------------------------------------>
  </div>
</template>

<script>
import { BIcon } from "bootstrap-vue";
import { mapGetters } from "vuex";
import datetime from "@/mixins/datetime";
import priorities from "@/mixins/priorities";

export default {
  name: "view-sprint",
  components: {
    BIcon,
  },
  mixins: [datetime, priorities],
  computed: {
    ...mapGetters({
      currentUser: "user/getUser",
      isAdmin: "user/isAdmin",
    }),
  },
  data() {
    return {
      id: null,
      stories: [],
      unrealizedStories: [],
      realizedStories: [],
      addableStories: [],
      sprint: null,
      name: null,
      start: null,
      end: null,
      velocity: null,
      currentLoad: null,
      project: null,
      currentStoryId: null,
      comment: null,
      error: null,
      realizedToggle: true,
    };
  },
  async mounted() {
    this.id = this.$route.params.id;
    if (!this.id) return;
    this.getSprint();
  },
  methods: {
    getVariantForSprintStatus(sprint) {
      if (this.isSprintActive(sprint)) return "primary";
      else if (this.hasSprintFinished()) return "danger";
      else return;
    },
    getNameForSprintStatus(sprint) {
      if (this.isSprintActive(sprint)) return "Active";
      else if (this.hasSprintFinished()) return "Finished";
      else return;
    },
    hasSprintFinished() {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return new Date(this.end) < now;
    },
    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    },
    async rejectPrompt(storyId) {
      this.currentStoryId = storyId;
      this.$refs["reject-modal"].show();
    },
    async acceptPrompt(storyId) {
      this.currentStoryId = storyId;
      this.$refs["accept-modal"].show();
    },
    isProductOwner() {
      if (!this.currentUser || !this.project) return false;
      if (this.isAdmin){
        return true;
      }
      return this.currentUser.id === this.project.projectOwnerId;
    },
    isScrumMaster() {
      if (this.isAdmin){
        return true;
      }
      if (!this.currentUser || !this.project) return false;
      return this.currentUser.id === this.project.scrumMasterId;
    },
    async getProject(projectId) {
      if (!projectId) return;

      await this.$axios.$get(`project/${projectId}`).then((res) => {
        if (!res) return;
        this.project = res;
      });
    },
    canBeAdded(points) {
      return this.currentLoad + points <= this.velocity
    },
    isSprintActive(sprint) {
      if(sprint != null){
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return new Date(sprint.start) <= now && new Date(sprint.end) >= now;
      }
    },
    async acceptStory() {
      await this.$axios
            .$post(`user-stories/accept/${this.currentStoryId}`, {
            "message": this.comment,
        })
            .then(async () => {
              await this.getSprint();
              this.comment = null;
              this.$bvModal.hide('accept-modal')
              this.$toast.success("Story has been accepted.", {
                duration: 3000,
              });
            })
          .catch(() => {
              this.$toast.error(
                "An error has occurred, while accepting story.",
                {
                  duration: 3000,
                }
              );
      });
    },
    async removeFromSprint() {
      await this.$axios
            .$post(`user-stories/reject/${this.currentStoryId}`, {
            "message": this.comment,
        })
            .then(async () => {
              await this.getSprint();
              this.comment = null;
              this.$bvModal.hide('reject-modal')
              this.$toast.success("Story removed from sprint.", {
                duration: 3000,
              });
            })
          .catch(() => {
            if(this.comment == null){
              this.$toast.error(
                "Comment field is mandatory.",
                {
                  duration: 3000,
                }
              );
            }else{
              this.$toast.error(
                "An error has occurred, while removing story from sprint.",
                {
                  duration: 3000,
                }
              );
            }
      });
    },
    async moveToSprint(storyId) {
      await this.$axios
        .$post("user-stories/add-to-sprint", {
          sprintId: parseInt(this.id),
          stories: [storyId],
        })
        .then(async () => {
          await this.getSprint();
          this.$toast.success("Story moved to sprint.", {
            duration: 3000,
          });
        })
        .catch(() => {
          this.$toast.error(
            "An error has occurred, while adding story to sprint.",
            {
              duration: 3000,
            }
          );
        });
    },
    async getAddableStories(projectId) {
      this.$axios
        .$get(`user-stories/get-addable`,{
          params: {
            "project-id": projectId,
          },
        })
        .then((res) => {
          this.addableStories = res;
        })
        .catch((reason) => {
          console.error(reason);
          this.$toast.error(
            "An error has occurred, while getting sprint information",
            {
              duration: 3000,
            }
          );
        });
    },
    async getUnRealizedStories(sprintId) {
      this.$axios
        .$get(`user-stories/unrealized-with-sprint`,{
          params: {
            "sprint-id": sprintId,
          },
        })
        .then((res) => {
          this.unrealizedStories = res;
        })
        .catch((reason) => {
          console.error(reason);
          this.$toast.error(
            "An error has occurred, while getting sprint information",
            {
              duration: 3000,
            }
          );
        });
    },
    async getRealizedStories(sprintId) {
      this.$axios
        .$get(`user-stories/realized`,{
          params: {
            "sprint-id": sprintId,
          },
        })
        .then((res) => {
          this.realizedStories = res;
        })
        .catch((reason) => {
          console.error(reason);
          this.$toast.error(
            "An error has occurred, while getting sprint information",
            {
              duration: 3000,
            }
          );
        });
    },
    async getSprint() {
      this.$axios
        .$get(`sprints/${this.id}`)
        .then((res) => {
          this.getAddableStories(res.sprint.projectId);
          this.getProject(res.sprint.projectId);
          this.getRealizedStories(res.sprint.id)
          this.getUnRealizedStories(res.sprint.id)
          this.sprint = res.sprint;
          this.name = res.sprint.name;
          this.start = res.sprint.start;
          this.end = res.sprint.end;
          this.velocity = res.sprint.velocity;
          this.stories = res.sprint.UserStories;
          this.currentLoad = res.currentLoad;
        })
        .catch((reason) => {
          console.error(reason);
          this.$toast.error(
            "An error has occurred, while getting sprint information",
            {
              duration: 3000,
            }
          );
        });
    },
  },
};
</script>

<style scoped>
.title {
  font-size: 1.17em;
  margin-top: 1em;
  margin-bottom: 1em;
  margin-left: 0;
  margin-right: 0;
  font-weight: bold;
}
</style>
