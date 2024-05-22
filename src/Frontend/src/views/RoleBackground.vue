<template>
  <v-col align="center" className="text-center">

    <Menu/>

    <!-- Title -->
    <div className="my-10">
      <h1 className='display-1'>About You</h1>
    </div>


    <!-- Background Text -->
    <div v-if="!processedBackground" className="loading">
      <v-progress-circular indeterminate color="primary"/>
    </div>
    <div v-else className="my-6">
      <v-card className="mx-auto" max-width="600" outlined>
        <v-card-text className="body-1" v-html="processedBackground">
        </v-card-text>
      </v-card>
    </div>

    <!-- Next button going to the SeeAllDecision page -->
    <div v-if="processedBackground" className="my-10">
      <router-link to="/ChapterBackground">
        <v-btn rounded className="ma-2" color="primary" dark>
          <v-icon dark>mdi-arrow-right</v-icon>
        </v-btn>
      </router-link>
    </div>

  </v-col>
</template>

<script>
import axios from "axios";
import Menu from "../components/Menu";

function getRoleBackground() {
  let vm = this;
  return axios
      .get(process.env.VUE_APP_BACKEND_URL + "roles/introduction", {params: {roleID: vm.$store.state.roleID}})
      .then((response) => {
        if (response.status === 200) {
          let text = response.data.goal;
          text = text.replace(/(As[^,]+,)/, '<b>$1</b>');
          const sentences = text.split('.');
          sentences.forEach((sentence, i) => {
            if (i < 2) {
              sentences[i] = `<p style="text-align: left;">${sentence}.</p>`;
            } else {
              sentences[i] = `<p style="text-align: left; color: lightblue;">${sentence}.</p>`;
            }
          });
          vm.processedBackground = sentences.join('');
        }
      })
      .catch((error) => {
        console.log("error: " + error);
      });
}

export default {
  components: {
    Menu,
  },
  data() {
    return {
      processedBackground: "",
    };
  },
  created() {
    this.getRoleBackground();
  },
  methods: {
    getRoleBackground,
  },
};
</script>

<style lang="less">
.loading {
  height: 200px;
  padding: 30px 0;
}
</style>
