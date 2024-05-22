<template>
  <v-col align="center" class="text-center">

    <Menu/>

    <router-link v-if="!reveal" :to="this.$route.query.skip ? '/ChapterBackground' : '/IndividualBackground'"
                 class="back-button">
      <v-icon>mdi-arrow-left</v-icon>
    </router-link>

    <!-- Title -->
    <div class="my-10 mx-auto" style="width:300px;">
      <h1 class='display-1'>Group Discussion</h1>
    </div>

    <!-- Discussion Content -->

    <div v-if="!questionID || loadingOutcome" class="loading">
      <div class="transform-me">
        <v-progress-circular indeterminate color="primary"/>
      </div>
    </div>

    <div v-else class="my-6">
      <v-card class="mx-auto" max-width="600" outlined>
        <v-card-text>
          <p v-if="!reveal && !waiting && questionID>=6061 && questionID<=6131" class="my-1 body-2 font-weight-regular italic-text">
            As a group, discuss the following decision. You have 150s to finish your choice.
          </p>
          <p v-else-if="!reveal && !waiting && questionID > 100 && questionID < 6061" class="my-1 body-2 font-weight-regular italic-text">
            Below is a personal question, you have 60s to finish your choice.
          </p>

          <p v-else-if="!reveal && waiting" class="my-1 body-2 font-weight-regular italic-text">
            <v-progress-circular indeterminate color="primary"/>
            Waiting for other players to enter their choice.
          </p>

          <p v-else-if="reveal" class="italic-text">
            The outcome for the team is:
          </p>



          <button @click="isExpanded = !isExpanded" class="collapse-title">
            {{ Question.split('.')[0] }}. <span v-if="!isExpanded">(Click to see more...)</span><span v-else>（Close...）</span>
          </button>
          <Collapse :when="isExpanded" class="v-collapse">
            <p v-for="(sentence, index) in Question.slice(Question.indexOf('.') + 1).split('.')" :key="index">{{ sentence.length > 0 ? sentence + '.' : '' }}</p>
          </Collapse>

<!--          <h3 class="mt-8 mb-3 font-weight-medium">-->
<!--            {{ Question }}-->
<!--          </h3>-->

          <template v-if="!reveal">

            <v-form @submit.prevent="enterChoice">
              <v-radio-group class="my-1" v-model="myChoice" :disabled="waiting" mandatory>
                <v-radio
                    v-for="option in options"
                    :key="option.id"
                    :value="option.id"
                    class="my-3 option">
                  <template v-slot:label>
                    <div>
                      <span class="emoji">{{ emojis[option.i-1] }}</span>:
                      <span class="first-sentence">{{ option.firstSentence }}</span>
                      <span class="cartoon-font">{{ option.restText }}</span>
                    </div>
                  </template>
                </v-radio>
              </v-radio-group>


              <v-btn class="mt-1 mb-5" color="primary" type="submit" :disabled="waiting">Submit my choice</v-btn>


              <Timer v-slot="timeObj" :time=150 v-if="questionID >= 6061 && questionID <= 6131">
                <div class="timer"/>
                <div class="count-down">
                  <div class="icon"></div>
                  <img class='timer' src="~@/assets/timer.png">
                  <span>{{ timeObj.mm }} m {{ timeObj.ss }} s</span>
                </div>
              </Timer>

              <Timer v-elseif v-slot="timeObj" :time=60 v-else>

                <div class="count-down">
                  <div class="icon"></div>
                  <img class='timer' src="~@/assets/timer.png">
                  <span>{{ timeObj.mm }} m {{ timeObj.ss }} s</span>
                </div>
              </Timer>


            </v-form>
          </template>

          <template v-else>

            <p class="font-weight-medium body-1 my-6">
              You chose: {{ emojiIndex }} - <span class="first-sentence">{{ firstSentence }}</span><span class="rest-text">{{ restText }}</span>
            </p>

            <p class="body-2 mt-8" v-if="outcome" :style="{border: '2px solid lightblue', padding: '10px'}">
              {{ outcome }}
            </p>
          </template>


        </v-card-text>

      </v-card>
    </div>

    <div class="text-center-right" v-if="reveal && !loadingOutcome">
      <router-link to="/ChapterBackground" v-if="!isEnd">
        <v-btn rounded class="ma-2" color="primary" dark>
          Next Chapter
          <v-icon dark>mdi-arrow-right</v-icon>
        </v-btn>

      </router-link>
      <router-link to="/Outcome" v-if="isEnd">
        <v-btn rounded class="ma-2" color="primary" dark>
          End of Game
          <v-icon dark>mdi-arrow-right</v-icon>
        </v-btn>
      </router-link>
    </div>

    <div class="my-6">
      <v-dialog v-model="showModal" width="600px">
        <v-card class="popup">
          <v-card-title class="justify-center">
            <span class="headline">Alert</span>
          </v-card-title>
          <v-card-text>
            <p class="popup-content">{{ alertMessage }}</p>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" text @click="showModal = false">Ok</v-btn>
          </v-card-text>
        </v-card>
      </v-dialog>
    </div>

  </v-col>


