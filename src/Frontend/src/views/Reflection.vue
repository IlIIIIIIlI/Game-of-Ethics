<template>
  <v-col align="center" class="text-center">

    <!-- Title -->
    <div class="my-10">
      <h1 class='display-1'>Reflection</h1>
    </div>

    <!-- All Decisions Table -->
    <div class="my-6">
      <v-card class="mx-auto" max-width="600" outlined>
        <div class="mt-10 mb-15 ml-10 mr-8 text-center">
          <h4 class="font-weight-medium notification-message">Please refer to admin page's feedback</h4>
        </div>
      </v-card>
    </div>

    <v-col cols="12" class="my-6">
      <v-btn x-large color="primary" @click="showModal = true">Exit Game</v-btn>
    </v-col>

    <div class="my-6">
      <v-dialog v-model="showModal" width="600px">
        <v-card class="popup">
          <v-card-title class="justify-center">
            <span class="headline">Confirm</span>
          </v-card-title>
          <v-card-text>
            <p class="popup-content">
              {{ confirmMessage }}
            </p>
            <v-spacer></v-spacer>
            <router-link to="/" style="text-decoration:none">
              <v-btn rounded class="ma-2">Yes</v-btn>
            </router-link>
            <v-btn rounded class="ma-2" @click="showModal = false">No</v-btn>
          </v-card-text>
        </v-card>
      </v-dialog>
    </div>


  </v-col>
</template>


<script>
import axios from "axios";

function getAllDecisions() {
  let vm = this;
  return axios
      .get(process.env.VUE_APP_BACKEND_URL + "play/make-decision/" + vm.$store.state.gameID)
      .then((response) => {
        if (response.status === 200) {
          vm.questions = response.data.reflection;
        }
      })
      .catch((error) => {
        console.log("error: " + error);
      });
}

export default {
  name: "Reflection",
  data() {
    return {
      questions: [],
      result: 0,
      showModal: false,
      confirmMessage: "Are you sure you want to exit the game?",
    }
  },
  created() {
    this.getAllDecisions();
  },
  methods: {
    getAllDecisions,
  },
}
</script>

<style scoped>
.notification-message {
  font-size: 2em;
  font-weight: bold;
  font-family: 'narrative', serif;
}

.role {
  color: #696969;
  font-size: 85%;
}

.user {
  font-weight: bolder;
}
</style>
