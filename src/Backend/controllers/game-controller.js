const mongoose = require('mongoose');
const Game = mongoose.model('Game');
const Decision = mongoose.model('Decision');
const DecisionList = mongoose.model('DecisionList');
const Option = mongoose.model('Option');
const FinalOption = mongoose.model('FinalOption');
//const Decision = require('../models/Decision.js')
const Role = mongoose.model('Role');
const Company = mongoose.model('Company');
const Question = mongoose.model('Question');
const _ = require('lodash');
const Outcome = mongoose.model('Outcome');

mongoose.set('useFindAndModify', false);


// const newGame = function (req, res) {
async function newGame(req, res) {
    try {
        let name = req.body.name;
        let dur = 0;
        if (req.body.duration) {
            dur = req.body.duration;
        } else {
            dur = 0;
        }

        // role part
        role0 = new Role({
            role: "Boeing Executive",
            isAvailable: true,
            player: null,
            obsComp: ["shares", "voardRep", "publicRep", "contracts", "compContracts", "expectedCost", "actualCost"]
        });

        role1 = new Role({
            role: "Aeronautical Engineer",
            isAvailable: true,
            player: null,
            obsComp: ["shares", "actualProg", "expectedProg", "internalRep", "expectedCost", "actualCost"]
        });

        role2 = new Role({
            role: "Software Developer",
            isAvailable: true,
            player: null,
            obsComp: ["shares", "actualProg", "expectedProg", "internalRep"]
        });

        role3 = new Role({
            role: "FAA Official",
            isAvailable: true,
            player: null,
            obsComp: ["shares", "regulatorRep", "publicRep"]
        });

        role4 = new Role({
            role: "Boeing Pilot",
            isAvailable: true,
            player: null,
            obsComp: ["shares", "voardRep", "publicRep", "internalRep"]
        });

        const roles = [role0, role1, role2, role3, role4]

        // decisionList part
        emptyList = new DecisionList({
            decisions: [],
        });

        // company part
        company = new Company({
            contracts: 80,
            compContracts: 20,
            shares: 50,

            publicRep: 50,
            regulatorRep: 50,
            internalRep: 50,
            voardRep: 50,//CEO only
            enviroRep: 50,

            expectedProg: 0,
            actualProg: 0,
            expectedCost: 0,
            actualCost: 0

        });

        game = new Game({
            duration: dur,
            players: [name],
            playersSel: [],//mark who has selected a role
            playerCount: 1,
            status: ["waiting", "waiting", "waiting", "waiting", "waiting"],
            readyCount: 0,
            votedCount: 0,
            roles: roles,
            finalOptionList: [],
            decisionList: emptyList,
            companyState: company,
            currQuestion: [], //will be replaced with Question1
            prevQuestion: [], //store for proper question update,
            finalOptionID: [0, 0, 0, 0, 0],
            receivedFeedbackCount: 0,

        })

        // + Redesign Roles as MongoDB objects
        // + Unique Company Object
        // + Empty Decision History List
        if (name == null) {
            res.status(400).send("please enter name");
        } else {
            try {
                const questionIds = [
                    '3011',
                    '1011',
                    '2011',
                    '5011',
                    '4011',
                ];
                const questions = await Question.find().where('questionID').in(questionIds).exec();
                game.currQuestion = questions
                game.prevQuestion = questions
                const gameResult = await game.save()
                const role0Result = await role0.save()
                const role1Result = await role1.save()
                const role2Result = await role2.save()
                const role3Result = await role3.save()
                const role4Result = await role4.save()
                const role5Result = await emptyList.save()
                const companyResult = await company.save()
                res.status(200).send({
                    playerName: name,
                    gameID: game.shortcode
                });
            } catch (err) {
                res.status(400).send(error);
                return handleError(err);
            }
        }
    } catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
};