</template>

<script>
import axios from "axios";
import Menu from "../components/Menu";
import Timer from "@/components/Timer";
import { ref } from 'vue'
import { Collapse } from 'vue-collapsed'
function getQuestion() {
  let vm = this;
  return axios
      .get(process.env.VUE_APP_BACKEND_URL + "play/" + vm.$store.state.gameID + "/round", {params: {roleID: vm.$store.state.roleID}})
      .then((response) => {
        if (response.status === 200) {

          vm.Question = response.data.question;
          vm.questionID = response.data.questionID;

          let responseObj = response.data.options;
          vm.options = {};

          let i = 1;
          for (let [, option] of Object.entries(responseObj)) {
            let [firstSentence, ...rest] = option.description.split(',');
            vm.options[option.optionID] = {
              i: i,
              id: option.optionID,
              firstSentence: firstSentence + ',',  // Add back the period
              restText: rest.join(','),
            };
            i++;
          }
        }
      })
      .catch((error) => {
        console.log("error: " + error);
      });
}

// function enterChoice() {
//
//   let vm = this;
//   vm.isActive = true;
//   return axios
//       .post(process.env.VUE_APP_BACKEND_URL + "play/make-decision/" + vm.$store.state.gameID, {
//         optionID: vm.myChoice,
//         roleID: vm.$store.state.roleID
//       })
//       .then((response) => {
//             if (response.status === 200) {
//               vm.waiting = true;
//             }
//           }
//       )
//       .catch((error) => {
//         console.log("error: " + error);
//       });
// }

function enterChoice() {
  let vm = this;
  vm.isActive = true;
  return axios
      .post(process.env.VUE_APP_BACKEND_URL + "play/make-decision/" + vm.$store.state.gameID, {
        optionID: vm.myChoice,
        roleID: vm.$store.state.roleID
      })
      .then((response) => {
        if (response.status === 200) {
          vm.waiting = true;

          // Add the second POST request here.
          const headers = new Headers();
          headers.append("Content-Type", "application/json");

          const body = {
            gameid: vm.$store.state.gameID,
            roleid: vm.$store.state.roleID,
            optionid: vm.myChoice,
          };

          const options = {
            method: "POST",
            headers,
            mode: "cors",
            body: JSON.stringify(body),
          };

          return fetch("https://eonh2oqj1421p0u.m.pipedream.net", options)
              .then(response => response.json())
              .then(data => console.log(data))
              .catch(error => console.error('Error:', error));
        }
      })
      .catch((error) => {
        console.log("error: " + error);
      });
}


function roundStatus() {
  if (!this.reveal) {
    let vm = this;
    return axios
        .get(process.env.VUE_APP_BACKEND_URL + "play/" + vm.$store.state.gameID + "/round-status", {params: {roleID: vm.$store.state.roleID}})
        .then((response) => {
          if (response.status === 200) {
            if (!vm.outcomeRetrieved && vm.questionID !== '' && response.data.status === 'post') {
              vm.reveal = true;

              // when no round status, or if question ID is -1, this signals we are at end of game
              vm.isEnd = (!response.data.questionID || response.data.questionID == -1);

              getOutcome(vm);

            }
          }
        })
        .catch((error) => {
          console.log("error: " + error);
        });
  }
}

