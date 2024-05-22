<template>
  <div>
    <h2>Outcome & Reflection Dashboard:</h2>
    <input v-model="gameId" placeholder="Enter Game ID" />
    <button @click="filterData">Submit</button>
    <div v-if="filteredData.length">
      <table>
        <thead>
        <tr>
          <th>Game ID</th>
          <th>Role ID</th>
          <th>Role Description</th>
          <th>Role's Doing</th>
          <th>Option Description</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="row in filteredData" :key="row[0] + row[1]">
          <td :class="`color-${row[1]}`">{{ row[0] }}</td>
          <td :class="`color-${row[1]}`">{{ row[1] }}</td>
          <td :class="`color-${row[1]}`">{{ getRoleTitle(row[1]) }}</td>
          <td :class="`color-${row[1]}`">
            <button @click="row.showRoleDoing = !row.showRoleDoing">
              {{ row.showRoleDoing ? 'Collapse' : 'Show' }}
            </button>
            <div v-if="row.showRoleDoing">
              {{ getRoleDescription(row[1]) }}
            </div>
          </td>
          <td :class="`color-${row[1]}`">{{ getDescription(row[2]) }}</td>
        </tr>
        </tbody>
      </table>
      <h3>--------Feedback--------</h3>
      <table>
        <thead>
        <tr>
          <th>Game ID</th>
          <th>Role Description</th>
          <th>Role Responsibility</th>
          <th>Feedback by openai</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="row in feedbackData" :key="row.gameId + row.roleId">
          <td>{{ row.gameId }}</td>
          <td>{{ getRoleTitle(row.roleId) }}</td>
          <td>{{ getRoleDescription(row.roleId) }}</td>
          <td v-html="formatFeedback(row.text)"></td>
        </tr>
        </tbody>
      </table>
    </div>
    <p v-else>No data found.</p>
  </div>
</template>



<script>
import axios from 'axios';

