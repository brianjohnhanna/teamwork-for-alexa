/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/

'use strict';
const Alexa = require('alexa-sdk');
const Data = require('./data');

const APP_ID = 'amzn1.ask.skill.6d69b80a-34ed-4c2a-88de-91fcdbc39c6f';

const SKILL_NAME = 'Teamwork Unofficial';
const HELP_MESSAGE = 'You can say give me projects, or, you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

const handleError = (error) => {
    this.response.cardRenderer(SKILL_NAME, 'There was an error. Sorry.')
    this.response.speak('There was an error. Sorry.')
    this.emit(':responseReady')
}

const handlers = {
    'LaunchRequest': function () {
        this.emit('ProjectsIntent');
    },
    'ProjectsIntent': function () {
        Data.getProjectCompanyNames().then((response) => {
            this.response.cardRenderer(SKILL_NAME, response.join('\n'))
            this.response.speak(`There are ${response.length} companies with currently active projects.`)
            this.emit(':responseReady')
        }).catch(error => {
            this.response.cardRenderer(SKILL_NAME, 'There was an error. Sorry.')
            this.response.speak('There was an error. Sorry.')
            this.emit(':responseReady')
        })
    },
    'TasksByCompanyIntent': function () {
        const input = this.event.request.intent.slots.company.value
        Data.searchCompanies(input).then((result) => {
            if (!result) {
                this.response.cardRenderer(SKILL_NAME, 'No company found...')
                this.response.speak("Sorry, I couldn't find any company by that name.")
                this.emit(':responseReady')
            } else {
                const company = result
                Data.getCompanyTasks(company.id).then(projects => {
                    this.response.cardRenderer(SKILL_NAME, projects.map(project => project.name).join('\n'))
                    this.response.speak(`There are ${projects.length} projects for ${company.name}`)
                    this.emit(':responseReady')
                })
            }
        }).catch(error => {
            console.log(error)
            this.response.cardRenderer(SKILL_NAME, 'There was an error. Sorry.')
            this.response.speak('There was an error. Sorry.')
            this.emit(':responseReady')
        })
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt)
        this.emit(':responseReady')
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(STOP_MESSAGE)
        this.emit(':responseReady')
    },
    'AMAZON.StopIntent': function () {
        this.response.speak(STOP_MESSAGE)
        this.emit(':responseReady')
    },
};
