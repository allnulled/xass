let debug_local = undefined;

const prepad = function(txt, len = 2, ch = "0") {
    let output = "" + txt;
    while(output.length < len) {
        output = ch + output;
    }
    return output;
};

const incrementa_diferencia_minima = function (estructura, sectionIndex, bodyIndex, diferencia) {
    if (typeof estructura[sectionIndex].body[bodyIndex].value.Start === "undefined") {
        return;
    }
    let [hh,mm,ss,sss] = estructura[sectionIndex].body[bodyIndex].value.Start.split(/\:|\./g).map(e => parseFloat(e));
    sss += diferencia;
    const sss_pasa_la_unidad = (sss / 100) > 1;
    if(sss_pasa_la_unidad) {
        sss -= 100;
        ss += 1;
    }
    const ss_pasa_la_unidad = (ss / 60) > 1;
    if (ss_pasa_la_unidad) {
        ss -= 60;
        mm += 1;
    }
    const mm_pasa_la_unidad = (mm / 60) > 1;
    if (mm_pasa_la_unidad) {
        mm -= 60;
        hh += 1;
    }
    estructura[sectionIndex].body[bodyIndex].value.Start = `${prepad(hh, 1)}:${prepad(mm)}:${prepad(ss)}.${prepad(sss)}`;
};

const COINCIDE_REGEX = function(texto, patron) {
    debug_local("COINCIDE_REGEX:", texto, patron);
    const posInicial = patron.indexOf("/");
    const posFinal = patron.length - (patron.split("").reverse().join("").indexOf("/"));
    const regexContent = patron.substring(posInicial, posFinal);
    const regexFlags = patrons.substr(posFinal);
    const regexp = new RegExp("^" + regexContent + "$", regexFlags);
    return texto.match(regexp);
};

const COINCIDE_PATRON = function(texto, patron) {
    if(patron.startsWith("/")) {
        return COINCIDE_REGEX(texto, patron);
    } else {
        return texto === patron;
    }
};

module.exports = function(args, utils) {
    const { debug, die } = utils;
    debug_local = debug;
    let { separacion = "0.17", incluirEstilo = undefined, excluirEstilo = undefined } = args;
    const separacionFloat = parseFloat(separacion) * 100;
    const ficheros = args._;
    const finales_anteriores = [];
    const estadisticas = { total: 0 };
    for(let index = 0; index < ficheros.length; index++) {
        const fichero = ficheros[index];
        const ruta = require("path").resolve(fichero);
        const contenido = require("fs").readFileSync(ruta).toString();
        const estructura = require("ass-parser")(contenido);
        debug(`· Separando comentarios en fichero [${index + 1}/${args._.length}]: ${ruta}`);
        Iterando_secciones:
        for(let sectionIndex = 0; sectionIndex < estructura.length; sectionIndex++) {
            const seccion = estructura[sectionIndex];
            Iterando_comentarios:
            for(let bodyIndex = 0; bodyIndex < seccion.body.length; bodyIndex++) {
                const subtitle = seccion.body[bodyIndex];
                const subtitleStart = subtitle.value.Start;
                Gestionando_patron:
                if(finales_anteriores.indexOf(subtitleStart) !== -1) {
                    if (typeof excluirEstilo === "string") {
                        if (COINCIDE_PATRON(subtitle.value.Style, excluirEstilo)) {
                            break Gestionando_patron;
                        } else {
                            // 
                        }
                    }
                    if (typeof incluirEstilo === "string") {
                        if (COINCIDE_PATRON(subtitle.value.Style, incluirEstilo)) {
                            // 
                        } else {
                            break Gestionando_patron;
                        }
                    }
                    incrementa_diferencia_minima(estructura, sectionIndex, bodyIndex, separacionFloat);
                    debug(`  · [SOLAPAMIENTO] @sección={${sectionIndex}:${seccion.section}} @subtítulo={${bodyIndex}:${subtitle.key}} @estilo={${subtitle.value.Style}} @antes=[${subtitleStart}] @ahora=[${estructura[sectionIndex].body[bodyIndex].value.Start}]`);
                    estadisticas.total++;
                }
                const subtitleEnd = subtitle.value.End;
                finales_anteriores.push(subtitleEnd);
            }
        }
        const contenido_modificado = require("ass-stringify")(estructura);
        require("fs").writeFileSync(ruta, contenido_modificado, "utf8");
    }
    debug(`· Corregidos «${estadisticas.total}» solapamientos entre subtítulos.`)
};