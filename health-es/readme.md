# Aplicación para manejo de llamadas y tareas en sector de internación.

### Descripción General.

Esta aplicación recibe y administra las llamadas y tareas programadas que se dan en el sector de internación de un hospital o clínica.

Utilizar el navegador como interfaz con el usuario hace posible su manejo descentralizado. 
Esto implica que cualquier miembro del personal de salud (médico, enfermero, administrativo) con las credenciales correpondientes puede acceder a la información y a las funciones de la aplicación (ej: ocupar cama, programar tareas, etc) desde cualquier punto de la red.

Si bien, por el tipo de aplicación, la tendencia es a su uso en PC, es totalmente compatible con móviles o tablets. 

Las carpetas "healthproject" y "nurse" contienen los archivos correspondientes al backend y fueron codificados en Python a través del framework Django. La base de datos usa PostgreSQL. La carpeta "nurse-react" contiene los archivos del frontend codificados en Javascript a través de la librería Reactjs. Dentro de la carpeta "nurse-react" se encuentran las subcarpetas "components", "context" y "services". Como su nombre lo indica, la carpeta "components" contiene los componentes que serán renderizados en el DOM. Estos componentes están estructurados y nombrados de tal manera que su nombre exlique de la mejor manera posible su naturaleza y función.

Algunos archivos por ahora innecesarios o redundantes han sido preservados pensando en futuras modificaciones.
### Algunos detalles previos 

La aplicación maneja un estado global a través del "contexto". 

El estado de la app, llamadas y tareas son enviadas y recibidas via websockets (Django channels). 

No se utilizan actualizaciones optimistas de la interfaz de usuario. Esto es así porque los estados de la interfaz dependen en muchos casos de las actualizaciones que vienen del backend a través de websockets (channels). 
Generalmente, en las áreas de hospitalización, cada cama tiene un botón de llamada y cada habitación tiene un botón para cancelar las llamadas de todas las camas en esa habitación.
Se espera que, a través de sistemas como Arduino y Raspberry, la señal producida por los pulsadores se transforme en datos del siguiente formato JSON: 
 {'state': state, 'id': call-id}, que es el tipo de datos que espera la aplicación. El tipo de datos 'state' es booleano. El tipo de datos 'id' es una cadena. En caso de llamada, 'id' tiene el formato 'número de habitación, número de cama' (por ejemplo: {'state': true,' id ': '12, 3'}) y en caso de cancelación, el número de llamada es de la forma 'número de habitación' (por ejemplo: {'state': false, 'id': '12'}). Para las pruebas, los botones pulsadores se simulan a través de "localhost:8000/nursing/rooms"

### Configuración del archivo settings.py

Las variables de entorno utilizadas por el archivo "settings.py" se importan a través de la biblioteca django-environment desde un archivo .env en la misma carpeta que el archivo "settings.py".
Advertencia: si no está configurando su entorno por separado, cree uno.
Si no va a utilizar un archivo .env de todos modos, la aplicación utilizará los valores predeterminados definidos en "settings.py". También puede configurar los ajustes manualmente. 

Para más información vea: https://pypi.org/project/django-environ/

Para index.html con React Components... 

```
TEMPLATES= [{ ...
    'DIRS':[ 
        os.path.join(BASE_DIR, 'nursing-react/build')
    ], ...
}]
```

Configure TIME_ZONE para su hora local para mantener sincronizados la hora de la plantilla, la hora del controlador y la hora de la base de datos.

Set USE_TZ = False 

Por ejemplo: en Argentina (UTC-3) establezca TIME_ZONE = 'Etc/GMT+3' 

Agregue ASGI_APPLICATION = 'healthproject.routing.application' para channels-websocket.

### Desarrollo local:

```
DATABASES = {... 
    'NAME': ['database_name'], ... 
    'HOST': 'localhost', ... 
}
```
```
CHANNEL_LAYERS= {
    ... "hosts": [('localhost', 6379)],   
}
```
### Versión Docker:

Importante!: Si de todas maneras usará archivos .env para settings.py y para docker-compose.yml, asegúrese de que NAME y HOST sean:

