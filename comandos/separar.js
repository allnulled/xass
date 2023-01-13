// @TODOS:
//  [ ] Parametrizar (por defecto 50%/50%) la carga del movimiento lateral (--carga-izquierda 50 --carga-derecha 50)
//    [ ] Por tanto, computar la separación necesaria y mínima para que termine siendo la separación
//    [ ] En casos de aglutinamiento, se recomienda balancear la carga a 1 lado
//  [ ] Aplicar las clases a los 2 subtítulos
//  [ ] ...

/**
 * 
 * Notas para entender el estado de este script. Si quieres ir rápido, ves al FORMULARIO FINAL directamente.
 * 
 * -----------------------------------
 * LOS PROBLEMAS
 * -----------------------------------
 * 
 * Hay 'condiciones peligrosas' que no son gestionadas de forma especial:
 *      a) Cuando:
 *          (1) el final de un subtítulo anterior en el documento
 *          (2) acaba dejando un espacio de tiempo menor al mínimo con otro subtítulo
 *          (3) pero desapareciendo después y no antes de aparecer el siguiente subtítulo:
 *              => En este caso, se mueve de la misma forma, el principio del segundo subtítulo, la franja del margen mínimo, hacia la derecha.
 *      b) Cuando:
 *          (1) hay aglutinamiento de proximidad de subtítulos en el tiempo, por ejemplo, [a:0.1, b:0.2, c:0.3, d:0.4]
 *              => En este caso, cada solapamiento considerará el subtítulo anterior más próximo, y se modificará igual, moviendo el principio del segundo subtítulo, la franja del margen mínimo, hacia la derecha.
 *      c) No permite decidir qué lado carga con la diferencia, ni cuánto. Ahora toda la carga la corrige el segundo subtítulo, moviendo su principio, exactamente, el margen mínimo.
 *      d) La carga siempre resulta, indiferentemente de la distancia de tiempo con respecto a los subtítulos concomitantes, en un movimiento del principio del segundo subtítulo, hacia la derecha, por tanto como el margen mínimo. Quizá lo más deseable fuera completar la distancia respectiva con el anterior para formar el margen mínimo.
 *      e) Los filtros de clases, inclusivos y exclusivos, solo se aplican con respecto al subtítulo de la derecha del solapamiento, esto es: si el subtítulo que se solapa es el de la izquierda, el programa permite el cambio, porque solo va a cambiar el de la derecha. Esto quizá tampoco sea lo más deseable.
 * Estas features no se han cerrado para así poder saber qué se quiere conseguir antes de limitar el algoritmo o complicarlo de más.
 *
 * -----------------------------------
 * LAS SOLUCIONES
 * -----------------------------------
 * 
 * Mi propuesta, o lo que me parece más coherente con la poca información que tengo es:
 *  (A) El problema (a) no creo que haya que meterse. Si hay subtítulos que desaparecen después de que subtítulos posteriores aparezcan, pues será por algo, no sé: efectos de puertas, cosas así, imagino. Ahora mismo, muevo igual el segundo subtítulo. Creo que lo suyo sería que mirara si es este el caso, y no lo moviera, porque si forma parte de algún efecto, tendría que ir sincronizado.
 *  (B) El problema (b) de que se aglutinen subtítulos, pienso que puede ser parte de lo mismo. Ahora mismo, cada subtítulo, independientemente, busca al anterior que se le solape, y si lo encuentra, aplica la separación, y sigue con el siguiente. Lo de desaglutinar, puede ser muy complejo, yo no me metería ahí.
 *  (C) El problema (c) de cómo distribuir el cambio para separarlos, lo podemos poner por parámetro y con porcentajes (ej: --carga-izquierda 20 / --carga-derecha 80 ) o podemos dejarlo tal cual está, que es moviendo el subtítulo de la derecha.
 *  (D) El problema (d) de cómo completar la separación, podría calcularse la diferencia con el subtítulo anterior para formar el margen mínimo de espacio, o dejarse así, que es: mover brutamente el margen mínimo del principio del segundo subtítulo hacia la derecha. Supongo que lo más fino es calcularlo.
 *  (E) El problema (e) de si aplicar los filtros de estilos también al subtítulo que no va a recibir alteraciones PERO interviene en el solapamiento, puede incorporarse como opción, o dejarse así (solo aplica la regla contra el subtítulo alterado) o cambiarse (aplica la regla contra el subtítulo anterior y el alterado). En este caso, yo intuitivamente aplicaría filtros a todo y no solo al nodo que altero (también al que interviene), pero no sé.
 * Como unas features dependen de otras, quería aclarar antes qué se quiere esperar del programa.
 *
 * -----------------------------------
 * FORMULARIO FINAL
 * -----------------------------------
 *
 * Para abreviar el resumen/feedback, se presentan las opciones a los problemas:
 * 
 *  (A) Opción 1: No meterse.
 *      Opción 2: Personalizable.
 * 
 *  (B) Opción 1: No meterse.
 *      Opción 2: Personalizable.
 * 
 *  (C) Opción 1: Parametrizar la carga de separación lateral con --carga-izquiera 50% / --carga-derecha 50%.
 *      Opción 2: Dejarlo cargando la derecha el 100%.
 * 
 *  (D) Opción 1: Cambiarlo para calcular la diferencia con respecto al anterior y aplicar lo necesario para espaciar con el margen mínimo.
 *      Opción 2: Dejarlo aplicando brutamente el margen mínimo.
 *
 *  (E) Opción 1: Cambiarlo para que las reglas de inclusión y exclusión por estilos se apliquen al subtítulo A y B; y no solo al B que es el que soporta el movimiento, que es como ahora está.
 *      Opción 2: Dejarlo aplicando las reglas de estilos solo al subtítulo B, el que muta sus tiempos.
 *
 * -----------------------------------
 * Por: allnulled 
 * -----------------------------------
 */

