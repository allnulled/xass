const utils = {};

Object.assign(utils, {

    debug: function (obj, ...args) {
        console.log("[DEBUG]", JSON.stringify(obj, null, 2), ...args);
    },

    die: function (...args) {
        console.log("[DIE]", ...args);
        process.exit(0);
    },

    Interrupcion_de_patron: function () {
        return this;
    },

    prepad: function (txt, len = 2, ch = "0") {
        let output = "" + txt;
        while (output.length < len) {
            output = ch + output;
        }
        return output;
    },

    FECHA_INICIAL: (function () {
        const FECHA_INICIAL = new Date();
        FECHA_INICIAL.setFullYear(0);
        FECHA_INICIAL.setMonth(0);
        FECHA_INICIAL.setDate(0);
        FECHA_INICIAL.setHours(0);
        FECHA_INICIAL.setMinutes(0);
        FECHA_INICIAL.setSeconds(0);
        FECHA_INICIAL.setMilliseconds(0);
        return FECHA_INICIAL;
    })(),

    cronometro: function() {
        const inicio = new Date();
        return {
            tiempo: function() {
                return (new Date()) - inicio;
            }
        };
    },

    de_timestamp_a_fecha: function (timestamp) {
        const [hh, mm, ss, cs] = timestamp.split(/\:|\./g).map(e => parseFloat(e));
        const nueva_fecha = new Date(utils.FECHA_INICIAL);
        nueva_fecha.setFullYear(0);
        nueva_fecha.setMonth(0);
        nueva_fecha.setDate(0);
        nueva_fecha.setHours(hh);
        nueva_fecha.setMinutes(mm);
        nueva_fecha.setSeconds(ss);
        const ms = utils.prepad(cs) + "0";
        nueva_fecha.setMilliseconds(ms);
        return nueva_fecha;
    },

    de_fecha_a_timestamp: function (fecha) {
        const miliseconds = Math.round(parseInt(utils.prepad(fecha.getMilliseconds(), 3)) / 10);
        const ms = utils.prepad(miliseconds, 2);
        return `${utils.prepad(fecha.getHours(), 1)}:${utils.prepad(fecha.getMinutes())}:${utils.prepad(fecha.getSeconds())}.${ms}`;
    },

    coincide_regex: function (texto, patron) {
        debug_local("coincide_regex:", texto, patron);
        const posInicial = patron.indexOf("/");
        const posFinal = patron.length - (patron.split("").reverse().join("").indexOf("/"));
        const regexContent = patron.substring(posInicial, posFinal);
        const regexFlags = patrons.substr(posFinal);
        const regexp = new RegExp("^" + regexContent + "$", regexFlags);
        return texto.match(regexp);
    },

    coincide_patron: function (texto, patron) {
        if (patron.startsWith("/")) {
            return utils.coincide_regex(texto, patron);
        } else {
            return texto === patron;
        }
    },

    iniciar_servidor: function() {
        
    }

});

module.exports = utils;