```
DATABASES = {... 
    'NAME': 'db', ... 
    'HOST': 'db', ...
    }
```
```
CHANNEL_LAYERS= {
    ... "hosts": [('redis', 6379)],   
}
```
### Docker-compose. Instalando la App

Este proyecto fue desarrollado en Ubuntu. Si tiene otro sistema operativo, tal vez necesite cambiar la forma en que accede a las carpetas o cambiar algunos permisos. 

En la misma carpeta que contiene el archivo docker-compose.yml, cree un archivo .env que contenga las variables de entorno que usarán los contenedores.
Advertencia: si no está configurando su entorno por separado, cree uno.
Si no va a utilizar un archivo .env de todos modos, la aplicación utilizará los valores predeterminados definidos en el archivo .yml. También puede configurar los ajustes manualmente. 

Para más información vea: https://docs.docker.com/compose/environment-variables/

#### Método 1:

A través del repositorio GitHub:

Si ha clonado la versión de desarrollo del proyecto desde GitHub, incluye carpetas de desarrollo como "src", "node_modules", etc., pero la imagen creada para docker-compose no incluirá carpetas de desarrollo ni archivos .env. Ver: .dockerignore 

"appdirectory" será la carpeta que contiene el archivo docker-compose.

>mypc@mypc:~appdirectory$ docker-compose up --build -d (optional --> -d: detached mode)

Esto arrancará tres contenedores, uno para la base de datos, otro para Redis y otro para la app.

Para parar los contenedores, borrarlos y dar de baja la red interna entre ellos: 

>mypc@mypc:~appdirectory$ docker-compose down

Para omitir el error db auth.User al migrar, docker-compose.yml ejecuta los comandos: 

>python3 manage.py migrate auth  (r1)

>python3 manage.py migrate --run-syncdb  (r2)

Cuando las tablas están configuradas se ejecuta:

>python3 manage.py runserver 0.0.0.0:8000 (internal port)

#### Método 2:

A través del repositorio Docker:

Renombre o borre docker-compose.yml y renombre docker-compose-hub.yml como docker-compose.yml

Ahora el archivo docker-compose usa la imagen de https://hub.docker.com/repository/docker/gottigjavier/health-app

Archivos de desarrollo y .env no están incluídos en la imagen docker. Vea el archivo .dockerignore.

mypc@mypc:~appdirectory$ docker-compose up --build -d (optional --> -d: detached mode)

#### Solo usuarios autorizados pueden acceder a la aplicación. Se debe crear el primer ususario como superusuario de Django:

Liste los contenedores que están corriendo con:

>mypc@mypc:~appdirectory$ docker ps

Ingrese al contenedor donde corre la app para escribir comandos:

>mypc@mypc:~appdirectory$ docker exec -it [app container ID] bash

Creando un superusuario:

>root@containerID:/healt# python3 manage.py createsuperuser

Si por alguna razón los comandos (r1) y (r2) no ejecutaron las migraciones en su sistema o arrojaron un error, ejecútelas manualmente dentro del contenedor antes de crear el superusuario. 

### Listos para trabajar:

Abra su navegador en la dirección localhost:8000 (exposed port)

>La página localhost:8000/nursing/rooms simula los botones de llamada y cancelación de llamadas de las camas y habitaciones.

>La página de administración de Django está en: localhost:8000/admin (nombre de superusuario y contraseña de superusuario)

Las carpetas data/db se crean con permisos restringidos. Si necesita reconstruir los contenedores, debe cambiar los permisos.

Cuando se crea el nuevo contenedor de la aplicación, los permisos se volverán a restringir. 

Para detener el servidor si no lanzó en detached mode:

>CTRL+C

Detenga los servicios y la red y elimine los contenedores con: 

>mypc@mypc:~appdirectory$ docker-compose down (2)

Si obtiene el error "Cannot remove container ..." (Ubuntu):

>mypc@mypc:~appdirectory$ sudo aa-remove-unknown

y repita (2).

Para restablecer apparmor:

>mypc@mypc:~appdirectory$ sudo /etc/init.d/apparmor restart


### Acceso a la aplicación

Si no iniciño sesión, será redirigido a: http://localhost:8000/login

