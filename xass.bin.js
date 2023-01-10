#!/usr/bin/env node

const args = require("yargs").argv;
const comando = args.x;
const ruta = require("path").resolve(__dirname + "/comandos/" + comando + ".js");
const utils = require(__dirname + "/utils.js");
try {
    require(ruta)(args, utils);
} catch(error) {
    console.log(error);
    require(__dirname + "/comandos/ayuda.js")(args, utils);
}