const joinGame = function (req, res) {
    // find game by shortcode, sort by most recently created
    Game.findOne({shortcode: req.params.gameID}, null, {sort: {createdAt: -1}})
        .then(game => {
            let playerName = req.body.name;
            if (!game.players.includes(playerName) && game.playerCount <= 4) {
                game.players.push(playerName);
                game.playerCount++;
                if (game.playerCount == 5) {
                    game.status = ["ready", "ready", "ready", "ready", "ready"];
                }
                game.save()
                    .then(doc => {
                        res.status(200).send({playerName: playerName, gameID: doc.shortcode});
                    })
                    .catch(error => {
                        res.status(400).send(error);
                    })
            } else {
                if (game.playerCount >= 5) {
                    res.status(400).send("The game is full. Please choose another game");
                } else {
                    res.status(400).send("The name is already exist. Please change to another name");
                }
            }
        })
        .catch(error => {
            res.status(400).send("Invalid Game ID or player name entered.");
        })
};

const getPlayerStatus = function (req, res) {
    Game.findOne({shortcode: req.params.gameID}, null, {sort: {createdAt: -1}})
        .then(game => {
            let roleID = Number(req.query.roleID)
            let status = game.status[roleID]
            res.status(200).json({
                players: game.players,
                ready: status == "ready" ? true : false
            })
        })
        .catch(err => {
            res.status(400).send(err);
        })
};

async function readyToDiscuss(req, res) {
    // find game by shortcode, sort by most recently created
    try {
        const game = await Game.findOne({shortcode: req.params.gameID}, null, {sort: {createdAt: -1}})
        let roleID = Number(req.query.roleID)
        let playerName = req.body.name;
        let questionIds = game.currQuestions;
        let questions = await Question.find().where("_id").in(questionIds).exec();
        let currQuestion = questions[roleID]
        //let nextQuestion = game.nextQuestion;
        let status = game.status[roleID];
        let readyCount = game.readyCount;

        if (!currQuestion.readyPlayer.includes(playerName) && currQuestion.readyCount < currQuestion.expectedCount) {
            currQuestion.readyPlayer.push(playerName);
            currQuestion.readyCount++;
            readyCount++;
            // console.log(game.status,game.players,game.currQuestion.readyPlayer,game.currQuestion.readyCount)
            if (readyCount == 5) {
                status = "discuss";
                readyCount = 0;
            }
            questions[roleID] = currQuestion
            console.log(roleID)
            console.log(status, players, readyPlayer, readyCount)
            Game.findOneAndUpdate({shortcode: req.params.gameID},
                {
                    "$set":
                        {
                            status: [status, status, status, status, status],
                            readyCount: readyCount,
                            currQuestion: questions,

                        }
                }, {new: true}).then(doc => {
                console.log("status: ", doc.status)
                res.status(200).send({playerName: playerName, gameID: doc.shortcode});
            })
                .catch(error => {
                    res.status(400).send(error);
                })
        } else {
            /*if (game.playerCount == 5) {
                res.status(400).send("Error");
            } else {
                res.status(400).send("Error");
            }*/
        }
    } catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
};

const getGameStatus = function (req, res) {
    Game.findOne({shortcode: req.params.gameID}, null, {sort: {createdAt: -1}})
        .then(game => {
            var roles = game.roles;
            console.log(roles);
            Role.find({_id: {$in: roles}})
                .then(rolesList => {
                    //console.log(rolesList);
                    res.status(200).send({
                        players: rolesList
                    });
                }).catch(
                err => {
                    console.log(err)
                    res.status(400).send(err);
                })
        })
        .catch(err => {
            res.status(400).send(err);
        })
};

const getBackground = function (req, res) {
    res.status(200).send("Boeing, the biggest aircraft producer in the world, now faces the most serious challenge" +
        " you have ever faced in the company's history. Your competitor, Airbus, had little market share back in 1990s, " +
        "but it splits the market nearly evenly with you. Moreover, Airbus prepares to launch a new aircraft model, " +
        "which they claim it can carry more payload but consume less fuel. It would cause that Boeing 737's demand " +
        "decreases and more worst, lower stock price. To turn the situation around, you, a group of people from " +
        "different areas, are gathered and assigned a task: develop a new aircraft model which can beat Airbus.");
};