Iniciada la sesión, será llevado a la página de inicio: http://localhost:8000/nursing/home

Allí, usted puede ingresar a la app, registrar un nuevo ususario (solo administradores), ir a la página de administración de Django (solo superusuarios) o cerrar sesión.

Para mantener la ventana de la aplicación lo más limpia posible no se han incluído botones para navegar a la hompage. Si usted necesita, por ejemplo, cerrar sesión dirigiéndose a la página de inicio, puede escribir http://localhost:8000/nursing/home en la barra de direcciones o agregarla a la barra de favoritos del navegador. 

### Manejo de aplicación

Para acceder a la aplicación es necesario iniciar sesión. En el caso de ser utilizado por varias enfermeras, solo una de ellas debe iniciar sesión (normalmente la persona a cargo del equipo de trabajo o líder)
En todas las acciones puedes informar quién realizó cada acción (anónimo por defecto). Esto se implementó de esta manera para evitar que cada acción tenga que ser registrada y para acelerar el manejo de la aplicación.
#### Color de la cama:

gris : desocupada

verde : ocupada

azul : tarea pendiente. El momento programado se ha cumplido.

rojo : llamada todavía no contestada

violeta : tarea pendiente y llamada no contestada

#### Haciendo click en la cama

Abre la ventana para ver la información de la cama, ocupar, desocupar y editar la cama o programar una nueva tarea.

Cuando una cama cambia a "ocupada", por defecto se espera que se desocupe en siete días. Esto se puede cambiar.

#### Tareas

Cuando programe una nueva tarea, de manera predeterminada, se programará para dentro de 30 minutos. Puede cambiar esto en el cuadro de tiempo de programación.

Para repetir la tarea, debe verificar en repetir y elegir la frecuencia. De forma predeterminada, la tarea se repetirá hasta el momento en que se espera desocupar la cama. Esto también se puede cambiar.

Todas las tareas aparecen en la lista en orden de ejecución. En las tareas que se repiten, el ícono de la cama aparecerá dentro de un rectángulo.  Cuando quedan 10 minutos para la hora programada, el color de la tarea cambia de gris a azul claro y la hora programada a verde. Cuando se alcanza la hora programada, el color de la tarea cambia a azul y la hora a rojo, el color de la cama cambia a azul (si tiene una llamada, cambia de rojo a violeta) y se escucha una advertencia audible.

Las tareas de la lista se pueden editar haciendo clic en ellas. Si la tarea se repite, la edición no tendrá ningún efecto en las otras tareas. La única acción por lotes permitida es eliminar todas las tareas que comparten la recurrencia.

Cuando se programa una nueva tarea, se presume que se completará dentro de las dos horas posteriores a la hora programada. Esto no se ve cuando la tarea está programada, pero es visible cuando se edita. Si pone un tiempo pasado en el cuadro "Se Cumplió o Cumplirá", la tarea se guardará como "Cumplida" y desaparecerá de la lista. También tiene la opción de marcarlo rápidamente con el botón "Recién Cumplida". Si elige eliminarla, no se guardará en la base de datos. 


#### Llamadas

Cuando se presiona el botón de llamada desde una cama, el servidor envía una alerta sonora (que se repetirá cada 15 segundos hasta que se responda la llamada) y la llamada se agrega a la lista de llamadas. Las llamadas no respondidas aparecen en rojo como la cama (si la cama tiene una llamada pendiente y está en azul, cambia a violeta). Si hace clic en la llamada puede ver información más detallada sobre la cama.
Para que la llamada cambie a "respondida", la enfermera debe presionar el botón en la habitación de donde proviene la llamada (generalmente hay un botón para cancelar llamadas por habitación). Al presionar el botón cancelar, todas las llamadas de esa habitación se cambian a "respondidas".
Las llamadas respondidas se vuelven grises y la cama vuelve a su color anterior.
Al hacer clic en una llamada respondida, puede ingresar el motivo de la llamada y la respuesta dada, así como quién la respondió. También puede ver a qué hora se realizó la llamada y a qué hora se respondió.
Cuando cierra la llamada, desaparece de la lista y se guarda en la base de datos. 
