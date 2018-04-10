# Elementos reutilizables de d3.js
Colección de elementos reutilizables desarrollados sobre d3.js

Todos los elementos tienen una interfase común. El objeto `chart` inicializa el componente y se puede configurar encandenando
los `setters` de sus propiedades. El método `data()`, cuando se llama por primera vez, une los datos a los elementos del
DOM que van a dibujar la gráfica, cuando se vuelve a llamar `data()` con nuevos datos, el componente se encarga de actualizarse.

Cada componente requiere los datos como conjuntos de filas leidos de un csv con `d3.csv`:

````javascript
var datos = [
  {"Year": "1997", "Make": "Ford", "Model": "E350", "Length": "2.34"},
  {"Year": "2000", "Make": "Mercury", "Model": "Cougar", "Length": "2.38"}
]
````

internamente, cada componente organiza los datos de acuerdo a su propia representación. 

## Uso

De acuerdo al patrón con el que están desarrollados los componentes, la forma general de utilizarlos depende poco de la
gráfica en específico. Pra crear una gráfica, siempre el primer paso es crear la instancia y darle valor a sus propiedades
(aquí se ilustra con una gráfica de barras pero el patrón general es el mismo):

````javascript
var bar = stackedBarChart()
    .width(400)
    .height(400)
    .stackVariables(["grado_ferrocarril", "grado_carretera"])
    .displayName("nom_ciudad")
    .id("id");
````
Cada uno de los métodos (_getters_ y _setters_) regresa el objeto original, entonces es posible encadenar los métodos para dar valor a las propiedades.

Para unir los datos a la gráfica, se llama el método `data(datos)`:

````javascript
bar.data(datos)
````
Finalmente, para desplegar la gráfica, se usa el método `call` de una selección de d3 con la instancia como argumento:

````javascript
d3.select("#chart")
  .call(bar);
````
Actualizar una gráfica consiste simplemente en llamar al método `data(nuevosDatos)` con un nuevo conjunto de datos:

````javascript
bar.data(newData);
````
Internamente la implementación se encarga de actualizar el dibujo, manejar los nuevos elementos, eliminar los que
ya no están presentes (la unión se hace implícitamente a trvés de la propiedad `id`).

## Propiedades generales

Todas las gráficas exponen las siguientes interfases de configuración:

- `width`: ancho en pixeles del svg
- `height`: altura en pixeles del svg
- `margin`: `{top: 40, right: 75, bottom: 60, left: 75}` objeto con los tamaños en pixeles de los márgenes
- `transitionTime`: duración en milisegundos de las transiciones al actualizar los datos
- `data`: Array de filas de datos
- `displayName`: Nombre del campo que se usará como etiquetas del eje x

## Gráfica de _Stacked Bars_

Representa series de datos como _stacks_ verticales sobre una gráfica de barras. Ofrece la posibilidad de agregar variables para graficarlas como líneas con una escala diferente.

### Configuración

`stackVariables`: Array con los nombres de las variables a usarse en el stack

`id`: Nombre del campo que se usará como identificador de cada serie de datos

`displayName`: Nombre del campo que se usará como etiquetas del eje x

`lineVariables`: Array con los nombres de los campos que serán desplegados como líneas en la gráfica

`stackColors`: función que regresa los colores para cada elemento del stack, por ejemplo: ` d3.scaleOrdinal(d3.schemeCategory10)`

`lineColors`: función que regresa los colores para cada linea, por ejemplo: ` d3.scaleOrdinal(d3.schemeCategory10)`

`pointColors`: función que regresa los colores para los puntos de las líneas (uno por serie), por ejemplo: ` d3.scaleOrdinal(d3.schemeCategory10)`

`legendContainer`: id del elemento en donde se va a desplegar la leyenda

`barAxisLabel`: Etiqueta para el eje de la escala de las barras

`lineAxisLabel`: Etiqueta para eleje de las líneas



En barras.html está el ejemplo de uso 
y opciones de configuración.


## Gráfica de Radar

script: stackedBars.js

Representa series de datos como _paths_ en una malla circular. En radar está el ejemplo de uso 
y opciones de configuración.

### Configuración

`maxValue`: Valor máximo para los ejes radiales.

`levels`: Número de circulos concéntricos

`format`: string de `d3.format`con el formato para desplegar las etiquetas de los ejes.

`color`: función que regresa los colores para cada linea, por ejemplo: ` d3.scaleOrdinal(d3.schemeCategory10)`.

`legend`: `{ title: '', translateX: 100, translateY: 0 }` objeto de configuración para la leyenda. Controla el título y la posición.

`highlight`: controla la serie que debe resaltarse (línea más gruesa). Se puede llamar en cualquier momento.


## Grafica de barras agrupadas 

script: barLineChart.js

Despliega series de datos como barras agrupadas, permite agregar líneas para series de datos.