const getRolesInfo = function (req, res) {
    res.status(200).json({
        roles: [
            {
                "title": "Boeing Executive",
                "description": "Oversees the whole 737 MAX project, as well as the other operations occurring within the Boeing company."
            },
            {
                "title": "Aeronautical Engineer",
                "description": "Acts as the project lead for the 737 MAX project, and is responsible for the continuous and stable operation of the 737 MAX in the future."
            },
            {
                "title": "Software Developer",
                "description": "Represents the software development team for the 737 MAX project, and is responsible for technical operation and development of the 737 MAX."
            },
            {
                "title": "FAA Official",
                "description": "Acts as the regulatory body for the 737 MAX project, is responsible for ensuring the project adheres to guidelines."
            },
            {
                "title": "Boeing Pilot",
                "description": "A long-time pilot of Boeing, acts as a lead tester for the 737 MAX project and is responsible for ensuring practical effectiveness of the 737 MAX."
            }
        ]
    });
};

// show all roles in the game
const showAllRoles = function (req, res) {
    Game.findOne({shortcode: req.params.gameID}, null, {sort: {createdAt: -1}})
        .then(game => {
            var roles = game.roles;
            Role.find({_id: {$in: roles}})
                .then(rolesList => {
                    res.status(200).send(rolesList);
                }).catch(
                err => {
                    console.log(err)
                    res.status(400).send(err);
                })
        })
        .catch(err => {
            res.status(400).send(err);
        })
};

const {Mutex} = require('async-mutex');
const chooseRolesMutex = new Mutex();
const chooseRoles = async function (req, res) {
    // 使用互斥锁确保同时只有一个请求在更新数据库。
    const release = await chooseRolesMutex.acquire();
    try {
        // ...原有的 chooseRoles 函数实现...
        Game.findOne({shortcode: req.params.gameID}, null, {sort: {createdAt: -1}})
            .then(game => {
                var player = req.body.name;
                var roleid = game.roles[Number(req.body.roleID)];
                // only the player in the player list can choose a role
                // otherwise the action is invalid
                Role.find({"_id": toObjectId(roleid)})
                    .then(role => {
                        role = role[0]
                        if (game.players.includes(player) && role.isAvailable && !game.playersSel.includes(player)) {
                            role.isAvailable = false;
                            role.player = player;
                            game.playersSel.push(player);
                            game.save();
                            //game.roles[Number(req.body.roleID)] = role;
                            //game.markModified('roles');
                            role.save()
                                .then(doc => {
                                    res.status(200).send(doc);
                                })
                                .catch(error => {
                                    res.status(400).send(error);
                                });
                        } else {
                            //the player not in the game or has selected a role or the role has been taken
                            res.status(403).send("Invalid player or this role has been taken!");
                        }
                    })
                    .catch(err => {
                        res.status(400).send(err);
                    });
            })
            .catch(err => {
                res.status(400).send(err);
            });
        // 在函数末尾，确保释放锁。
        release();
    } catch (error) {
        // 如果发生错误，确保释放锁并向客户端发送错误响应。
        release();
        res.status(500).send("Error occurred: " + error.message);
    }
};

