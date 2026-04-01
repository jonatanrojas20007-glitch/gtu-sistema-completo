import os
import django
import telebot
import random
import re
import calendar
from datetime import datetime

# ===== 1. CONFIGURACIÓN DE DJANGO =====
# Esto permite que el script use tu base de datos y tus modelos
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core_bot.models import Alumno

# ===== 2. CONFIGURACIÓN DEL BOT =====
TOKEN = "8550457735:AAHznV8NMMTjlVL_m532JK51nQ7VLtMBBRI"
bot = telebot.TeleBot(TOKEN)

# ===== CONFIG DEL SCRIPT =====
ASESORES = ["Ale", "Marco", "Javier", "Miguel"]
PDF_OFERTA = "https://tuq.mx/pdf/licenciaturas_queretaro.pdf"
MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio", "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
DIAS = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"]
CARRERAS = {
    1: ("Sistemas Computacionales", "💻 Desarrollo de software, IA y tecnología."),
    2: ("Administración", "📊 Gestión de empresas y liderazgo."),
    3: ("Mecatrónica", "🤖 Automatización y robótica."),
    4: ("Diseño Digital", "🎨 Diseño gráfico y multimedia."),
    5: ("Contaduría", "📈 Finanzas y contabilidad."),
    6: ("Mercadotecnia", "📣 Estrategias de marketing."),
    7: ("Derecho", "⚖️ Formación jurídica."),
    8: ("Psicología", "🧠 Comportamiento humano.")
}

# ===== VALIDACIONES =====
def validar_nombre(nombre):
    partes = nombre.strip().split()
    return len(partes) >= 2 and all(p.isalpha() for p in partes)

def validar_telefono(tel):
    return re.fullmatch(r"\d{10}", tel) is not None

def generar_calendario_texto():
    hoy = datetime.now()
    año = hoy.year
    mes = hoy.month

    texto = f"📅 {MESES[mes-1]} {año}\n"
    texto += "`Lu Ma Mi Ju Vi Sa Do`\n" 

    cal = calendar.monthcalendar(año, mes)
    for semana in cal:
        fila = "`"
        for dia in semana:
            if dia == 0:
                fila += "   "
            else:
                fila += f"{str(dia).rjust(2)} "
        texto += fila + "`\n"
    return texto, año, mes

def generar_horarios_texto(fecha):
    dia_semana = fecha.weekday()
    texto = "⏰ Horarios disponibles\n\n"
    if dia_semana <= 4:
        texto += "Lunes a Viernes\n10:00 | 11:00 | 12:00 | 13:00\n14:00 | 15:00 | 16:00 | 16:30"
    else:
        texto += "Sábado\n09:00 | 10:00 | 11:00\n12:00 | 13:00 | 14:00"
    return texto

def validar_hora(fecha, hora_str):
    if not re.fullmatch(r"\d{2}:\d{2}", hora_str):
        return None
    try:
        hora = datetime.strptime(hora_str, "%H:%M").time()
        dia = fecha.weekday()
        if dia <= 4:
            if "10:00" <= hora_str <= "16:30":
                return hora
        elif dia == 5:
            if "09:00" <= hora_str <= "14:00":
                return hora
        return None
    except:
        return None

# Ya no usamos requests, usamos la función de telebot
def enviar(chat_id, texto):
    bot.send_message(chat_id, texto, parse_mode='Markdown')