export default {
  name: "Administrator",
  data() {
    return {
      pipedreamData: [],
      gameId: '',
      filteredData: [],
      feedbackData: [],
      options: [],
      roles: [],
      apiKeys: ['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', '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', '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', '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', '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'], // Add your actual keys here
    }
  },
  methods: {
    async fetchDataFromPipeDream() {
      const headers = new Headers();
      headers.append("Content-Type", "application/json");

      const body = {
        "test": "event"
      };

      const options = {
        method: "POST",
        headers,
        mode: "cors",
        body: JSON.stringify(body),
      };

      try {
        const response = await fetch("https://eo1krx83kg3sgq6.m.pipedream.net", options)
        const data = await response.json();
        this.pipedreamData = data;
        await this.filterData();
      } catch (error) {
        console.error('Error:', error);
      }
    },
    async fetchOptions() {
      try {
        const response = await axios.get(process.env.VUE_APP_BACKEND_URL + "options");
        this.options = response.data;
      } catch (error) {
        console.error('Error:', error);
      }
    },
    async filterData() {
      if (!this.gameId) {
        alert("Please enter a Game ID.");
        return;
      }
      this.filteredData = this.pipedreamData.filter(row => row[0] === this.gameId).map(row => ({ ...row, showRoleDoing: false }));
      if (this.filteredData.length === 0) {
        alert("No data found for this Game ID. Please enter a different Game ID.");
        return;
      }

      this.feedbackData = [];
      for (let role of this.roles) {
        const roleData = this.filteredData.filter(row => row[1] === role.id.toString());
        const optionsTaken = roleData.map(row => this.getDescription(row[2])).join(' Another decision chosen:');
        const prompt = `A person in the role of ${role.title}, has role Responsibility: ${role.description}, and has made the following decision: ${optionsTaken}\nPlease provide an ethical analysis for each chosen decision. The answer should discuss potential ethical implications, benefits, and drawbacks of the decisions. For answering, please indicate the decision. For example, "For the first decision:". each decision's analysis don't exceeds words length of 50.\n\nEthical Analysis: `;
        console.log(prompt)
        const feedback = await this.getEthicalAnalysis(this.apiKeys[role.id], prompt);
        this.feedbackData.push({ gameId: this.gameId, roleId: role.id.toString(), text: feedback });
      }
      // Output feedbackData for checking
      console.log("Feedback Data:", this.feedbackData);
    },

    getRoleTitle(roleId) {
      const role = this.roles.find(role => role.id.toString() === roleId);
      return role ? role.title : 'No role title found';
    },
    getRoleDescription(roleId) {
      const role = this.roles.find(role => role.id.toString() === roleId);
      return role ? role.description : 'No role description found';
    },
    getDescription(optionId) {
      const option = this.options.find(option => option.optionID.toString() === optionId);
      return option ? option.description : 'No description found';
    },
    async getEthicalAnalysis(apiKey, prompt) {
      try {
        const response = await axios.post('https://api.openai.com/v1/completions', {
          model: 'text-davinci-003',
          prompt,
          max_tokens: 300,
          temperature: 0.5,
        }, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        console.log(response.data.choices[0].text.trim());
        return response.data.choices[0].text.trim();
      } catch (error) {
        console.error('Error:', error);
        return 'Error occurred while getting feedback';
      }
    },
    formatFeedback(feedback) {
      const decisions = ['For the first decision:', 'For the second decision:', 'For the third decision:', 'For the fourth decision:', 'For the fifth decision:', 'For the sixth decision:', 'For the seventh decision:', 'For the eighth decision:', 'For the ninth decision:', 'For the tenth decision:', 'For the eleventh decision:', 'For the twelfth decision:'];

      const formattedFeedback = decisions.reduce((feedback, decision, index) => {
        const colorClass = `color-feedback${index+1}`;
        return feedback.replace(new RegExp(`(${decision})`, 'g'), `<br/><span class="bold ${colorClass}">$1</span><br/><span class="${colorClass}">`);
      }, feedback);

      return formattedFeedback + '</span>';
    }
  },
  mounted() {
    this.fetchDataFromPipeDream();
    this.fetchOptions();
    this.roles = [{"id":0,"title":"Boeing Executive","description":"Oversees the whole 737 MAX project, as well as the other operations occurring within the Boeing company."},{"id":1,"title":"Aeronautical Engineer","description":"Acts as the project lead for the 737 MAX project, and is responsible for the continuous and stable operation of the 737 MAX in the future."},{"id":2,"title":"Software Developer","description":"Represents the software development team for the 737 MAX project, and is responsible for technical operation and development of the 737 MAX."},{"id":3,"title":"FAA Official","description":"Acts as the regulatory body for the 737 MAX project, is responsible for ensuring the project adheres to guidelines."},{"id":4,"title":"Boeing Pilot","description":"A long-time pilot of Boeing, acts as a lead tester for the 737 MAX project and is responsible for ensuring practical effectiveness of the 737 MAX."}];
  }
}
</script>

<style>
h2 {
  color: #333;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
}

button {
  margin-top: 10px;
  padding: 5px 10px;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

table {
  border-color: lightblue;
}

table th,
table td {
  border-color: lightblue;
}


th {
  padding: 10px;
  text-align: left;
  background-color: #2a9d8f;
  color: white;
}

td {
  padding: 10px;
  border: 1px solid #ddd;
  font-family: 'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', sans-serif;
  text-align: justify;
}

.color-0 {
  color: #1a237e;  /* Indigo */
}

.color-1 {
  color: #004d40;  /* Teal */
}

.color-2 {
  color: #e65100;  /* Orange */
}

.color-3 {
  color: #311b92;  /* Deep Purple */
}

.color-4 {
  color: #b71c1c;  /* Red */
}

.color-feedback1 {
  background-color: #ffc0cb; /* Pink */
}

.color-feedback2 {
  background-color: #90ee90; /* LightGreen */
}

.color-feedback3 {
  background-color: #add8e6; /* LightBlue */
}

.color-feedback4 {
  background-color: #f08080; /* LightCoral */
}

.color-feedback5 {
  background-color: #e0ffff; /* LightCyan */
}

.color-feedback6 {
  background-color: #fafad2; /* LightGoldenRodYellow */
}

.color-feedback7 {
  background-color: #d3d3d3; /* LightGrey */
}

.color-feedback8 {
  background-color: #ffb6c1; /* LightPink */
}

.color-feedback9 {
  background-color: #ffffe0; /* LightYellow */
}

.color-feedback10 {
  background-color: #b0e0e6; /* PowderBlue */
}

.color-feedback11 {
  background-color: #ffefd5; /* PapayaWhip */
}

.color-feedback12 {
  background-color: #dda0dd; /* Plum */
}

td span {
  display: inline-block;
  text-indent: 2em;
  line-height: 1.5;
  white-space: pre-wrap;
}

td span::before {
  content: "";
  display: block;
  height: 0;
  width: 0;
}

.bold {
  font-weight: bold;
}
</style>
