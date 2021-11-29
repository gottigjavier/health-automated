from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.core.serializers.json import DjangoJSONEncoder
from django.urls import reverse
from django.db import IntegrityError
from .models import User, Bed, MedicalRecord, Patient, Call, Task, Record
from django.db.models import Min
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync, asyncio
import json
import random

scheduler = BackgroundScheduler()
scheduler.start()

def serial_beds(beds):
    beds_list =[]
    if beds:
        for bed in beds:
            pk_id = bed.id
            bed_id = bed.id_bed
            bed_active = bed.active
            bed_occupied_time = bed.occupied_time.isoformat()
            bed_planed_vacate = bed.planed_vacate.isoformat()
            bed_state = bed.bed_state
            patient = bed.bed_patient.name
            patient_pk = bed.bed_patient.id
            patient_ssn = bed.bed_patient.social_security_number
            image = bed.bed_patient.image.name
            diagnosis = bed.bed_patient.short_diagnosis
            done_by = bed.action_done_by
            bed_dict = {
                'id': pk_id,
                'bed_id': bed_id,
                'bed_active': bed_active,
                'bed_occupied_time': bed_occupied_time,
                'bed_planed_vacate': bed_planed_vacate,
                'bed_state': bed_state,
                'patient': patient,
                'patient_id': patient_pk,
                'patient_security_number': patient_ssn,
                'image': image,
                'diagnosis': diagnosis,
                'action_done_by': done_by
            }
            beds_list.append(bed_dict)
    else:
        pass
    return beds_list

def ws_load():    
    beds = Bed.objects.filter(active=True).all()
    patients = Patient.objects.filter(inpatient=True).all()
    tasks = Task.objects.filter(active=True).order_by('programed_time').all()
    calls = Call.objects.exclude(state='closed').order_by('id').all()
    beds_list = serial_beds(beds)
    if patients:
        serialized_patients = [patient.serialize() for patient in patients]
    else:
        serialized_patients = []
    if tasks:
        serialized_tasks = [task.serialize() for task in tasks]
    else:
        serialized_tasks = []
    if calls:
        serialized_calls = [call.serialize() for call in calls]
    else:
        serialized_calls = []
    rooms_state ={
        'beds': beds_list,
        'patients': serialized_patients,
        'calls': serialized_calls,
        'tasks': serialized_tasks
        }
    return rooms_state

def ws_load_encoded():
    data = ws_load()
    return json.dumps(
        data,
        sort_keys=True,
        indent=1,
        cls=DjangoJSONEncoder
        )

def app_ws_update():
    all_data = json.loads(ws_load_encoded())
    layer = get_channel_layer()
    async_to_sync(layer.group_send)('appboard', {
    'type': 'deprocessing',
    'all_data': all_data,
    },
    )

def tasks_ws_update():
    tasks = Task.objects.filter(active=True).order_by('programed_time').all()
    if tasks:
        time_now = datetime.now()
        time_now_float = time_now.timestamp()
        for task in tasks:
            task_time = task.programed_time.timestamp()
            bed = Bed.objects.get(pk=task.bed.pk)
            if task_time - time_now_float > 0:
                if task_time - time_now_float < 600:
                    task.state = 'soon'
            else:
                task.state = 'passed'
                if bed.bed_state == 'call':
                    bed.bed_state = 'call-task'
                if bed.bed_state == 'occupied':
                            bed.bed_state = 'task'
            bed.save()
            task.save()
        tasks = Task.objects.filter(active=True).order_by('programed_time').all()
        beds = Bed.objects.filter(active=True).all()
        beds_list = serial_beds(beds)
        tasks_list = [task.serialize() for task in tasks]
        tasks_and_beds = {
            'beds_list' : beds_list,
            'tasks_list' : tasks_list
        }
        layer = get_channel_layer()
        async_to_sync(layer.group_send)('tasksboard', {
        'type': 'deprocessing',
        'tasks_and_beds': tasks_and_beds,
        },)
        tasks_scheduler()