const decisionMutex = new Mutex();
async function makeDecision(req, res) {
    // 使用互斥锁确保同时只有一个请求在更新数据库。
    const release = await decisionMutex.acquire();
    try {
        // ...原有的 makeDecision 函数实现...
        const game = await Game.findOne({shortcode: req.params.gameID}, null, {sort: {createdAt: -1}}).exec()
        let roleID = Number(req.body.roleID)
        let optionID = Number(req.body.optionID)
        console.log("roleID: ", roleID)
        let roleName = game.roles[roleID];
        let finalOptionList = game.finalOptionList;
        let finalOptionID = game.finalOptionID[roleID];
        let questionid = game.currQuestion[roleID];
        const question = await Question.find({"_id": toObjectId(questionid)}).exec()
        let votedCount = game.votedCount;
        let currQuestion = question[0];
        let prevQuestion = question[0];
        if (roleName != null && !currQuestion.votedPlayer.includes(req.body.roleID) && currQuestion.votedCount < currQuestion.expectedCount) {
            currQuestion.votedPlayer.push(roleID);
            currQuestion.votedCount++;
            currQuestion.decisions[roleID] = optionID;
            votedCount++;
            if (currQuestion.votedCount == currQuestion.expectedCount || votedCount == 5) {
                finalOptionID = calculateFinalOption(currQuestion);
                prevQuestion = currQuestion;
                console.log("create new final option: ", finalOptionID);
                finalOption = new FinalOption({
                    questionID: currQuestion.questionID,
                    questionText: currQuestion.question,
                    decisionRoleRelation: [
                        currQuestion.decisions[0],
                        currQuestion.decisions[1],
                        currQuestion.decisions[2],
                        currQuestion.decisions[3],
                        currQuestion.decisions[4]
                    ],
                    finalOptionID: finalOptionID
                })
                console.log("create successfully");
                console.log(finalOption)
                finalOption.save();
                console.log("save successfully");
                finalOptionList.push(finalOption._id);
                let option = await Option.findOne({optionID: finalOptionID})
                let next = await Question.find({questionID: option.next})

                currQuestion = next[0];

                //update the Company value
                let company = await Company.findOne({_id: toObjectId(game.companyState)})

                company.contracts = option.consequences.contracts + company.contracts ,
                    company.compContracts = option.consequences.compContracts + company.compContracts,
                    company.shares = option.consequences.shares + company.shares,

                    company.publicRep = option.consequences.publicRep + company.publicRep,
                    company.regulatorRep = option.consequences.regulatorRep + company.regulatorRep,
                    company.internalRep = option.consequences.internalRep + company.internalRep,
                    company.voardRep = option.consequences.voardRep + company.voardRep,
                    company.enviroRep = option.consequences.enviroRep + company.enviroRep,

                    company.expectedProg = option.consequences.expectedProg + company.expectedProg,
                    company.actualProg = option.consequences.actualProg + company.actualProg,
                    company.expectedCost = option.consequences.expectedCost + company.expectedCost,
                    company.actualCost = option.consequences.actualCost + company.actualCost

                let result = await company.save();

                // personal question answered
                if (prevQuestion.expectedCount == 1) {
                    let doc = await Game.findOneAndUpdate(
                        {shortcode: req.params.gameID},
                        {
                            "$set":
                                {
                                    finalOptionList: finalOptionList,
                                    [`prevQuestion.${roleID}`]: prevQuestion,
                                    [`finalOptionID.${roleID}`]: finalOptionID,
                                    [`currQuestion.${roleID}`]: currQuestion,
                                    votedCount: votedCount,
                                }
                        },
                        {new: true}
                    )
                    console.log("update personal question with option: ", finalOptionID)
                    console.log("voted count: ", votedCount)
                    if (votedCount == 5) {
                        votedCount = 0;
                        let doc = await Game.findOneAndUpdate(
                            {shortcode: req.params.gameID},
                            {
                                "$set":
                                    {
                                        status: ["post", "post", "post", "post", "post"],
                                        votedCount: votedCount,
                                    }
                            },
                            {new: true}
                        )
                    }

                }
                // general question answered
                if (prevQuestion.expectedCount == 5) {
                    let doc = await Game.findOneAndUpdate(
                        {shortcode: req.params.gameID},
                        {
                            "$set":
                                {
                                    finalOptionList: finalOptionList,
                                    prevQuestion: [prevQuestion, prevQuestion, prevQuestion, prevQuestion, prevQuestion],
                                    finalOptionID: [finalOptionID, finalOptionID, finalOptionID, finalOptionID, finalOptionID],
                                    currQuestion: [currQuestion, currQuestion, currQuestion, currQuestion, currQuestion],
                                    votedCount: votedCount,
                                }
                        },
                        {new: true}
                    )
                    console.log("update general question with option: ", finalOptionID)
                    console.log("voted count: ", votedCount)
                    if (votedCount == 5) {
                        votedCount = 0;
                        let doc = await Game.findOneAndUpdate(
                            {shortcode: req.params.gameID},
                            {
                                "$set":
                                    {
                                        status: ["post", "post", "post", "post", "post"],
                                        votedCount: votedCount,
                                    }
                            },
                            {new: true}
                        )
                    }
                }
            } else {
                let doc = await Game.findOneAndUpdate(
                    {shortcode: req.params.gameID},
                    {votedCount: votedCount},
                    {new: true}
                )
            }
            console.log("current game voted: ", game.votedCount)
            res.status(200).send({
                roleID: req.body.roleID,
                gameID: game.shortcode,
                status: game.status[roleID]
            })
        } else {
            if (currQuestion.votedPlayer.includes(req.body.roleID)) {
                res.status(400).send("This player has already voted");
                console.log(currQuestion.votedPlayer);
            } else if (currQuestion.votedCount > 5) {
                res.status(400).send("Error: invalid number of players");
                console.log(currQuestion.votedCount);
            } else if (roleName == null) {
                res.status(400).send("Error: invalid role name");
                console.log(error)
            } else {/* in fact will not reach this line
                when status==post, frontend will call another API*/
                res.status(400).send("Error");
            }
        }
        // 在函数末尾，确保释放锁。
        release();
    } catch (error) {
        // 如果发生错误，确保释放锁并向客户端发送错误响应。
        release();
        res.status(500).send("Error occurred: " + error.message);
    }
};