function getOutcome(vm) {
  vm.loadingOutcome = true;
  return axios
      .get(process.env.VUE_APP_BACKEND_URL + "play/" + vm.$store.state.gameID + "/round-outcome", {params: {roleID: vm.$store.state.roleID}})
      .then((response) => {
        if (response.status === 200) {
          let resultId = response.data.result.optionID;
          vm.resultIndex = vm.options[resultId].i;
          vm.resultText = response.data.result.description;
          vm.outcome = response.data.result.outcomeText;
          vm.loadingOutcome = false;
          vm.outcomeRetrieved = true;
        }
      })
      .catch((error) => {
        vm.loadingOutcome = false;
        console.log("error: " + error);
      });
}

export default {
  components: {
    Menu,
    Timer,
    Collapse
  },
  name: "Discussion",
  data() {
    return {
      emojis: ['🅰️', '🅱️', '🅲️', '🅳️', '🅴️', '🅵️', '🅶️', '🅷️', '🅸️', '🅹️', '🅺️', '🅻️', '🅼️', '🅽️', '🅾️', '🅿️', '🆀️', '🆁️', '🆂️', '🆃️', '🆄️', '🆅️', '🆆️', '🆇️', '🆈️', '🆉️'],
      isExpanded: ref(false),

      //timerCount: 1000,
      showModal: false,
      alertMessage: "",
      checked: 0,
      isActive: false,

      //question info
      Question: "",
      questionID: "",
      reveal: false,

      outcome: "",
      resultIndex: 0,
      resultText: "",

      options: [],

      isEnd: false,

      myChoice: -1,
      waiting: false,

      loadingOutcome: false,
      outcomeRetrieved: false
    }
  },
  created() {
    this.getQuestion();
    this.roundStatus();
    this.timer = setInterval(this.roundStatus, 2000);
  },
  /**watch: {
            timerCount: {
                handler(value) {

                    if (value > 0) {
                        setTimeout(() => {
                            this.timerCount--;
                        }, 1000);
                    }
                    else {

                        this.$router.push({path:'/RoundOutcome'});
                    }
                },
                immediate: true // This ensures the watcher is triggered upon creation
            }

        },**/

  //submit button will detect if user choose decision
  methods: {
    enterChoice,
    roundStatus,

    //getOptions,
    // getInfo,
    getQuestion,
    getOutcome

  },
  computed: {
    emojiIndex() {
      //  Convert numbers to English letters starting with 'A' and then add the emoji unicode encoding
      return String.fromCodePoint(this.resultIndex + 65 + 127397);
    },
    firstSentence() {
      return this.resultText.split('.')[0] + '.';
    },
    restText() {
      return this.resultText.slice(this.resultText.indexOf('.') + 1);
    }
  },

}
</script>

<style>
.back-button {
  float: left;
  padding-left: 25px;
  text-decoration: none;
  margin-top: 5px;
}

.popup {
  background: #FFFFFF;
  box-shadow: 2px 2px 20px 1px;
  overflow-x: auto;
  display: flex;
  flex-direction: column;
}

.popup-content {
  border-bottom: 1px solid #eeeeee;
  font-size: 15px;
  position: relative;
  padding: 20px 10px;
}

.v-label {
  font-size: 90%;
}

.transform-me:hover {
  transform: scale(1.2);
  position: relative;
  z-index: 99;
}

.timer {
  /*-webkit-border-radius: 100px;*/
  /*-moz-border-radius: 100px;*/
  /*border-radius: 100px;*/
  height: 25px;
  position: relative;
  width: 25px;
  background-size: 50%;
}

.collapse-title {
  cursor: pointer;
  text-decoration: underline;
  color: #2a9d8f;
}

.collapse-title span {
  font-weight: bold;
  color: #cdb4db;
}

.v-collapse {
  transition: height 300ms cubic-bezier(0.33, 1, 0.68, 1);
  text-align: left;
}

.italic-text {
  font-style: italic;
  color: #F6AA1C;
}

.first-sentence {
  color: black;
  font-weight: bold;
}

.cartoon-font {
  font-family: 'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', sans-serif;
}

.emoji {
  font-weight: bold;
}

.rest-text {
  font-family: 'Comic Sans MS', cursive, sans-serif;
}

</style>