def first_programed():
    soon_task_programed = Task.objects.filter(active=True).filter(state='soon').aggregate(sched_time=Min('programed_time'))
    later_task_programed = Task.objects.filter(active=True).filter(state='later').aggregate(sched_time=Min('programed_time'))
    if soon_task_programed['sched_time']:
        soon_task_programed_float = soon_task_programed['sched_time'].timestamp()
        soon_task_programed = soon_task_programed['sched_time']
    else:
        soon_task_programed_float = 10000000000.0 # Date: 2286-11-20 14:46:40
        soon_task_programed = datetime.fromtimestamp(soon_task_programed_float)
    if later_task_programed['sched_time']:
        later_task_programed_minus_10_float = later_task_programed['sched_time'].timestamp() - 600
        later_task_programed = datetime.fromtimestamp(later_task_programed_minus_10_float)
    else:
        later_task_programed_minus_10_float = 10000000100.0
        later_task_programed = datetime.fromtimestamp(later_task_programed_minus_10_float)
    if(soon_task_programed_float < later_task_programed_minus_10_float):
        return soon_task_programed
    else:
        return later_task_programed

def tasks_scheduler():
    first_task_programed = first_programed() 
    print('next query to db ', first_task_programed)
    scheduler.add_job(tasks_ws_update, 'date', run_date=first_task_programed, id='task_sched', replace_existing=True)
    

@login_required
def home(request):
    return render(request, 'home.html')

# Update context as http json response
def load():    
    beds = Bed.objects.filter(active=True).all()
    patients = Patient.objects.filter(inpatient=True).all()
    tasks = Task.objects.filter(active=True).order_by('programed_time').all()
    calls = Call.objects.exclude(state='closed').order_by('id').all()
    beds_list = serial_beds(beds)
    if patients:
        serialized_patients = [patient.serialize() for patient in patients]
    else:
        serialized_patients = []
    if tasks:
        serialized_tasks = [task.serialize() for task in tasks]
    else:
        serialized_tasks = []
    if calls:
        serialized_calls = [call.serialize() for call in calls]
    else:
        serialized_calls = []
    rooms_state ={
        'beds': beds_list,
        'patients': serialized_patients,
        'calls': serialized_calls,
        'tasks': serialized_tasks
        }
    tasks_scheduler()
    app_ws_update()
    return JsonResponse(rooms_state, safe=False)

# Start. Initial app state.
@login_required
def initial_load(request):
    tasks_ws_update()
    app_ws_update()
    return JsonResponse({"message": "Initial Load OK."}, status=200)

# ------- Beds Section ----------------------
@csrf_exempt
@login_required
def edit_bed(request):
    if request.method == "PUT":
        data = json.loads(request.body)
        bed_pk = data['bedId']
        patient_name = data['patientName']
        patient_social = data['patientSocial']
        diagnosis = data['diagnosis']
        occupied_time = data['occupiedDateTime']
        planed_vacate = data['planedVacate']
        done_by = data['doneBy']
        try:
            bed = Bed.objects.get(id=bed_pk)
            current_patient = Patient.objects.get(id=bed.bed_patient.id)
        except:
            return JsonResponse({"error": "Bed or patient not found."}, status=400)
        if bed and bed.active:
            before = 'bed.pk: ' + str(bed.pk) + ', bed: ' + str(bed.id_bed) + ', patient.pk: ' + str(current_patient.pk) + ', current_patient.name: ' + current_patient.name + ', current_patient.social_security_number: ' + current_patient.social_security_number + ', current_patient.short_diagnosis: ' + current_patient.short_diagnosis + ', bed.occupied_time: ' + str(bed.occupied_time) + ', bed.planed_vacate: ' + str(bed.planed_vacate) + ', bed.action_done_by: ' + bed.action_done_by
            bed.occupied_time = occupied_time
            bed.planed_vacate = planed_vacate
            bed.action_done_by = done_by
            current_patient.name = patient_name
            current_patient.social_security_number = patient_social
            current_patient.short_diagnosis = diagnosis
            current_patient.save()
            bed.save()
            after = 'bed.pk: ' + str(bed.pk) + ', bed: ' + str(bed.id_bed) + ', patient.pk: ' + str(current_patient.pk) + ', current_patient.name: ' + patient_name + ', current_patient.social_security_number: ' + patient_social + ', current_patient.short_diagnosis: ' + diagnosis + ', bed.occupied_time: ' + str(occupied_time) + ', bed.planed_vacate: ' + str(planed_vacate) + ', bed.action_done_by: ' + done_by
            recording(request.user.username, 'edit bed', before, after)
            return load()
        else:
            return JsonResponse({"error": "Bed not found or Bed Inactive."}, status=400)
    else:
        return JsonResponse({"error": "Invalid request method."}, status=400)

