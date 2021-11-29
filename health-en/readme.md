# Health Project

This is an intermediate development release. The final version, for both the Spanish or English language, incorporates Arduino programming and the MQTT protocol.

## Distinctiveness and Complexity
### Overview

This project allows the management of calls and scheduled tasks of hospitalized patients by the nursing sector.

The idea is to have decentralized access to the application. This is why the browser was chosen as the user interface. Therefore, anyone who has access to the server and also has the credentials, will be able to interact with the application.

Due to the type of application, the natural tendency is to use it on PC. However, it is completely mobile-responsive.

The "healthproject" and "nurse" folders contain the backend files made with Django. PostgreSQL was used for the database. The "nurse-react" folder contains the frontend files made in Javascript, through the use of the Reactjs library. Inside the "nurse-react" folder are the "components", "context" and "services" folders. As the name implies, the "components" folder contains the components that will be displayed in the DOM. These components are structured and named so that their nature and / or function can be easily identified. This acts as an explanation of what each created file contains. 

I chose to keep some redundant or unnecessary files at this time to apply continuous delivery and / or continuous development methods in the future. The goal is to gradually achieve a greater atomization of the project.
### Some previous details 

The application handles global state through Context. 

App state, calls and tasks are sent and received via websockets (Django channels) 

Optimistic UI updates are not used. This is so because the states of the interface depend in many cases on updates that come from the backend through websockets (channels).

Generally, in inpatient areas, each bed has a call pushbutton and each room has a pushbutton to cancel calls from all beds in that room.
It is expected that, through systems such as Arduino and Raspberry, the signal produced by the pushbuttons will be transformed into data of the following JSON format: {'state': state, 'id': call-id}, which is the data type expected by the application. The 'state' data type is boolean. The data type 'id' is a string. In case of call, 'id' has the format 'room number, bed number' (for example: {'state': true,' id ': '12, 3'}) and in case of cancellation, the number Call is of the form 'room number' (for example: {'state': false, 'id': '12'}). For testing, the pushbuttons are simulated via "localhost: 8000 / nursing / rooms"


### File settings.py Config

The environment variables used by the "settings.py" file are imported through the django-environment library from an .env file in the same folder as the "settings.py" file.
Warning: if you're not configuring your environment separately, create one.
If you will not use an .env file anyway, the application will use the default values defined in "settings.py". You can also configure the settings manually.

For more information see: https://pypi.org/project/django-environ/

For index.html with React Components... 

```
TEMPLATES= [{ ...
    'DIRS':[ 
        os.path.join(BASE_DIR, 'nursing-react/build')
    ], ...
}]
```

Configure TIME_ZONE for your local time to keep in sync template time, controller time and db time. 
Set USE_TZ = False 
For example: in Argentina (UTC-3) set TIME_ZONE = 'Etc/GMT+3' 

Add ASGI_APPLICATION for channels-websocket

### Local development:

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
### Docker version:

Important!: if you have .env files for settings.py and for docker-compose.yml, make sure set NAME and HOST be:

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
### Docker-compose. Installing the app

This project was developed on Ubuntu. If you have an other OS, maybe you will need to
change the way you access to folders or you change permissions.

In the same folder that contains the docker-compose.yml file, create an .env file that contains the environment variables that the containers will use.
Warning: if you're not configuring your environment separately, create one.
If you will not use an .env file anyway, the application will use the default values defined in .yml file. You can also configure the settings manually.

For more information see: https://docs.docker.com/compose/environment-variables/

#### Method 1:

Throug GitHub repository:

If you have cloned the development version of the project from GitHub, it includes development folders such as "src", "node_modules", etc., but the image created for docker-compose will not include development folders or .env files. See .dockerignore

"appdirectory" is the folder that contains docker-compose file.

>mypc@mypc:~appdirectory$ docker-compose up --build -d (optional --> -d: detached mode)

To stop app: 
>mypc@mypc:~appdirectory$ docker-compose down

To bypass the db auth.User error when migrating, docker-compose.yml run the commands:

>python3 manage.py migrate auth  (r1)

>python3 manage.py migrate --run-syncdb  (r2)

When the tables are configured, it runs:

>python3 manage.py runserver 0.0.0.0:8000 (internal port)

#### Method 2:

Through the Docker repository:

Rename or remove docker-compose.yml and rename docker-compose-hub.yml to docker-compose.yml

Now the docker-compose file uses the image from https://hub.docker.com/repository/docker/gottigjavier/health-app

Development and .env files are not included in the docker image. See .dockerignore.

mypc@mypc:~appdirectory$ docker-compose up --build -d (optional --> -d: detached mode)

#### Only users can access the application. You need to create first user as Django super user:

List the running containers with:

>mypc@mypc:~appdirectory$ docker ps

Enter to container to run commands:

>mypc@mypc:~appdirectory$ docker exec -it [app container ID] bash

Creating superuser:

>root@containerID:/healt# python3 manage.py createsuperuser

If for some reason the (r1) and (r2) statements did not run the migrations on your system or returned an error, run them manually inside the container before creating the superuser.

### Ready to work:

Open your browser in localhost:8000 (exposed port)

>To simulate callers from beds navigate to localhost:8100/nursing/rooms

>Admin page is in localhost:8000/admin (superuser name & superuser password)

The folders data/db is created with restricted permissions. If you need rebuild you must change the permissions. 

When the new app container is created, the permissions will be restricted again.

To stop the server if you did not use detached mode:

>CTRL+C

Stop the services and the network, and delete the containers with:

>mypc@mypc:~appdirectory$ docker-compose down (2)

If you get the error "Cannot remove container ..." (Ubuntu):

>mypc@mypc:~appdirectory$ sudo aa-remove-unknown

and (2) again.

To restart apparmor:

>mypc@mypc:~appdirectory$ sudo /etc/init.d/apparmor restart


### Application Access

If you no login, you will redirect to http://localhost:8000/login

When you login, you can see the home page http://localhost:8000/nursing/home

There you can go to App, register a new user (leaders only), go to Django admin page (superuser only) or logout.

To keep the application window clear, no buttons were added to navigate to the home page. If you want to access it, for example to log out, add the address as a shortcut in the browser.

### Application Management

To access the application you need to log in. In the case of being used by several nurses, only one of them should log in (usually the person in charge of the work team or leader)
In all actions you can inform who performed each action (anonymous by default). This was implemented in this way to avoid that each action has to be registered and to speed up the handling of the app.

#### Bed color:

gray : free

green : occupied

blue : pending task. Timestamp to do so was reached.

red : unanswered call

purple : pending task and unanswered call

#### Click in Bed

Opens window to see bed info, occupy, vacate and edit bed or schedule new task.

When a bed changes to "occupied", by default it is expected to be free in seven days. This can be changed.

#### Tasks

When you schedule a new task, by default it will be scheduled within 30 minutes. You can change this in the schedule time box. 

To repeat the task you need check in repeat and choose the frequency. By default the task will repeat until the moment to expected vacate bed. This can be changed too.

All tasks appear in the list in order of execution. On "repeating tasks", bed icon appears inside a rectangle. When there are 10 minutes until the scheduled time, the task color changes from gray to light blue and the scheduled time to green. When the scheduled time is reached, the task color changes to blue and the time to red, the color of the bed changes to blue (if you have a call it changes from red to purple) and an audible warning is heard.

Tasks in the list can be edited by clicking on them. If the task is repeated, the edit will have no effect on the other tasks. The only batch action allowed is to delete all the tasks that share the recurrence.

When a new task is scheduled, it is presumed to be completed within two hours after the scheduled time. This is not seen when the task is scheduled but is visible when editing. If you put a past time in the "Done at" box, the task will be saved as "done" and will disappear from the list. You also have the option to quickly dial it with the "Just Done" button. If you choose to delete it, it will not be saved in the database.


#### Calls

When the call button is pressed from a bed, the server sends an audible alert (which will repeat every 15 seconds until the call is answered) and the call is added to the call list. Unanswered calls appear in red like the bed (if the bed has a pending call and is in blue it changes to purple). If you click on the call you can see more detailed information about bed.
In order for the call to change to "answered", the nurse must press the button in the room where the call comes from (usually there is a button to cancel calls by room). Pressing the cancel button changes all calls from that room to "answered".
Answered calls turn gray and the bed returns to its previous color.
By clicking on an answered call you can enter the reason for the call and the answer given, as well as who answered it. You can also see what time the call was made and what time it was answered.
When you close call, it disappear from list and is saved on database.
