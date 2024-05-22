# Sample Data  
### When I create a new game after enter my name ‘Dawson’:  
### User.js  
{  
  "name": "Dawson"  
}  
  
### When I select my role ‘Boeing Executive’:  
### Role.js  
{  
  "name": "Boeing Executive",  
  "isAvailable": true,  
  "player": "Dawson",  
  "obsComp": "[0,0,0,0,0,0,0]"  
}  
  
### When all players select their roles:  
### Game.js  
{  
  "duration": "",  
  "players": ["Dawson", "Robin", "Haiyu", "Eryi", "Yujie"],  
  "playersSel": ["Boeing Executive", "Software Developer", "Airline Pilot", "Aeronautical Engineer", "FAA Official"],  
  "playerCount": 5,  
  "status": ["waiting", "waiting", "waiting", "waiting", "waiting"],  
  "readyCount": 0,  
  "votedCount": 0,  
  "roles": "roles",  
  "decisionList": emptyList,  
  "finalOptionList": emptyList,  
  "currQuestion": [ ],  
  "prevQuestion": [ ],  
  "finalOptionID": [0,0,0,0,0],  
  "companyState": "",  
  "receivedFeedbackCount": 0  
}  
  
### When I enter the first question of ‘Boeing Executive’:  
### Question.js  
{  
  "questionID": 1011,  
  "background": "With these decisions put in place, development is beginning to mature, and a full-fledged plane design is now coming to fruition. It is still a long way until the project will be complete, but things are looking relatively smooth. Most discussion this round will focus on developing the relationships of the company",  
  "question": "The media have got in contact with the project team to discuss the new plane design, and has asked the team for a statement regarding the quality of the plane in comparison to its competitors. The company has historically outperformed its competitors but a recent competitor model has put some pressure on the company to deliver a new, high-quality model. Most experts that have reviewed initial concept sketches have been optimistic about the performance of the new plane.",  
  "roleInfo": ["It is of utmost importance that company reputation is high in all areas, current reputations are all at 50.", "Internal reputation represents the feelings of teams under the guidance of the five of you, towards you, if this drops too low, project efficiency will lower.", "Make sure any promises that the company makes are realistic.",  "Designing a plane to reduce the environmental footprint will not improve the performance of the plane from a commercial context.", "Your job is to ensure that FAA reputation is maximized."]    
　"options": "[22, 23, 24]",  
  "duration": 20,  
  "weights": "[40, 15, 15, 15, 15]",  
  "readyCount": 0,  
  "expectedCount": 1,  
  "readyPlayer": [ ],  
  "decisions": [ ],  
  "optionsFinalWeights": [ ],  
  "votedCount": 0,  
  "votedPlayer": [ ]  
}  
  
### When showing the options of question 1:  
### Option.js  
{  
  "optionID": 22,  
  "questionID": 1011,  
  "description": "Be optimistic, state that the new plane design will outperform any competitor in the market, this will lead to good PR and reputation.",  
  "consequences": {  
                    contracts:0,   
                    compContracts:7,   
                    shares:0,  
                    publicRep:5,   
                    regulatorRep:0,   
                    internalRep:0,   
                    voardRep:0,/  
                    enviroRep:0,   
                    expectedProg:0,   
                    actualProg:0,   
                    expectedCost:0,   
                    actualCost:0  
                },  
  "outcomeText": "",  
  "next": 1021  
}  
  
### Decision.js:  
{  
　"gameID": {type:"jikp", ref:: "Game"},  
  "question": {type: "1011", ref: "Question"},  
  "chosen": {type: "22", ref: "Option"},  
　"chosenBy":{type: "Boeing Executive", ref: "Role"}  
}  
  
### DecisionList.js  
{  
　"decisions": [{type:1011, ref:: "Decision"}]  
}  
  
### FinalOptionList.js  
{  
　"questionID": "1011",  
  "questionText": "The media have got in contact with the project team to discuss the new plane design, and has asked the team for a statement regarding the quality of the plane in comparison to its competitors. The company has historically outperformed its competitors but a recent competitor model has put some pressure on the company to deliver a new, high-quality model. Most experts that have reviewed initial concept sketches have been optimistic about the performance of the new plane.",  
  "decisionRoleRelation": ["22"],  
　"finalOptionID": "22"  
}  
  
### When calculate the score:  
### Company.js  
{  
  "contracts":25,  
　"compContracts":160  
　"shares":50,  
　"publicRep":50,  
　"regulatorRep":50,  
　"internalRep":50,  
　"voardRep":50,  
　"enviroRep":50,  
　"expectedProg":0,  
　"actualProg":140,  
　"expectedCost":0,  
　"actualCost":150,  
}  
  
### When finishing the game, I receive the outcome 1:  
### Outcome.js  
{  
  "outcomeID": 1,  
  "gameOutcome": "While the aircraft was initially a success, a number of undetected problems caused some disastrous results. Three months after the plane's first commercial flight, a crash occurred that killed everyone on board. Two months later, due to company inaction, a second crash occurred, again killing everyone on board. The legal investigation was thorough and found that the company had been extremely negligent in designing the aircraft, often cutting corners and prioritizing profit and efficiency over the well-being and safety of its customers. So ultimately the project was a complete failure.",  
  "roleOutcome": ["As a result of your previous decision, a large portion of the company's workforce is still unhappy with you and the company has taken considerable risks in R&D. However, your choice has kept the development schedule and costs within reasonable limits, so the company has decided to observe your subsequent decision",  
"Thanks to your choices, the aircraft can operate properly for a period of time, despite some flaws in the aircraft's design. However, at some point in the future, the aircraft may be involved in an accident due to unknown factors, so the company will still observe your choice afterwards",  
"Thanks to your choices, the aircraft can operate properly for a period of time, although there are still some drawbacks to automated flight. However, at some point in the future, the aircraft may break free from the pilot's operation and an accident may occur, so the company will still observe your choice after the fact",  
"As a result of your selection, the aircraft may operate properly for a period of time, although the aircraft still has undetected defects. However, at some point in the future, a hidden defect, or even some irreparable defect, may occur in the aircraft, so the company will still be watching your selection after the fact",  
"As a result of your choices, the aircraft may operate properly for a period of time, even though there are still software errors in the aircraft's design. However, at some point in the future, the pilot may make an operational error that causes the aircraft to crash because the ui interface does not operate as it was conventionally designed, so the company will still be concerned about your choice after the fact"]  
}  