let debug_local = undefined;

const prepad = function(txt, len = 2, ch = "0") {
    let output = "" + txt;
    while(output.length < len) {
        output = ch + output;
    }
    return output;
};

const FECHA_INICIAL = new Date();
FECHA_INICIAL.setFullYear(0);
FECHA_INICIAL.setMonth(0);
FECHA_INICIAL.setDate(0);
FECHA_INICIAL.setHours(0);
FECHA_INICIAL.setMinutes(0);
FECHA_INICIAL.setSeconds(0);
FECHA_INICIAL.setMilliseconds(0);

const de_timestamp_a_fecha = timestamp => { 
    const [hh,mm,ss,cs] = timestamp.split(/\:|\./g).map(e => parseFloat(e));
    const nueva_fecha = new Date(FECHA_INICIAL);
    nueva_fecha.setFullYear(0);
    nueva_fecha.setMonth(0);
    nueva_fecha.setDate(0);
    nueva_fecha.setHours(hh);
    nueva_fecha.setMinutes(mm);
    nueva_fecha.setSeconds(ss);
    const ms = prepad(cs) + "0";
    nueva_fecha.setMilliseconds(ms);
    return nueva_fecha;
};

const de_fecha_a_timestamp = fecha => {
    const ms = prepad(Math.round(fecha.getMilliseconds() / 10), 2);
    return `${ prepad(fecha.getHours(), 1) }:${ prepad(fecha.getMinutes()) }:${ prepad(fecha.getSeconds()) }.${ ms }`;
};

const incrementa_diferencia_minima = function (estructura, sectionIndex, bodyIndex, diferencia_en_milisegundos, diferencia_anterior) {
    if (typeof estructura[sectionIndex].body[bodyIndex].value.Start === "undefined") {
        return;
    }
    const valor_original = estructura[sectionIndex].body[bodyIndex].value.Start;
    let [hh,mm,ss,sss] = valor_original.split(/\:|\./g).map(e => parseFloat(e));
    const fecha_temp = de_timestamp_a_fecha(valor_original);
    fecha_temp.setMilliseconds(fecha_temp.getMilliseconds() + diferencia_en_milisegundos);
    estructura[sectionIndex].body[bodyIndex].value.Start = de_fecha_a_timestamp(fecha_temp);
    return;
};

