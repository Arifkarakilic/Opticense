const { CargoManager } = require('./cargoManager');
const {NodeManager}= require('./nodeManager');
const {NugetManager} = require('./nugetManager');
const {PipManager} = require('./pipManager');

module.exports = {
    NodeManager,
    NugetManager,
    CargoManager,
    PipManager,
}