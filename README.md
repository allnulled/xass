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

> Consiste en aplicar una separación entre el final de un subtítulo y el principio de otro, en los casos en que ambos valores coinciden.

**Parámetros:**
  - `--separacion`: número de segundos como intervalo mínimo de diferencia a aplicar. Por defecto: "0.17"
  - `--incluir-estilo`: estilo único al cual se aplica este intervalo. Soporta expresiones regulares cuando sigue el formato: `"/blablabla/g"`.
  - `--excluir-estilo`: estilo único al cual no se aplica este intervalo. Soporta expresiones regulares cuando sigue el formato: `"/blablabla/g"`.

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

----

## Referencias:

  · Github: [https://github.com/allnulled/xass](https://github.com/allnulled/xass)
  · NPM: [https://npmjs.com/@allnulled/xass](https://npmjs.com/@allnulled/xass)
  · Otros: 
    · Comando separar: [./comandos/SEPARAR.md](./comandos/SEPARAR.md)