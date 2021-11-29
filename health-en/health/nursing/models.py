from django.contrib.auth.models import AbstractUser
from django.db import models
from datetime import datetime
#from django.utils import timezone
from django.core.files.storage import FileSystemStorage

mr_fs = FileSystemStorage(location='nursing/medicalrecords')
user_fs = FileSystemStorage(location='nursing/media')
class User(AbstractUser):
    image = models.ImageField(storage=user_fs, default='useravatar.png',null=True, blank=True)
    leader = models.BooleanField(default=False, null=True, blank=True)
    
    def __str__(self):
        return self.username

    def serialize(self):
        if (self.image):
            return {
                "id": self.id,
                "username": self.username,
                "leader": self.leader,
                "image": self.image.url,
                "date_joined": self.date_joined.isoformat(),
                } 
        else:
            return {
                "id": self.id,
                "username": self.username,
                "date_joined": self.date_joined.isoformat()
                }         


class Patient(models.Model):
    name = models.CharField(default='No Name', max_length=50)
    id_card_number = models.CharField(null=True, max_length=50) # only in some countries
    social_security_number = models.CharField(null=True, max_length=50)
    image = models.ImageField(default='useravatar.png',null=True, blank=True)
    inpatient = models.BooleanField(default=True)
    admission = models.DateTimeField(auto_now_add=True)
    short_diagnosis = models.TextField(default='No Diagnosis')
    action_done_by = models.CharField(default='Anonymous', max_length=50)

    #def __str__(self):
    #    return self.name

    def serialize(self):
        if (self.image):
            return {
                "id": self.id,
                "name": self.name,
                "image": self.image.url,
                "social_number": self.social_security_number,
                "id_card": self.id_card_number,
                "inpatient": self.inpatient,
                "admission": self.admission.isoformat(),
                "short_diagnosis": self.short_diagnosis,
                "action_done_by": self.action_done_by
                } 
        else:
            return {
                "id": self.id,
                "name": self.name,
                "social_number": self.social_security_number,
                "inpatient": self.inpatient,
                "admission": self.admission.isoformat(),
                "short_diagnosis": self.short_diagnosis,
                "action_done_by": self.action_done_by
                }         

class Bed(models.Model):
    id_bed = models.CharField(max_length=10)
    bed_patient = models.ForeignKey(Patient, related_name='bed_patient', on_delete=models.CASCADE, null=True, blank=True)
    active = models.BooleanField(default=False)
    occupied_time = models.DateTimeField(null=True, blank=True)
    planed_vacate = models.DateTimeField(null=True, blank=True)
    vacate_time = models.DateTimeField(null=True, blank=True)
    action_done_by = models.CharField(default='Anonymous', max_length=50)
    bed_state = models.CharField(max_length=30, default='free')
    # bed states: free, occupied, call, task, call-task

    #def __str__(self):
    #    return self.id_bed

    def serialize(self):
        return {
            "id": self.id,
            "id_bed": self.id_bed,
            "bed_patient": self.bed_patient.name,
            "bed_state": self.bed_state,
            "action_done_by": self.action_done_by
            } 

class MedicalRecord(models.Model):
    patient = models.OneToOneField(Patient, related_name='record_patient', on_delete=models.CASCADE)
    medical_record_id = models.CharField(max_length=50, null=True)
    medical_record_file = models.FileField(storage=mr_fs, null=True)
    action_done_by = models.CharField(default='Anonymous', max_length=50)

    def __str__(self):
        return self.medical_record_id

    def serialize(self):
        return {
            "id": self.id,
            "patient": self.patient.name,
            "medical_record_id": self.medical_record_id,
            "medical_record_file": self.medical_record_file,
            "action_done_by": self.action_done_by
            } 

class Task(models.Model):
    bed = models.ForeignKey(Bed, related_name='task_bed', on_delete=models.CASCADE)
    repeat = models.BooleanField(default=False)
    repeat_id = models.CharField(max_length=50, null=True, blank=True)
    task = models.TextField(default='Routine Task')
    programed_time = models.DateTimeField(null=True, blank=True)
    done_time = models.DateTimeField(null=True, blank=True)
    active = models.BooleanField(default=False)
    state = models.CharField(default='soon', max_length=15) # later, soon, passed
    programed_by = models.CharField(default='Anonymous', max_length=50)
    action_done_by = models.CharField(default='Anonymous', max_length=50)
    
    def serialize(self):
        return {
            "id": self.id,
            "repeat": self.repeat,
            "bed_id": self.bed.pk,
            "repeat_id": self.repeat_id,
            "bed": self.bed.id_bed,
            "patient": self.bed.bed_patient.name,
            "task": self.task,
            "programed_time": self.programed_time.isoformat(),
            "done_time": self.done_time.isoformat(),
            "active": self.active,
            "state": self.state,
            "programed_by": self.programed_by,
            "action_done_by": self.action_done_by
            } 

class Call(models.Model):
    bed = models.ForeignKey(Bed, related_name='call_bed', on_delete=models.CASCADE)
    response = models.TextField(default='Uneventfully response')
    call_time = models.DateTimeField(null=True, blank=True)
    response_time = models.DateTimeField(null=True, blank=True) # This field is writen when call is answered
    state = models.CharField(default='active', max_length=20) # active, answered, closed
    action_done_by = models.CharField(default='Anonymous', max_length=50)
    # call states : active, answered, closed 

    def serialize(self):
        return {
            "id": self.id,
            "bed_id": self.bed.pk,
            "bed": self.bed.id_bed,
            "patient": self.bed.bed_patient.name,
            "response": self.response,
            "call_time": self.call_time.isoformat(),
            "response_time": self.response_time.isoformat(),
            "state": self.state,
            "action_done_by": self.action_done_by
        }


class Record(models.Model):
    loged_user = models.CharField(default="User", max_length=50)
    action = models.CharField(default="none", max_length=50)
    time = models.DateTimeField(null=True, blank=True)
    before = models.CharField(default="none", max_length=1000)
    after = models.CharField(default="none", max_length=1000)