@csrf_exempt
@login_required
def occupy_bed(request):
    if request.method == "POST":
        data = json.loads(request.body)
        bed_id = data['roomBedId']
        patient_name = data['patientName']
        patient_social = data['patientSocial']
        diagnosis = data['diagnosis']
        occupied_time = data['occupiedDateTime']
        planed_vacate = data['planedVacate']
        done_by = data['doneBy']
        patient = Patient()
        patient.name = patient_name
        patient.social_security_number = patient_social
        patient.short_diagnosis = diagnosis
        patient.action_done_by = done_by
        patient.save()
        bed = Bed()
        bed.bed_patient = patient
        bed.id_bed = bed_id
        bed.active = True
        bed.bed_state = 'occupied'
        bed.occupied_time = occupied_time
        bed.planed_vacate = planed_vacate
        bed.action_done_by = done_by
        bed.save()
        after = 'bed.pk: ' + str(bed.pk) + ', bed.id_bed: ' + bed_id + ', patient.pk: ' + str(patient.pk) + ', patient.name: ' + patient_name + ', patient.social_security_number: ' + patient_social + ', patient.short_diagnosis: ' + diagnosis + ', bed.active: true, bed.state: occupied, bed.occupied_time: ' + str(occupied_time) + ', bed.planed_vacate: ' + str(planed_vacate) + ', bed.action_done_by: ' + done_by
        recording(request.user.username, 'occupy bed', 'unoccupy', after)
        return load()
    else:
        return JsonResponse({"error": "Invalid request method."}, status=400)

@csrf_exempt
@login_required
def vacate_bed(request):
    if request.method == "POST":
        data = json.loads(request.body)
        bed_pk = data['bedId']
        patient_pk = data['patientId']
        vacate_time = data['vacateDT']
        done_by = data['doneBy']
        patient = Patient.objects.get(pk=patient_pk)
        bed = Bed.objects.get(pk=bed_pk)
        tasks = Task.objects.filter(bed__pk=bed_pk, active=True)
        if tasks:
            for task in tasks:
                task.delete()
        calls = Call.objects.filter(bed__pk=bed_pk).exclude(state='closed')
        if calls:
            for call in calls:
                call.state = 'closed'
                call.save()
        patient.inpatient = False
        patient.action_done_by = done_by
        bed.active = False
        bed.bed_state = 'free'
        bed.vacate_time = vacate_time
        bed.action_done_by = done_by
        patient.save()
        bed.save()
        app_ws_update()
        before = 'bed.pk: ' + str(bed.pk) + ', bed: ' + str(bed.id_bed) + ', patient.pk: ' + str(patient.pk) + ', patient.name: ' + str(patient.name) + ', bed.vacate_time: ' + str(bed.vacate_time) + ', bed.action_done_by: ' + done_by
        recording(request.user.username, 'vacate bed', before, 'unoccupied')
        return load()
    else:
        return JsonResponse({"error": "Invalid request method."}, status=400)

# ------- End Beds Section ------------------


# -------- Calls section ----------------

def new_call(bed):
    try:
        active_bed = Bed.objects.get(id_bed=bed, active=True)
    except:
        active_bed = {}
    try:
        call = Call.objects.get(state='active', bed__id_bed=bed)
    except:
        call = {}
    if not active_bed == {} and call == {}:
        if active_bed.bed_state == 'task':
            active_bed.bed_state = 'call-task'
        else:
            active_bed.bed_state = 'call'
        active_bed.save()
        new_call = Call()
        new_call.bed = active_bed
        new_call.call_time = datetime.now()
        new_call.response_time = datetime.now()
        new_call.state = 'active'
        new_call.save()
        return ws_load()
    else:
        pass


def answ_call(bed):
    return ws_load()


