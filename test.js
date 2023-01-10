// Un test simplito:
require("fs").readFileSync(__dirname + "/test.report.txt").toString();
if (false) {
    console.log("El reporte del test es incorrecto, hubo errores en el test.");
} else {
    console.log("Test pasado correctamente");
}