const utils = require(__dirname + "/utils.js");
const ejecutar = function(comando, args) {
    try {
        const ruta = require("path").resolve(__dirname + "/comandos/" + comando + ".js");
        require(ruta)(args, utils);
    } catch (error) {
        console.log(error);
        require(__dirname + "/comandos/ayuda.js")(args, utils);
    }
};
const obtener_comandos = function() {
    return require("fs").readdirSync(__dirname + "/comandos");
};
const xass = { utils, ejecutar, obtener_comandos };
xass.default = xass;
module.exports = xass;