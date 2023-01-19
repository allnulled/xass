[![npm](https://nodei.co/npm/@allnulled/xass.png)](https://npmjs.com/@allnulled/xass)

# xass

Programa de línea de comandos para modificar ficheros [`.ass (SubStation Alpha)`](https://en.wikipedia.org/wiki/SubStation_Alpha).

## Prerrequisitos:

  · Tener instalado [npm/node](https://nodejs.org/en/download/) y accesible desde línea de comandos.

## Instalación:

Desde la línea de comandos:

```sh
 $  npm install -g @allnulled/xass
```

## Uso:

La sintaxis del comando general es:

```sh
 $  xass -x { comando } { --parametro valor }* { fichero.ass }*
```

## Ejemplo:

Por ejemplo, para separar con `"0.17"` segundos los estilos que coincidan con el estilo `"phone"` en los ficheros `"fichero1.ass"` y `"fichero2.ass"`:

```sh
 $  xass -x separar --separacion "0.17" --incluir-estilo "phone" fichero1.ass fichero2.ass
```

## Comandos:

A continuación se listan todos los comandos que está preparado para correr el programa:

----

### `Comando: xass -x separar`

**Descripción:**

> Consiste en aplicar una separación entre el final de un subtítulo y el principio de otro, en los casos en que ambos valores coinciden o cuya separación en tiempo no supera la **separación mínima entre subtítulos**.

**Parámetros:**
  - `--separacion`: número de segundos como intervalo mínimo de diferencia a aplicar. Por defecto: "0.17". El valor está en centésimas de segundo.
  - `--incluir-estilo`: estilo único al cual se aplica este intervalo. Soporta expresiones regulares cuando sigue el formato: `"/blablabla/g"`.
  - `--excluir-estilo`: estilo único al cual no se aplica este intervalo. Soporta expresiones regulares cuando sigue el formato: `"/blablabla/g"`.
  - `--carga-izquierda`: porcentaje de movimiento que recibe el subtítulo del lado izquierdo del solapamiento. Por defecto: `50`.
  - `--carga-derecha`: porcentaje de movimiento que recibe el subtítulo del lado derecho del solapamiento. Por defecto: `50`.

**Ejemplos:**

```sh
 # Aplicar separación en ficheros:
 $  xass -x separar fichero1.ass fichero2.ass
 # Aplicar separación (de 0.17 segundos) en ficheros:
 $  xass -x separar fichero1.ass fichero2.ass --separacion "0.17"
 # Aplicar separación (de 0.17 segundos) (a estilos que sí sean: "Sign~") en ficheros:
 $  xass -x separar fichero1.ass fichero2.ass --separacion "0.17" --incluir-estilo "/Sign.*/gi"
 # Aplicar separación (de 0.17 segundos) (a estilos que no sean: "phone") en ficheros:
 $  xass -x separar fichero1.ass fichero2.ass --separacion "0.17" --excluir-estilo "phone"
```

**Notas sobre el algoritmo del comando `xass -x separar`:**

 - Sólo hará 1 cambio (en el inicio o en el final) por cada subtítulo por ejecución.
 - Los subtítulos se separan lo justo para que haya la `--separación` mínima establecida como parámetro.
 - La separación puede establecerse según los lados con `--carga-izquierda` y `--carga-derecha`.
 - Los filtros de clases (`--incluir-estilo` y `--excluir-estilo`) se aplican tanto para el subtítulo A como para el B.

----

### `Comando: xass -x interfaz`

**Descripción:**

> Consiste en levantar un servidor y visitarlo con el navegador para poder usar los comandos desde interfaz gráfica.

----

## Referencias:

  - Github: [https://github.com/allnulled/xass](https://github.com/allnulled/xass)
  - NPM: [https://npmjs.com/@allnulled/xass](https://npmjs.com/@allnulled/xass)