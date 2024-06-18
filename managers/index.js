const { CargoManager } = require('./cargo');
const {NodeManager}= require('./node');
const {NugetManager} = require('./nuget');
const {PipManager} = require('./pip');

module.exports = {
    NodeManager,
    NugetManager,
    CargoManager,
    PipManager,
}