async function getRoundDescription(req, res) {
    try {
        const game = await Game.findOne({shortcode: req.params.gameID}, null, {sort: {createdAt: -1}}).exec()
        let roleID = Number(req.query.roleID)
        let questionid = game.currQuestion[roleID]
        let question = await Question.find({"_id": toObjectId(questionid)}).exec()
        question = question[0]
        if (question.questionID == -1) {
            res.status(200).json({
                questionID: -1 //option8 for question2 has been marked as the a final option
            });
        } else {
            const options = await Option.find({optionID: {$in: question.options}})
            //console.log("found options")
            res.status(200).json({
                questionID: question.questionID,
                background: question.background,
                roleinfo: question.roleInfo[roleID],
                question: question.question,
                options: options
            })
        }
    } catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
};

async function getRoundOutcome(req, res) {
    /*
    {"questionID":1,
    "question":"Should we build an expensive new software module to help avoid potential issues with the sensor?"
    "options":[{"id": 1, "text": "Develop new module"},{"id": 2, "text", "Do not develop new module"}]
    "result": 2
    "outcome":
    ["First paragraph. The decision has been made not to develop this new module.",
     "Another paragraph. While the Aeronautical Engineer wanted this module to be developed, the other four decided this was not necessary."]
     } */
    try {
        let roleID = Number(req.query.roleID)
        console.log("o roleID: ", roleID)
        let game = await Game.findOneAndUpdate({shortcode: req.params.gameID},
            {
                "$set":
                    {
                        [`status.${roleID}`]: "pre",
                    }
            }, {new: true})
        let questionid = game.prevQuestion[roleID]
        let question = await Question.find({"_id": toObjectId(questionid)}).exec()
        currQuestion = question[0]
        let finalOptionID = game.finalOptionID[roleID];
        console.log("finalOptionID List: ", game.finalOptionID)
        console.log("finalOptionID: ", finalOptionID)
        let options = await Option.find().where('optionID').in(currQuestion.options).exec();
        let finalOption = await options.find(option => option.optionID == finalOptionID);
        res.status(200).json({
            questionID: currQuestion.questionID,
            question: currQuestion.question,
            options: options,
            result: finalOption,
            outcome: finalOption.outcomeText
        })
    } catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
};

async function getRoundStatus(req, res) {
    // TODO {"questionID":1,"status":"pre","voted":2",remaining":3}
    try {
        const game = await Game.findOne({shortcode: req.params.gameID}, null, {sort: {createdAt: -1}}).exec()
        let roleID = Number(req.query.roleID)
        let questionid = game.currQuestion[roleID]
        let question = await Question.find({"_id": toObjectId(questionid)}).exec()
        question = question[0]
        console.log("game id: ", game.shortcode)
        console.log("game status: ", game.status)
        console.log()
        res.status(200).json({
            questionID: question.questionID,
            status: game.status[roleID],
            voted: question.votedCount,
            remaining: question.expectedCount - question.votedCount
        });
    } catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
};

