  Notas para entender el estado de este script. Si quieres ir rápido, ves al FORMULARIO FINAL directamente.
  
  -----------------------------------
  LOS PROBLEMAS
  -----------------------------------
  
  Hay 'condiciones peligrosas' que no son gestionadas de forma especial:
       
  - a) Cuando:
    - (1) el final de un subtítulo anterior en el documento
    - (2) acaba dejando un espacio de tiempo menor al mínimo con otro subtítulo
    - (3) pero desapareciendo después y no antes de aparecer el siguiente subtítulo:
      - => En este caso, se mueve de la misma forma, el principio del segundo subtítulo, la franja del margen mínimo, hacia la derecha.

  - b) Cuando:
    - (1) hay aglutinamiento de proximidad de subtítulos en el tiempo, por ejemplo, [a:0.1, b:0.2, c:0.3, d:0.4]
      - => En este caso, cada solapamiento considerará el subtítulo anterior más próximo, y se modificará igual, moviendo el principio del segundo subtítulo, la franja del margen mínimo, hacia la derecha.
  - c) No permite decidir qué lado carga con la diferencia, ni cuánto.  Ahora toda la carga la corrige el segundo subtítulo, moviendo su principio, exactamente, el margen mínimo.
  - d) La carga siempre resulta, indiferentemente de la distancia de tiempo con respecto a los subtítulos concomitantes, en un movimiento del principio del segundo subtítulo, hacia la derecha, por tanto como el margen mínimo. Quizá lo más deseable fuera completar la distancia respectiva con el anterior para formar el margen mínimo.
  - e) Los filtros de clases, inclusivos y exclusivos, solo se aplican con respecto al subtítulo de la derecha del solapamiento, esto es: si el subtítulo que se solapa es el de la izquierda, el programa permite el cambio, porque solo va a cambiar el de la derecha. Esto quizá tampoco sea lo más deseable.

  Estas features no se han cerrado para así poder saber qué se quiere conseguir antes de limitar el algoritmo o complicarlo de más.
 
  -----------------------------------
  LAS SOLUCIONES
  -----------------------------------
  
  Mi propuesta, o lo que me parece más coherente con la poca información que tengo es:

   (A) El problema (a) no creo que haya que meterse. Si hay subtítulos que desaparecen después de que subtítulos posteriores aparezcan, pues será por algo, no sé: efectos de puertas, cosas así, imagino. Ahora mismo, muevo igual el segundo subtítulo. Creo que lo suyo sería que mirara si es este el caso, y no lo moviera, porque si forma parte de algún efecto, tendría que ir sincronizado.
   
   (B) El problema (b) de que se aglutinen subtítulos, pienso que puede ser parte de lo mismo. Ahora mismo, cada subtítulo, independientemente, busca al anterior que se le solape, y si lo encuentra, aplica la separación, y sigue con el siguiente. Lo de desaglutinar, puede ser muy complejo, yo no me metería ahí.
   
   (C) El problema (c) de cómo distribuir el cambio para separarlos, lo podemos poner por parámetro y con porcentajes (ej: --carga-izquierda 20 / --carga-derecha 80 ) o podemos dejarlo tal cual está, que es moviendo el subtítulo de la derecha.
   
   (D) El problema (d) de cómo completar la separación, podría calcularse la diferencia con el subtítulo anterior para formar el margen mínimo de espacio, o dejarse así, que es: mover brutamente el margen mínimo del principio del segundo subtítulo hacia la derecha. Supongo que lo más fino es calcularlo.
   
   (E) El problema (e) de si aplicar los filtros de estilos también al subtítulo que no va a recibir alteraciones PERO interviene en el solapamiento, puede incorporarse como opción, o dejarse así (solo aplica la regla contra el subtítulo alterado) o cambiarse (aplica la regla contra el subtítulo anterior y el alterado). En este caso, yo intuitivamente aplicaría filtros a todo y no solo al nodo que altero (también al que interviene), pero no sé.

  Como unas features dependen de otras, quería aclarar antes qué se quiere esperar del programa.
  
  -----------------------------------
  FORMULARIO FINAL
  -----------------------------------
  
  Para abreviar el resumen/feedback, se presentan las opciones a los problemas:
  
   (A) Opción 1: No meterse.
       Opción 2: Personalizable.
  
   (B) Opción 1: No meterse.
       Opción 2: Personalizable.
  
   (C) Opción 1: Parametrizar la carga de separación lateral con --carga-izquiera / --carga-derecha.
       Opción 2: Dejarlo cargando la derecha el 100%.
  
   (D) Opción 1: Cambiarlo para calcular la diferencia con respecto al anterior y aplicar lo necesario para espaciar con el margen mínimo.
       Opción 2: Dejarlo aplicando brutamente el margen mínimo.
 
   (E) Opción 1: Cambiarlo para que las reglas de inclusión y exclusión por estilos se apliquen al subtítulo A y B; y no solo al B que es el que soporta el movimiento, que es como ahora está.
       Opción 2: Dejarlo aplicando las reglas de estilos solo al subtítulo B, el que muta sus tiempos.
 
  -----------------------------------
  Por: allnulled 
  -----------------------------------