# Elementos reutilizables de d3.js
Colección de elementos reutilizables desarrollados sobre d3.js

Todos los elementos tienen una interfase común. El objeto `chart` inicializa el componente y se puede configurar encandenando
los `setters` de sus propiedades. El método `data()`, cuando se llama por primera vez, une los datos a los elementos del
DOM que van a dibujar la gráfica, cuando se vuelve a llamar `data()` con nuevos datos, el componente se encarga de actualizarse.

Cada componente requiere los datos como conjuntos de filas leidos de un csv con `d3.csv`:

````javascript
[
  {"Year": "1997", "Make": "Ford", "Model": "E350", "Length": "2.34"},
  {"Year": "2000", "Make": "Mercury", "Model": "Cougar", "Length": "2.38"}
]
````

internamente, cada componente organiza los datos de acuerdo a su propia representación. 


## Gráfica de _Stacked Bars_

Representa series de datos como _stacks_ verticales sobre una gráfica de barras. En barras.html está el ejemplo de uso 
y opciones de configuración.


## Gráfica de Radar

Representa series de datos como _paths_ en una malla circular. En radar está el ejemplo de uso 
y opciones de configuración.
