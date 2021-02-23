const core = require('@actions/core');
const action = require('./action');

action.action().catch(error => {
    core.setFailed(error.message);
});
