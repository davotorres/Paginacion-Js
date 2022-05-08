# Paginacion-Js
Simulación de paginación simple (Round Robin).

El alumno deberá realizar un sistema que realizar una simulación de paginación simple, en dicho sistema se deben de tomar en cuenta varios puntos:
-	De manera aleatoria se asignará, el tiempo, operación y tamaño de cada proceso.
-	El tamaño de memoria será de 200.
-	Dividir la memoria en marcos de igual longitud (50 marcos de 4 cada uno).
-	Dividir los procesos en páginas (tamaño 4), es decir los procesos de igual que los marco 4.
 En este ejemplo se observan los 50 Marcos, numerados de 0 a 49.  Los marcos 46 al 49 están ocupados por el S.O. (denotado por el color negro), dejando del marco 0 al 45 disponibles para ser ocupados por los distintos procesos.   Como se indicó se necesita ver si el marco esta libre (en este caso se denota por la ausencia de color), si está ocupado y el proceso está listo (se observa el bloque marcado como azul y de forma proporcional, indicando así que hay fragmentación interna), si está ocupado y el proceso está bloqueado se observa un color morado y si está ocupado y el proceso está en ejecución se observa por el color rojo
 
No. Marco	 No. Marco	 	 	 	 
0	 	 	 	 	1	 	 	 	 
2	 	 	 	 	3	 	 	 	 
4	 	 	 	 	5	 	 	 	 
6	 	 	 	 	7	 	 	 	 
8	 	 	 	 	9	 	 	 	 
10	 	 	 	11	 	 	 	 
12	 	 	 	13	 	 	 	 
14	 	 	  15	 	 	 	 
16	 	 	  17	 	 	 	 
18	 	 	 	19	 	 	 	 
20	 	 	 	21	 	 	 	 
22	 	 	 	23	 	 	 	 
24	 	 	 	25	 	 	 	 
26	 	 	 	27	 	 	 	 
28	 	 	 	29	 	 	 	 
30	 	 	 	31	 	 	 	 
32	 	 	 	33	 	 	 	 
34	 	 	 	35	 	 	 	 
36	 	 	 	37	 	 	 	 
38	 	 	 	39	 	 	 	 
40	 	 	 	41	 	 	 	 
42	 	 	 	43	 	 	 	 
44	 	 	 	45	 	 	 	 
46	-	- 	47	- 	- 	
48	-	- 	49	- 	- 

![image](https://user-images.githubusercontent.com/71399810/167281511-d5a6ddb1-6c37-4704-bbe1-02476d12c193.png)![image](https://user-images.githubusercontent.com/71399810/167281514-cb4ae0b9-6e23-4de5-bad6-bd6fc9520ba0.png)