const coincide_regex = function(texto, patron) {
    debug_local("coincide_regex:", texto, patron);
    const posInicial = patron.indexOf("/");
    const posFinal = patron.length - (patron.split("").reverse().join("").indexOf("/"));
    const regexContent = patron.substring(posInicial, posFinal);
    const regexFlags = patrons.substr(posFinal);
    const regexp = new RegExp("^" + regexContent + "$", regexFlags);
    return texto.match(regexp);
};

const coincide_patron = function(texto, patron) {
    if(patron.startsWith("/")) {
        return coincide_regex(texto, patron);
    } else {
        return texto === patron;
    }
};

module.exports = function(args, utils) {
    const { debug, die } = utils;
    debug_local = debug;
    let {
        separacion = "0.17",
        incluirEstilo = undefined,
        excluirEstilo = undefined,
    } = args;
    const separacionFloat = parseFloat(separacion) * 100;
    const separacionFloatMs = separacionFloat * 10;
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
                if (typeof subtitle.value.Start === "undefined") {
                    continue Iterando_comentarios;
                }
                const previousStart = subtitle.value.Start;
                const momentoInicio = de_timestamp_a_fecha(previousStart);
                
                for(let index = finales_anteriores.length - 1; index >= 0; index--) {
                    const [ momentoFinal, subtitulo_anterior, seccion_subtitulo_anterior ] = finales_anteriores[index];
                    const milisegundos_de_diferencia = momentoInicio - momentoFinal;
                    Gestionando_patron:
                    if ((milisegundos_de_diferencia < separacionFloatMs) && (milisegundos_de_diferencia >= (-separacionFloatMs)) && seccion_subtitulo_anterior === seccion) {
                        if (typeof excluirEstilo === "string") {
                            if (coincide_patron(subtitle.value.Style, excluirEstilo)) {
                                break Gestionando_patron;
                            } else {
                                // @OK...
                            }
                            /*
                            // No se comprueba el estilo del anterior (porque no es el que se modifica):
                            if (coincide_patron(subtitulo_anterior.value.Style, excluirEstilo)) {
                                break Gestionando_patron;
                            } else {
                                // 
                            }
                            //*/
                        }
                        if (typeof incluirEstilo === "string") {
                            if (coincide_patron(subtitle.value.Style, incluirEstilo)) {
                                // @OK...
                            } else {
                                break Gestionando_patron;
                            }
                            /*
                            // No se comprueba el estilo del anterior (porque no es el que se modifica):
                            if (coincide_patron(subtitulo_anterior.value.Style, incluirEstilo)) {
                                // 
                            } else {
                                break Gestionando_patron;
                            }
                            //*/
                        }
                        incrementa_diferencia_minima(estructura, sectionIndex, bodyIndex, separacionFloatMs, milisegundos_de_diferencia);
                        const currentStart = estructura[sectionIndex].body[bodyIndex].value.Start;
                        debug({
                            "Subtítulo A": {
                                "Valor de: «Style»": subtitulo_anterior.value.Style,
                                "Valor de: «End»": subtitulo_anterior.value.End,
                                "Tiempo de diferencia": `${milisegundos_de_diferencia} milisegundos después`,
                            },
                            "Subtítulo B": {
                                "Valor de «Style»": subtitle.value.Style,
                                "Valor de «Start»": previousStart,
                                "Valor de «Start» nuevo": subtitle.value.Start,
                            }
                        });
                        estadisticas.total++;
                        continue Iterando_comentarios;
                    }
                }
                if (typeof subtitle.value.End === "undefined") {
                    continue Iterando_comentarios;
                }
                finales_anteriores.push([ de_timestamp_a_fecha(subtitle.value.End), subtitle, seccion ]);
            }
        }
        const contenido_modificado = require("ass-stringify")(estructura);
        require("fs").writeFileSync(ruta, contenido_modificado, "utf8");
    }
    debug(`· Corregidos «${estadisticas.total}» solapamientos entre subtítulos.`)
};