@csrf_exempt
@login_required
def answered_call(request):
    if request.method == "POST":
        data = json.loads(request.body)
        calls_list = data['saveCallsList']
        for answ_call in calls_list:
            call = Call.objects.get(bed__id_bed=answ_call['bed'], state='active')
            if call:
                try:
                    bed = Bed.objects.get(id_bed=answ_call['bed'], active=True)
                    call.response_time = answ_call['response_time']
                    call.state = 'answered'
                    if bed.bed_state == 'call-task':
                        bed.bed_state = 'task'
                    else:
                        bed.bed_state = 'occupied'
                    bed.save()
                    call.save()
                except:
                    return JsonResponse({"message": "Bed answered Error."}, status=400)
            else:
                return JsonResponse({"message": "Call does not exist."}, status=400)
        return load()
    else:
        return JsonResponse({"error": "Invalid request method."}, status=400)
    

@csrf_exempt
@login_required
def close_call(request):
    if request.method == "POST":
        data = json.loads(request.body)
        call_id = data['callId']
        call_time = data['callTime']
        call_response = data['text']
        call_answered_by = data['answeredBy']
        call = Call.objects.get(id=call_id)
        if call:
            call.state = 'closed'
            call.response = call_response
            call.response_time = call_time
            call.action_done_by = call_answered_by
            call.save()
            after = 'call.pk: ' + str(call.pk) + ', bed: ' + str(call.bed.id_bed) + ', call time: ' + str(call.call_time) +', call time response: ' + str(call_time) + ', call response: ' + str(call_response) + 'answered by: ' + call_answered_by
            recording(request.user.username, 'close call', 'active call', after)
            return load()
        else:
            return JsonResponse({"message": "Call does not exist."}, status=400)
    else:
        return JsonResponse({"error": "Invalid request method."}, status=400)
# ----------- End Calls section --------------------------------

# -----------Tasks section -------------------------------------    
@csrf_exempt
@login_required
def new_task(request):
    if request.method == "POST":
        data = json.loads(request.body)
        bed_id = data['bedId']
        programed_time = data['programedDT']
        done_time = data['doneDT']
        programed_by = data['programer']
        task_text = data['textAction']
        task_state = data['state']
        task_repeat_checked = data['repeatIsChecked']
        task_repeat_lapse = data['repeatLapse']
        task_repeat_lapse_unit = data['repeatLapseUnit']
        task_repeat_until = data['repeatUntil']
        try:
            programed_date_time = datetime.strptime(programed_time, '%Y-%m-%d %H:%M:%S')
        except:
            programed_date_time = datetime.strptime(programed_time, '%Y-%m-%d %H:%M')
        programed_time_float = programed_date_time.timestamp()
        task_repeat_id = str(programed_time_float * random.random())
        bed = Bed.objects.get(id=bed_id)
        if task_state == 'passed':
            if bed.bed_state == 'call' or bed.bed_state == 'call-task':
                bed.bed_state = 'call-task'
            else:
                bed.bed_state = 'task'
        task = Task()
        task.bed = bed
        task.repeat = task_repeat_checked
        task.repeat_id = task_repeat_id
        task.task = task_text
        task.programed_time = programed_time
        task.done_time = done_time
        task.programed_by = programed_by
        task.state = task_state
        task.active = True
        bed.save()
        task.save()
        username = request.user.username
        after = 'bed.pk: ' + str(bed.pk) + ', bed_id: ' + str(bed.id_bed) + ', task.pk: ' + str(task.pk) + ', task.repeat: ' + str(task.repeat) + ', task.repeat_id: ' + str(task.repeat_id) + ', task text: ' + task.task + ', task.programed_time: ' + str(task.programed_time) + ', task.done_time: ' + str(task.done_time) + ', task.state: ' + str(task.state)
        recording(username, 'new task', 'none', after)
        if task_repeat_checked:
            save_repeated_tasks(
                task_repeat_checked,
                task_repeat_lapse, 
                task_repeat_lapse_unit, 
                programed_time, 
                task_repeat_until,
                bed_id,
                task_repeat_id,
                done_time,
                programed_by,
                task_text,
                task_state,
                username)
        return load()
    else:
        return JsonResponse({"error": "Invalid request method."}, status=400)

