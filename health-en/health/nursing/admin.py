from django.contrib import admin
from .models import User, Bed, MedicalRecord, Patient, Call, Task, Record

class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'date_joined', 'is_active', 'is_staff', 'is_superuser', 'leader')
    ordering = ('username',)
    search_fields = ('username', 'email')
    list_filter = ('is_staff', 'is_active', 'is_superuser', 'leader', 'date_joined',)

class PatientAdmin(admin.ModelAdmin):
    list_display = ('name', 'id_card_number', 'social_security_number', 'inpatient', 'admission', 'short_diagnosis', 'action_done_by')
    ordering = ('name',)
    search_fields = ('name', 'id_card_number', 'social_security_number', 'inpatient', 'short_diagnosis', 'action_done_by')
    list_filter = ('name', 'id_card_number', 'social_security_number', 'admission', 'inpatient', 'short_diagnosis', 'action_done_by',)

class BedAdmin(admin.ModelAdmin):
    list_display = ('id_bed', 'bed_patient', 'active', 'occupied_time', 'planed_vacate', 'vacate_time', 'bed_state', 'action_done_by')
    ordering = ('id_bed',)
    search_fields = ('id_bed', 'bed_patient', 'active', 'occupied_time', 'planed_vacate', 'vacate_time', 'bed_state', 'action_done_by')
    list_filter = ('id_bed', 'bed_patient', 'active', 'occupied_time', 'planed_vacate', 'vacate_time', 'bed_state', 'action_done_by',)

class MedicalRecordAdmin(admin.ModelAdmin):
    list_display = ('patient', 'medical_record_id', 'medical_record_file', 'action_done_by')
    ordering = ('patient',)
    search_fields = ('patient', 'medical_record_id', 'medical_record_file', 'action_done_by')
    list_filter = ('patient', 'medical_record_id', 'medical_record_file', 'action_done_by',)

class CallAdmin(admin.ModelAdmin):
    list_display = ('bed', 'call_time', 'response_time', 'response', 'state', 'action_done_by')
    ordering = ('-call_time',)
    search_fields = ('bed', 'call_time', 'response_time', 'response', 'state', 'action_done_by')
    list_filter = ('bed', 'call_time', 'response_time', 'response', 'state', 'action_done_by',)

class TaskAdmin(admin.ModelAdmin):
    list_display = ('bed', 'programed_time', 'done_time', 'task', 'repeat', 'repeat_id', 'active', 'state', 'programed_by', 'action_done_by')
    ordering = ('-programed_time',)
    search_fields = ('bed', 'programed_time', 'done_time', 'task', 'repeat', 'repeat_id', 'active', 'state', 'programed_by', 'action_done_by')
    list_filter = ('bed', 'programed_time', 'done_time', 'task', 'repeat', 'repeat_id', 'active', 'state', 'programed_by', 'action_done_by',)


class RecordAdmin(admin.ModelAdmin):
    list_display = ('loged_user', 'action', 'time', 'before', 'after')
    ordering = ('-time',)
    search_fields = ('loged_user', 'action', 'time', 'before', 'after')
    list_filter = ('loged_user', 'action', 'time', 'before', 'after',)

admin.site.register(User, UserAdmin)
admin.site.register(Bed, BedAdmin)
admin.site.register(MedicalRecord, MedicalRecordAdmin)
admin.site.register(Patient, PatientAdmin)
admin.site.register(Call, CallAdmin)
admin.site.register(Task, TaskAdmin)
admin.site.register(Record, RecordAdmin)
admin.site.site_header = "Nursing Site Administration"
