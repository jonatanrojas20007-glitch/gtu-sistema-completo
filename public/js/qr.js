document.addEventListener('DOMContentLoaded', function() {
    const qrInput = document.getElementById('qr-data');
    const generateBtn = document.getElementById('generate-qr');
    const downloadBtn = document.getElementById('download-qr');
    const qrContainer = document.getElementById('qr-code');
    
    let qrCode = null;
    
    generateBtn.addEventListener('click', function() {
        const data = qrInput.value.trim();
        if(!data) {
            alert('Por favor ingrese datos para generar el QR');
            return;
        }
        
        // Limpiar contenedor previo
        qrContainer.innerHTML = '';
        
        // Generar nuevo QR
        qrCode = new QRCode(qrContainer, {
            text: data,
            width: 200,
            height: 200,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        
        // Mostrar botón de descarga
        downloadBtn.style.display = 'block';
    });
    
    downloadBtn.addEventListener('click', function() {
        if(!qrContainer.hasChildNodes()) {
            alert('Primero genere un código QR');
            return;
        }
        
        const canvas = qrContainer.querySelector('canvas');
        if(canvas) {
            const link = document.createElement('a');
            link.download = `gtu-qr-${qrInput.value}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    });
    
    // Generar QR por defecto al cargar la página
    if(qrInput.value) {
        generateBtn.click();
    }
});