const getGameOutcome = function (req, res) {
    Game.findOne({shortcode: req.params.gameID}, null, {sort: {createdAt: -1}})
        .then(game => {

            Company.findOne({_id: toObjectId(game.companyState)})
                .then(company => {
                    var outcomeid = 0
                    let contracts = company.contracts;
                    let compContracts = company.compContracts
                    /** TODO:
                     Should be expanded with more rules in future development
                     */
                    if (contracts <= 30 || compContracts >= 150) {
                        outcomeid = 1;
                    } else {
                        if (actualProg >= 170 && actualCost >= 180) {
                            outcomeid = 2;
                        } else if (actualProg >= 150 && actualProg < 170 && actualCost >= 160 && actualCost < 180 && compContracts >= 120 && compContracts < 150) {
                            outcomeid = 3;
                        } else if (actualProg >= 130 && actualProg < 150 && actualCost >= 140 && actualCost < 160 && compContracts >= 100 && compContracts < 120) {
                            outcomeid = 4;
                        } else if (actualProg < 130 && actualCost < 140 && compContracts < 100) {
                            outcomeid = 5;
                        }
                    }
                    Outcome.findOne({outcomeID: outcomeid})
                        .then(outcomes => {

                            res.status(200).json({
                                outcome: outcomes.gameOutcome,
                                roleOutcome: outcomes.roleOutcome
                            });
                        })
                        .catch(error => {
                            res.status(400).send(error);
                        })

                })
        })
        .catch(error => {
            res.status(400).send(error);
        })


};

function calculateFinalOption(currQuestion) {
    let numOptions = currQuestion.options.length;
    //calculate the total weights for all options
    for (var i = 0; i < numOptions; i++) {
        for (var j = 0; j < currQuestion.decisions.length; j++) {
            if (currQuestion.decisions[j] == currQuestion.options[i]) {
                if (currQuestion.weights[i] == 0) {
                    currQuestion.weights[i] = 1;
                }
                currQuestion.optionsFinalWeights[i] = currQuestion.optionsFinalWeights[i] + currQuestion.weights[j];
            }

        }
    }
    console.log(currQuestion.optionsFinalWeights[0], currQuestion.optionsFinalWeights[1]);
    //find the index of the final option chosen
    let finalIndex = 0;
    if (numOptions > 1) {
        for (var i = 0; i < numOptions; i++) {
            if (currQuestion.optionsFinalWeights[i] > currQuestion.optionsFinalWeights[finalIndex]) {
                finalIndex = i;
            }
        }
    }

    var finalOption;

    let optionID = currQuestion.options[finalIndex];
    return optionID;
}

