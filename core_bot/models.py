from django.db import models

class Alumno(models.Model):
    telegram_id = models.CharField(max_length=100)
    nombre = models.CharField(max_length=200, null=True, blank=True)
    
    # Máquina de Estados
    estado_chat = models.CharField(max_length=50, default='INICIO')
    
    # Datos a recolectar
    carrera_interes = models.CharField(max_length=100, null=True, blank=True)
    cita_fecha = models.CharField(max_length=100, null=True, blank=True)
    asesor_asignado = models.CharField(max_length=100, null=True, blank=True)
    
    fecha_registro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.telegram_id} - {self.estado_chat}"