# ===== MÁQUINA DE ESTADOS (BOT) =====
# Este decorador hace que la función atrape TODOS los mensajes que lleguen a Telegram
@bot.message_handler(func=lambda message: True)
def procesar_crm(message):
    chat_id = str(message.chat.id)
    texto = message.text.strip()
    texto_lower = texto.lower()

    # Buscamos el último registro de este usuario en la base de datos
    alumno = Alumno.objects.filter(telegram_id=chat_id).last()

    # Si no existe, o si su último proceso ya finalizó, instanciamos una fila nueva
    if alumno is None or alumno.estado_chat == 'REGISTRO_COMPLETO':
        alumno = Alumno.objects.create(telegram_id=chat_id)
    # Comando global para reiniciar
    if texto_lower == '/start':
        alumno.estado_chat = 'ESPERANDO_NOMBRE'
        alumno.nombre = ''
        alumno.carrera_interes = ''
        alumno.cita_fecha = ''
        alumno.asesor_asignado = ''
        alumno.save()
        
        mensaje = "🤖 *Sistema de admisiones TUQ*\n\n"
        mensaje += f"📢 Consulta la oferta académica:\n[Ver PDF aquí]({PDF_OFERTA})\n\n"
        mensaje += "🔥 Promoción de la semana:\nDescuento en inscripción 🎉\n\n"
        mensaje += "👤 Por favor, ingresa tu *Nombre y Apellido*:"
        enviar(chat_id, mensaje)
        return 

    # --- FLUJO ---
    if alumno.estado_chat == 'ESPERANDO_NOMBRE':
        if validar_nombre(texto):
            alumno.nombre = texto.title()
            alumno.estado_chat = 'ESPERANDO_TELEFONO'
            alumno.save()
            enviar(chat_id, "📱 Por favor, ingresa tu *Teléfono* (10 dígitos):")
        else:
            enviar(chat_id, "❌ Por favor ingresa al menos un nombre y un apellido válidos (solo letras).")

    elif alumno.estado_chat == 'ESPERANDO_TELEFONO':
        if validar_telefono(texto):
            alumno.cita_fecha = f"Tel:{texto}" 
            alumno.estado_chat = 'ESPERANDO_CARRERA'
            alumno.save()
            
            msg = "🎓 *Carreras disponibles*\n\n"
            for k, v in CARRERAS.items():
                msg += f"{k}. {v[0]} - {v[1]}\n"
            msg += "\nSelecciona el *número* de la carrera:"
            enviar(chat_id, msg)
        else:
            enviar(chat_id, "❌ Teléfono inválido. Deben ser 10 dígitos exactos.")

    elif alumno.estado_chat == 'ESPERANDO_CARRERA':
        try:
            opcion = int(texto)
            if opcion in CARRERAS:
                alumno.carrera_interes = CARRERAS[opcion][0]
                alumno.estado_chat = 'ESPERANDO_DIA'
                alumno.save()
                
                cal_texto, año, mes = generar_calendario_texto()
                enviar(chat_id, f"{cal_texto}\nSelecciona el *día* del mes (ejemplo: 28):")
            else:
                enviar(chat_id, "❌ Opción inválida. Elige un número de la lista.")
        except ValueError:
            enviar(chat_id, "❌ Por favor, envía solo el número de la carrera.")

    elif alumno.estado_chat == 'ESPERANDO_DIA':
        hoy = datetime.now()
        año = hoy.year
        mes = hoy.month
        try:
            dia = int(texto)
            fecha = datetime(año, mes, dia)
            dia_semana = fecha.weekday()
            
            if dia_semana == 6:
                enviar(chat_id, "❌ Domingo no disponible. Selecciona otro día:")
            else:
                alumno.cita_fecha += f"|Fecha:{fecha.strftime('%Y-%m-%d')}"
                alumno.estado_chat = 'ESPERANDO_HORA'
                alumno.save()
                
                horarios = generar_horarios_texto(fecha)
                msg = f"Elegiste: {DIAS[dia_semana]} {dia} de {MESES[mes-1]}\n\n{horarios}\n\nIngresa la *hora elegida* (Formato 24h, Ej: 14:00):"
                enviar(chat_id, msg)
        except:
            enviar(chat_id, "❌ Día inválido. Escribe el número del día basado en el calendario.")

    elif alumno.estado_chat == 'ESPERANDO_HORA':
        try:
            partes = alumno.cita_fecha.split("|Fecha:")
            telefono = partes[0].replace("Tel:", "")
            fecha = datetime.strptime(partes[1], '%Y-%m-%d')
            
            hora = validar_hora(fecha, texto)
            if hora:
                asesor = random.choice(ASESORES)
                
                alumno.asesor_asignado = asesor
                alumno.cita_fecha = f"{fecha.strftime('%d/%m/%Y')} a las {texto} (Tel: {telefono})"
                alumno.estado_chat = 'REGISTRO_COMPLETO'
                alumno.save()
                
                res = "✅ *CITA GENERADA*\n\n"
                res += f"👤 Alumno: {alumno.nombre}\n"
                res += f"📱 Teléfono: {telefono}\n"
                res += f"🎓 Carrera: {alumno.carrera_interes}\n"
                res += f"📅 Cita: {fecha.strftime('%d/%m/%Y')} a las {texto}\n"
                res += f"👨‍💼 Asesor asignado: {asesor}"
                enviar(chat_id, res)
            else:
                enviar(chat_id, "❌ Hora inválida o fuera de horario. Intenta de nuevo (Ej: 14:00):")
        except Exception as e:
            enviar(chat_id, "❌ Ocurrió un error leyendo tu registro. Escribe /start para reiniciar.")

    elif alumno.estado_chat == 'REGISTRO_COMPLETO':
        enviar(chat_id, "Ya estás registrado. Si quieres registrar a alguien más, escribe /start")
        
    else:
        alumno.estado_chat = 'ESPERANDO_NOMBRE'
        alumno.save()
        enviar(chat_id, "Escribe /start para comenzar.")

print("Iniciando Bot del CRM con toda la lógica...")
bot.infinity_polling()