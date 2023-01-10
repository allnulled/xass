// Un test simplito:
if (require("fs").readFileSync(__dirname + "/test.report.txt").toString().indexOf("[DEBUG] · Corregidos «9» solapamientos entre subtítulos.") === -1) {
    console.log("El reporte del test es incorrecto, hubo errores en el test.");
} else {
    console.log("Test pasado correctamente");
}