def save_repeated_tasks(task_repeat_checked,
                        task_repeat_lapse, 
                        task_repeat_lapse_unit, 
                        programed_time, 
                        task_repeat_until,
                        bed_id,
                        task_repeat_id,
                        done_time,
                        programed_by,
                        task_text,
                        task_state,
                        username):
    time_now = datetime.now()
    time_now_float = time_now.timestamp()
    time_factor = int(task_repeat_lapse) * 60 # seconds
    if task_repeat_lapse_unit == 'hours':
        time_factor = int(task_repeat_lapse) * 3600 # seconds
    if task_repeat_lapse_unit == 'days':
        time_factor = int(task_repeat_lapse) * 86400 # seconds
    try:
        task_repeat_until_date_time = datetime.strptime(task_repeat_until, '%Y-%m-%d %H:%M:%S')
    except:
        task_repeat_until_date_time = datetime.strptime(task_repeat_until, '%Y-%m-%d %H:%M')
    task_repeat_until_float = task_repeat_until_date_time.timestamp()
    try:
        programed_date_time = datetime.strptime(programed_time, '%Y-%m-%d %H:%M:%S')
    except:
        programed_date_time = datetime.strptime(programed_time, '%Y-%m-%d %H:%M')
    programed_time_float = programed_date_time.timestamp()
    try:
        done_date_time = datetime.strptime(done_time, '%Y-%m-%d %H:%M:%S')
    except:
        done_date_time = datetime.strptime(done_time, '%Y-%m-%d %H:%M')
    done_time_float = done_date_time.timestamp()
    task_count = int((task_repeat_until_float - programed_time_float) / time_factor)
    for i in range(1,task_count + 1):
        programed_time_float = programed_time_float + time_factor
        if programed_time_float - time_now_float < 600:
            task_state = 'soon'
        else:
            task_state = 'later'
        programed_time = datetime.fromtimestamp(programed_time_float)
        done_time_float = done_time_float + time_factor
        done_time = datetime.fromtimestamp(done_time_float)
        bed = Bed.objects.get(id=bed_id)
        task = Task()
        task.bed = bed
        task.repeat = task_repeat_checked
        task.repeat_id = task_repeat_id
        task.task = task_text
        task.programed_time = programed_time
        task.done_time = done_time
        task.programed_by = programed_by
        task.state = task_state
        task.active = True
        bed.save()
        task.save()
        after = 'bed.pk: ' + str(bed.pk) + ', bed_id: ' + str(bed.id_bed) + ', task.pk: ' + str(task.pk) + ', task.repeat: ' + str(task.repeat) + ', task.repeat_id: ' + str(task.repeat_id) + ', task text: ' + task.task + ', task.programed_time: ' + str(task.programed_time) + ', task.done_time: ' + str(task.done_time) + ', task.state: ' + str(task.state)
        recording(username, 'new task', 'none', after)
    return

@csrf_exempt
@login_required
def edit_task(request):
    if request.method == "PUT":
        data = json.loads(request.body)
        task_id = data['taskId']
        current_bed = data['currentBed']
        programed_time = data['programedDT']
        done_time = data['doneDT']
        programer = data['programer']
        maker = data['maker']
        task_text = data['textAction']
        task_state = data['state']
        task_active = data['active']
        task = Task.objects.get(id=task_id)
        before = 'task.pk: ' + str(task.pk) + ', bed: ' + str(current_bed) + ', programed time: ' + str(task.programed_time) + ', done time: ' + str(task.done_time) + ', programer: ' + task.programed_by + ', maker: ' + task.action_done_by + ', task text: ' + task.task + ', task state: ' + str(task.state) + ', tasc active: ' + str(task.active)
        task.programed_time = programed_time
        task.done_time = done_time
        task.programed_by = programer
        task.action_done_by = maker
        task.task = task_text
        task.state = task_state
        task.active = task_active
        bed_task_list = Task.objects.filter(bed__id_bed=current_bed, active=True, state='passed')
        if len(bed_task_list) == 1:
            bed = Bed.objects.get(id= task.bed.pk)
            if bed_task_list[0].id == task.pk:                
                if not task_active:
                    if bed.bed_state == 'call-task':
                        bed.bed_state = 'call'
                    else:
                        bed.bed_state = 'occupied'
                else:
                    if task_state != 'passed':
                        if bed.bed_state == 'call-task' or bed.bed_state == 'call':
                            bed.bed_state = 'call'
                        else:
                            bed.bed_state = 'occupied'                    
            bed.save()
        if len(bed_task_list) == 0:
            bed = Bed.objects.get(id= task.bed.pk)
            if task_active and task_state == 'passed':
                    if bed.bed_state == 'call':
                        bed.bed_state = 'call-task'
                    else:
                        bed.bed_state = 'task'
            bed.save()
        task.save()
        after = 'task.pk: ' + str(task.pk) + ', bed: ' + str(current_bed) + ', programed time: ' + str(programed_time) + ', done time: ' + str(done_time) + ', programer: ' + programer + ', maker: ' + maker + ', task text: ' + task_text + ', task state: ' + str(task_state) + ', tasc active: ' + str(task_active)
        recording(request.user.username, 'edit task', before, after)
        return load()
    else:
        return JsonResponse({"error": "Invalid request method."}, status=400)