const fetchDecision = function (req, res) {
    let reflectionList = []
    let executive, engineer, developer, offical, pilot = null;
    let questions = Game.findOne({shortcode: req.params.gameID}, null, {sort: {createdAt: -1}})
        .then(game => {
            let players = game.roles // a list of string, object Role's id
            /* {"reflectionList":
                [{"questionID": 1,
                 "questionText": "Do we need to halt development in order to further investigate the AoA sensor?"
                 "options":
                      [{"id": 1,
                        "text": "Halt development",
                        "users": [{"name": "hh", "role": "Aeronautical Engineer"},{"name": "Emily", "role": "Software Developer"}]},
                       {"id": 2,
                        "text": "Continue Development",
                        "users": [{"name": "Steve", "role": "Executive"},{"name": "Ming", "role": "Pilot"},{"name": "Georgia", "role": "FAA Official"}]}],
                 "result": 1},
                {"questionID": 2,
                 "questionText": "should we build an expensive new software module to help avoid potential issues with the sensor?"
                 "options":
                    [{"id": 1,
                      "text": "Develop new module",
                      "users": [{"name": "hh", "role": "Aeronautical Engineer"}]},
                    {"id": 2,
                     "text": "Do not develop new module",
                     "users": [{"name": "Steve", "role": "Executive"},{"name": "Ming", "role": "Pilot"},{"name": "Georgia", "role": "FAA Official"},{"name": "Emily", "role": "Software Developer"}]}],
                 "result": 2},
                ]}*/
            // get the player and their corresponding roles
            players.forEach(function (value, index) {
                Role.findOne({"_id": value}, null, {sort: {createdAt: -1}})
                    .then(role => {
                        switch (role.role) {
                            case "Aeronautical Engineer":
                                engineer = role.player;
                                break;
                            case "Boeing Executive":
                                executive = role.player;
                                break;
                            case "Boeing Pilot":
                                pilot = role.player;
                                break;
                            case "FAA Official":
                                offical = role.player;
                                break;
                            case "Software Developer":
                                developer = role.player;
                                break;
                            default:
                                break;
                        }
                    })
            })

            // get the player and their decisions
            let finaloptions = game.finalOptionList.map((finalOption) => {
                return FinalOption.findOne({_id: finalOption})
            })
            return Promise.all(finaloptions);
        })
        .catch(err => {
            res.status(400).send(err);
        })
    let decisions = null;
    questions.then(finalOptionList => {
        let reflection = [];
        Promise.all(finalOptionList.map(async (finalOption) => {
            let questionJson = {
                id: finalOption.questionID,
                text: finalOption.questionText,
                options: [],
                result: finalOption.finalOptionID
            }
            let optionJson = [];
            let options = finalOption.decisionRoleRelation.map((optionId, index) => {
                if (optionJson.filter(o => {
                    return o.id == optionId
                }).length === 0) {
                    optionJson.push({
                        id: Number(optionId),
                        text: "",
                        users: []
                    })
                }
                let decision = optionJson.filter(d => {
                    return d.id === Number(optionId);
                })
                switch (index) {
                    case 0:
                        decision[0].users.push({name: executive, role: "Boeing Executive"});
                        break;
                    case 1:
                        decision[0].users.push({name: engineer, role: "Aeronautical Engineer"});
                        break;
                    case 2:
                        decision[0].users.push({name: developer, role: "Software Developer"});
                        break;
                    case 3:
                        decision[0].users.push({name: offical, role: "FAA Official"});
                        break;
                    case 4:
                        decision[0].users.push({name: pilot, role: "Boeing Pilot"});
                        break;
                    default:
                        break;
                }
                console.log("before")
                console.log(optionJson)
                optionJson.map(item => {
                    if (item.id == optionId) {
                        item = decision[0]
                    }
                })
                //optionJson[id] = decision[0];
                console.log("after")
                console.log(optionJson)
            });
            questionJson.options = optionJson;
            const optionPlayers = questionJson.options.map((option) => {
                return Option.findOne({optionID: option.id});
            });
            await Promise.all(optionPlayers).then(values => {
                values.forEach((option, index) => {
                    questionJson.options[index].text = option.description;
                });
            }).then(reflection.push(questionJson))

        })).then(() => {
            // Sort the options objects in assending order of id field
            reflection.map((elem) => elem.options = _.sortBy(elem.options, ['id']));
            res.send({reflection})
        })
    });
}

async function getRoundLevel(req, res) {
    try {
        const game = await Game.findOne({shortcode: req.params.gameID}, null, {sort: {createdAt: -1}}).exec()
        let roleID = Number(req.query.roleID)
        let questionid = game.currQuestion[roleID]
        let question = await Question.find({"_id": toObjectId(questionid)}).exec()
        question = question[0]

        res.status(200).json({
            questionID: question.questionID,
            currentLevel: question.questionID.toString()[2],
        });
    } catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
}

function toObjectId(string) {
    return mongoose.Types.ObjectId(string);
}

module.exports = {
    newGame,
    joinGame,
    getPlayerStatus,
    getGameStatus,
    getBackground,
    getRolesInfo,
    showAllRoles,
    chooseRoles,
    makeDecision,
    getRoundDescription,
    getRoundOutcome,
    fetchDecision,
    readyToDiscuss,
    getRoundStatus,
    getGameOutcome,
    getRoundLevel
};