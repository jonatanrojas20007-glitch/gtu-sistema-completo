// Formulario de Registro GTU - Con Barra de Progreso Dinámica
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registro-form');
    const progressFill = document.getElementById('progress-fill');
    const progressPercentage = document.getElementById('progress-percentage');
    const completedFieldsElement = document.getElementById('completed-fields');
    const totalFieldsElement = document.getElementById('total-fields');
    
    // Elementos del modal
    const modal = document.getElementById('confirm-modal');
    const modalClose = document.getElementById('modal-close');
    const modalOk = document.getElementById('modal-ok');
    const modalBody = document.getElementById('modal-body');
    
    // Cargar registros existentes
    let registros = JSON.parse(localStorage.getItem('gtuRegistros') || '[]');
    
    // Configurar todos los campos obligatorios
    const camposObligatorios = [
        'nombre',
        'apellido-paterno',
        'apellido-materno',
        'telefono',
        'nivel-educativo',
        'escuela',
        'carrera',
        'municipio'
    ];
    
    const camposTotales = camposObligatorios.length + 1; // +1 para correo opcional
    totalFieldsElement.textContent = camposObligatorios.length;
    
    // Inicializar estado de campos
    const estadoCampos = {};
    camposObligatorios.forEach(campo => {
        estadoCampos[campo] = false;
    });
    estadoCampos['correo'] = false; // Campo opcional
    
    // Inicializar progreso
    actualizarProgreso();
    
    // Configurar eventos de entrada para todos los campos
    camposObligatorios.forEach(campoId => {
        const campo = document.getElementById(campoId);
        if (campo) {
            campo.addEventListener('input', function() {
                const valor = this.value.trim();
                const esValido = valor.length > 0;
                
                if (campoId === 'telefono') {
                    // Validación especial para teléfono
                    const telefonoRegex = /^[0-9]{10}$/;
                    estadoCampos[campoId] = telefonoRegex.test(valor);
                } else {
                    estadoCampos[campoId] = esValido;
                }
                
                actualizarEstadoCampo(campoId, esValido);
                actualizarProgreso();
                actualizarResumenSecciones();
                actualizarPasosProgreso();
            });
            
            // Validación inicial
            estadoCampos[campoId] = campo.value.trim().length > 0;
        }
    });
    
    // Configurar campo opcional de correo
    const correoField = document.getElementById('correo');
    if (correoField) {
        correoField.addEventListener('input', function() {
            const valor = this.value.trim();
            estadoCampos['correo'] = valor.length > 0;
            actualizarProgreso();
        });
    }
    
    // Configurar evento para términos
    const termsCheck = document.getElementById('terms');
    if (termsCheck) {
        termsCheck.addEventListener('change', actualizarEstadoBotonEnviar);
    }
    
    // Manejar envío del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!validarFormularioCompleto()) {
            mostrarError('Por favor completa todos los campos obligatorios correctamente');
            return;
        }
        
        if (!termsCheck.checked) {
            mostrarError('Debes aceptar los términos y condiciones');
            return;
        }
        
        // Crear nuevo registro
        const nuevoRegistro = {
            id: Date.now(),
            nombre: document.getElementById('nombre').value.trim(),
            apellidoPaterno: document.getElementById('apellido-paterno').value.trim(),
            apellidoMaterno: document.getElementById('apellido-materno').value.trim(),
            nombreCompleto: obtenerNombreCompleto(),
            telefono: document.getElementById('telefono').value.trim(),
            nivelEducativo: document.getElementById('nivel-educativo').value,
            escuela: document.getElementById('escuela').value.trim(),
            carrera: document.getElementById('carrera').value,
            municipio: document.getElementById('municipio').value,
            fechaRegistro: new Date().toISOString(),
            timestamp: Date.now()
        };
        
        // Agregar correo si está presente
        const correo = document.getElementById('correo').value.trim();
        if (correo) {
            nuevoRegistro.correo = correo;
        }
        
        // Agregar a registros
        registros.push(nuevoRegistro);
        
        // Guardar en localStorage
        localStorage.setItem('gtuRegistros', JSON.stringify(registros));
        localStorage.setItem('gtuUltimaActualizacion', new Date().toISOString());
        
        // Mostrar modal de confirmación
        mostrarConfirmacion(nuevoRegistro);
        
        // Reiniciar formulario después de un momento
        setTimeout(() => {
            form.reset();
            
            // Reiniciar estados
            Object.keys(estadoCampos).forEach(campo => {
                estadoCampos[campo] = false;
            });
            
            actualizarProgreso();
            actualizarResumenSecciones();
            actualizarPasosProgreso();
            actualizarEstadoBotonEnviar();
            
            // Restablecer progreso de campos
            camposObligatorios.forEach(campoId => {
                actualizarEstadoCampo(campoId, false);
            });
            actualizarEstadoCampo('correo', false);
        }, 2000);
    });
    
    // Configurar eventos del modal
    modalClose.addEventListener('click', function() {
        modal.classList.remove('active');
    });
    
    modalOk.addEventListener('click', function() {
        modal.classList.remove('active');
    });
    
    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    // Función para obtener nombre completo
    function obtenerNombreCompleto() {
        const nombre = document.getElementById('nombre').value.trim();
        const apellidoPaterno = document.getElementById('apellido-paterno').value.trim();
        const apellidoMaterno = document.getElementById('apellido-materno').value.trim();
        return `${nombre} ${apellidoPaterno} ${apellidoMaterno}`.trim();
    }
    
    // Función para actualizar estado visual de un campo
    function actualizarEstadoCampo(campoId, esCompleto) {
        const campo = document.getElementById(campoId);
        const progressBar = document.querySelector(`[data-field="${campoId}"]`);
        
        if (campo) {
            if (esCompleto) {
                campo.classList.add('complete');
                campo.classList.remove('incomplete');
            } else {
                campo.classList.remove('complete');
                campo.classList.add('incomplete');
            }
        }
        
        if (progressBar) {
            if (esCompleto) {
                progressBar.classList.add('complete');
            } else {
                progressBar.classList.remove('complete');
            }
        }
    }
    
    // Función para actualizar progreso general
    function actualizarProgreso() {
        let camposCompletados = 0;
        
        // Contar campos obligatorios completados
        camposObligatorios.forEach(campoId => {
            if (estadoCampos[campoId]) {
                camposCompletados++;
            }
        });
        
        const porcentaje = Math.round((camposCompletados / camposObligatorios.length) * 100);
        
        // Actualizar barra de progreso
        progressFill.style.width = `${porcentaje}%`;
        progressPercentage.textContent = `${porcentaje}%`;
        completedFieldsElement.textContent = camposCompletados;
        
        // Actualizar estado de las secciones
        actualizarEstadoSecciones();
    }
    
    // Función para actualizar estado de las secciones
    function actualizarEstadoSecciones() {
        // Sección 1: Datos Personales (4 campos)
        const seccion1Campos = ['nombre', 'apellido-paterno', 'apellido-materno', 'telefono'];
        const seccion1Completados = seccion1Campos.filter(campo => estadoCampos[campo]).length;
        const seccion1Status = document.querySelector('.section-status[data-section="1"]');
        
        if (seccion1Status) {
            seccion1Status.querySelector('span').textContent = `${seccion1Completados}/4 campos completados`;
            
            if (seccion1Completados === 4) {
                seccion1Status.classList.add('complete');
                seccion1Status.querySelector('i').style.color = '#27ae60';
            } else {
                seccion1Status.classList.remove('complete');
                seccion1Status.querySelector('i').style.color = '';
            }
        }
        
        // Sección 2: Información Académica (3 campos)
        const seccion2Campos = ['nivel-educativo', 'escuela', 'carrera'];
        const seccion2Completados = seccion2Campos.filter(campo => estadoCampos[campo]).length;
        const seccion2Status = document.querySelector('.section-status[data-section="2"]');
        
        if (seccion2Status) {
            seccion2Status.querySelector('span').textContent = `${seccion2Completados}/3 campos completados`;
            
            if (seccion2Completados === 3) {
                seccion2Status.classList.add('complete');
                seccion2Status.querySelector('i').style.color = '#27ae60';
            } else {
                seccion2Status.classList.remove('complete');
                seccion2Status.querySelector('i').style.color = '';
            }
        }
        
        // Sección 3: Ubicación (1 campo)
        const seccion3Campos = ['municipio'];
        const seccion3Completados = seccion3Campos.filter(campo => estadoCampos[campo]).length;
        const seccion3Status = document.querySelector('.section-status[data-section="3"]');
        
        if (seccion3Status) {
            seccion3Status.querySelector('span').textContent = `${seccion3Completados}/1 campo completado`;
            
            if (seccion3Completados === 1) {
                seccion3Status.classList.add('complete');
                seccion3Status.querySelector('i').style.color = '#27ae60';
            } else {
                seccion3Status.classList.remove('complete');
                seccion3Status.querySelector('i').style.color = '';
            }
        }
    }
    
    // Función para actualizar resumen de secciones
    function actualizarResumenSecciones() {
        // Sección 1
        const seccion1Campos = ['nombre', 'apellido-paterno', 'apellido-materno', 'telefono'];
        const seccion1Completados = seccion1Campos.filter(campo => estadoCampos[campo]).length;
        const seccion1Porcentaje = (seccion1Completados / 4) * 100;
        
        const seccion1Fill = document.querySelector('.mini-fill[data-section="1"]');
        const seccion1Count = document.querySelector('.section-count[data-section="1"]');
        
        if (seccion1Fill) seccion1Fill.style.width = `${seccion1Porcentaje}%`;
        if (seccion1Count) seccion1Count.textContent = `${seccion1Completados}/4`;
        
        // Sección 2
        const seccion2Campos = ['nivel-educativo', 'escuela', 'carrera'];
        const seccion2Completados = seccion2Campos.filter(campo => estadoCampos[campo]).length;
        const seccion2Porcentaje = (seccion2Completados / 3) * 100;
        
        const seccion2Fill = document.querySelector('.mini-fill[data-section="2"]');
        const seccion2Count = document.querySelector('.section-count[data-section="2"]');
        
        if (seccion2Fill) seccion2Fill.style.width = `${seccion2Porcentaje}%`;
        if (seccion2Count) seccion2Count.textContent = `${seccion2Completados}/3`;
        
        // Sección 3
        const seccion3Campos = ['municipio'];
        const seccion3Completados = seccion3Campos.filter(campo => estadoCampos[campo]).length;
        const seccion3Porcentaje = seccion3Completados * 100;
        
        const seccion3Fill = document.querySelector('.mini-fill[data-section="3"]');
        const seccion3Count = document.querySelector('.section-count[data-section="3"]');
        
        if (seccion3Fill) seccion3Fill.style.width = `${seccion3Porcentaje}%`;
        if (seccion3Count) seccion3Count.textContent = `${seccion3Completados}/1`;
    }
    
    // Función para actualizar pasos del progreso
    function actualizarPasosProgreso() {
        // Calcular progreso por sección
        const secciones = [
            { campos: ['nombre', 'apellido-paterno', 'apellido-materno', 'telefono'], total: 4 },
            { campos: ['nivel-educativo', 'escuela', 'carrera'], total: 3 },
            { campos: ['municipio'], total: 1 }
        ];
        
        secciones.forEach((seccion, index) => {
            const pasoNumero = index + 1;
            const pasoElement = document.querySelector(`.step[data-step="${pasoNumero}"]`);
            const completados = seccion.campos.filter(campo => estadoCampos[campo]).length;
            const porcentajeSeccion = (completados / seccion.total) * 100;
            
            if (pasoElement) {
                if (porcentajeSeccion === 100) {
                    pasoElement.classList.add('active');
                } else if (porcentajeSeccion > 0) {
                    pasoElement.classList.add('active');
                    pasoElement.style.opacity = '0.8';
                } else {
                    pasoElement.classList.remove('active');
                    pasoElement.style.opacity = '1';
                }
            }
        });
    }
    
    // Función para actualizar estado del botón de enviar
    function actualizarEstadoBotonEnviar() {
        const btnEnviar = document.querySelector('.btn-primary[type="submit"]');
        let todosCompletados = true;
        
        camposObligatorios.forEach(campoId => {
            if (!estadoCampos[campoId]) {
                todosCompletados = false;
            }
        });
        
        const termsChecked = document.getElementById('terms').checked;
        
        if (btnEnviar) {
            if (todosCompletados && termsChecked) {
                btnEnviar.disabled = false;
                btnEnviar.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Registro';
            } else {
                btnEnviar.disabled = true;
                btnEnviar.innerHTML = '<i class="fas fa-lock"></i> Completa todos los campos';
            }
        }
    }
    
    // Función para validar formulario completo
    function validarFormularioCompleto() {
        let valido = true;
        
        camposObligatorios.forEach(campoId => {
            if (!estadoCampos[campoId]) {
                valido = false;
                
                // Resaltar campo incompleto
                const campo = document.getElementById(campoId);
                if (campo) {
                    campo.style.animation = 'shake 0.5s ease';
                    setTimeout(() => {
                        campo.style.animation = '';
                    }, 500);
                }
            }
        });
        
        return valido;
    }
    
    // Función para mostrar modal de confirmación
    function mostrarConfirmacion(registro) {
        modalBody.innerHTML = `
            <div class="confirmation-content">
                <div class="confirmation-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h4>¡Registro Guardado Exitosamente!</h4>
                <p>Gracias por completar el formulario GTU. Tus datos han sido registrados de manera segura.</p>
                
                <div class="confirmation-details">
                    <div class="detail-item">
                        <span class="detail-label">ID de Registro:</span>
                        <span class="detail-value">GTU-${registro.id.toString().slice(-6)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Nombre:</span>
                        <span class="detail-value">${registro.nombreCompleto}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Nivel Educativo:</span>
                        <span class="detail-value">${registro.nivelEducativo}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Carrera de Interés:</span>
                        <span class="detail-value">${registro.carrera}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Municipio:</span>
                        <span class="detail-value">${registro.municipio}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Fecha de Registro:</span>
                        <span class="detail-value">${new Date(registro.fechaRegistro).toLocaleDateString('es-MX')}</span>
                    </div>
                </div>
                
                <div class="confirmation-note">
                    <i class="fas fa-shield-alt"></i>
                    <span>Tus datos están protegidos y se utilizarán exclusivamente para análisis estadísticos educativos.</span>
                </div>
            </div>
        `;
        
        modal.classList.add('active');
    }
    
    // Función para mostrar errores
    function mostrarError(mensaje) {
        // Crear elemento de error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${mensaje}</span>
        `;
        
        // Estilos del error
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(errorDiv);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            errorDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => errorDiv.remove(), 300);
        }, 5000);
        
        // Agregar animaciones si no existen
        if (!document.querySelector('#error-animations')) {
            const style = document.createElement('style');
            style.id = 'error-animations';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Inicializar estado del botón
    actualizarEstadoBotonEnviar();
    
    // Inicializar resumen de secciones
    actualizarResumenSecciones();
    actualizarPasosProgreso();
});