@csrf_exempt
@login_required
def delete_task(request):
    if request.method == "POST":
        data = json.loads(request.body)
        task_pk = data['taskPk']
        current_bed = data['currentBed']
        task_is_repeat = data['repeatIsChecked']
        task_repeat_id = data['reapeatTasksId']
        if not task_is_repeat:
            task = Task.objects.get(pk=task_pk)
            bed_task_list = Task.objects.filter(bed__id_bed=current_bed, active=True, state='passed')
            if not len(bed_task_list) > 1:
                bed = Bed.objects.get(id= task.bed.pk)
                if bed.bed_state == 'call-task' or bed.bed_state == 'call':
                    bed.bed_state = 'call'
                else:
                    bed.bed_state = 'occupied'
                bed.save()
            before = 'task.pk: ' + str(task.pk) + ', bed: ' + str(current_bed) + ', task.repeat: ' + str(task.repeat) + ', task.repeat_id: ' + str(task.repeat_id) + ', task.task: ' + task.task + ', programed time: ' + str(task.programed_time) + ', done time: ' + str(task.done_time) + ', task active: ' + str(task.active) + ', task.state: ' + task.state + ', programed by: ' + task.programed_by + ', done by: ' + task.action_done_by
            recording(request.user.username, 'delete task', before, 'deleted')
            task.delete()
        else:
            tasks = Task.objects.filter(repeat_id=task_repeat_id, active=True)
            for task in tasks:
                bed_task_list = Task.objects.filter(bed__id_bed=current_bed, active=True, state='passed')
                if len(bed_task_list) == 1:
                    bed = Bed.objects.get(id= task.bed.pk)
                    if task.pk == bed_task_list[0].id:
                        if bed.bed_state == 'call-task' or bed.bed_state == 'call':
                            bed.bed_state = 'call'
                        else:
                            bed.bed_state = 'occupied'
                        bed.save()
                before = 'task.pk: ' + str(task.pk) + ', bed: ' + str(current_bed) + ', task.repeat: ' + str(task.repeat) + ', task.repeat_id: ' + str(task.repeat_id) + ', task.task: ' + task.task + ', programed time: ' + str(task.programed_time) + ', done time: ' + str(task.done_time) + ', task active: ' + str(task.active) + ', task.state: ' + task.state + ', programed by: ' + task.programed_by + ', done by: ' + task.action_done_by
                recording(request.user.username, 'delete task', before, 'deleted')
                task.delete()
        return load()
    else:
        return JsonResponse({"error": "Invalid request method."}, status=400)

    
# --------------- End Tasks section --------------------------------

# ----------------User Manager --------------------------------
def login_view(request):
    if request.method == "POST":
        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("home"))
        else:
            return render(request, "login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("login"))

@login_required
def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]
        is_leader = request.POST.get("is-leader", False) # for the future

        if is_leader == "on":
            leader = True
        else:
            leader = False

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.leader = leader
            user.is_staff = leader
            user.image = request.FILES.get("image", "useravatar.png")
            user.save()
            recording(request.user.username, 'register new user', 'none', 'new user registered as: ' + username)
        except IntegrityError:
            return render(request, "register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("home"))
    else:
        return render(request, "register.html")

# ------------------ End User manager -----------------------

# ------------------ Record ---------------------------------
def recording(loged_user, action, before, after):
    record = Record()
    try:
        record.loged_user = loged_user
        record.action = action
        record.time = datetime.now()
        record.before = before
        record.after = after
        record.save()
        return
    except:
        print ('Error. Record no saved')
        return
# ---------------- End of Record ----------------------------

# simulates the call and answer buttons of the rooms 
def rooms(request):
    return render(request, 'rooms.html')
