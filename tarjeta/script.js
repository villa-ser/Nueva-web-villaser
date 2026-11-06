// ==========================================
// SCRIPT DE TARJETA VIRTUAL - VILLASER
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    // Sincronizar el icono de tema al cargar
    const html = document.documentElement;
    const iconoTema = document.getElementById('icono-tema');
    if (iconoTema) {
        if (html.getAttribute('data-theme') === 'light') {
            iconoTema.classList.remove('fa-moon');
            iconoTema.classList.add('fa-sun');
        } else {
            iconoTema.classList.remove('fa-sun');
            iconoTema.classList.add('fa-moon');
        }
    }

    // Animación de aparición en cascada
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -20px 0px', 
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        const elementosVisibles = entries.filter(entry => entry.isIntersecting);
        elementosVisibles.forEach((entry, index) => {
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, index * 100); 
            observer.unobserve(entry.target);
        });
    }, observerOptions);

    const elementosAnimar = document.querySelectorAll('.fade-in-up');
    elementosAnimar.forEach(el => observer.observe(el));
});

// LÓGICA DE TEMA (MODO DÍA/NOCHE)
function toggleTema() {
    const html = document.documentElement;
    const iconoTema = document.getElementById('icono-tema');
    
    if (html.getAttribute('data-theme') === 'light') {
        html.removeAttribute('data-theme');
        localStorage.setItem('temaVillaser', 'dark');
        if (iconoTema) { 
            iconoTema.classList.remove('fa-sun'); 
            iconoTema.classList.add('fa-moon'); 
        }
    } else {
        html.setAttribute('data-theme', 'light');
        localStorage.setItem('temaVillaser', 'light');
        if (iconoTema) { 
            iconoTema.classList.remove('fa-moon'); 
            iconoTema.classList.add('fa-sun'); 
        }
    }
}

// NAVEGACIÓN ENTRE BOTONES Y FORMULARIO
function showForm() {
  document.getElementById('headerSection') ? document.getElementById('headerSection').style.display = 'none' : null;
  document.getElementById('mainButtons').style.display = 'none';
  
  const fs = document.getElementById('formSection');
  fs.style.display = 'block';
  setTimeout(() => fs.classList.add('visible'), 10);
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hideFormMobile() {
  document.getElementById('mainButtons').style.display = 'flex';
  
  const fs = document.getElementById('formSection');
  fs.style.display = 'none';
  fs.classList.remove('visible');
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// MANEJO DEL FORMULARIO
function handleSubmit() {
  const btn = document.getElementById('btnSubmit');
  if (btn) {
      btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Enviando...';
      btn.style.pointerEvents = 'none';
  }
  
  setTimeout(() => {
    const formEl = document.getElementById('consultForm');
    const msgEl = document.getElementById('success-message');
    
    if (formEl) formEl.style.display = 'none';
    if (msgEl) msgEl.style.display = 'block';
    
    if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Enviar Consulta';
        btn.style.pointerEvents = 'auto';
    }
  }, 1500);
}

function resetFormState() {
  const formEl = document.getElementById('consultForm');
  const msgEl = document.getElementById('success-message');
  
  if (formEl) {
    formEl.reset();
    formEl.style.display = 'flex'; 
  }
  if (msgEl) {
    msgEl.style.display = 'none';
  }
  hideFormMobile();
}

// DESCARGAR CONTACTO Y COMPARTIR
function descargarVCard() {
  const vcard = `BEGIN:VCARD
VERSION:3.0
FN:Sergio Villagra - Electricista
ORG:Electricista Habilitado Cat III
TEL;TYPE=CELL,VOICE,PREF:+5493513559347
EMAIL:contacto@villaser.com.ar
URL:https://villaser.com.ar
NOTE:Idóneo Registro Nro. 29029389 - 14027
END:VCARD`;

  const blob = new Blob([vcard], { type: 'text/vcard' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'Sergio_Villagra.vcf';
  
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  URL.revokeObjectURL(url);
}

function compartirTarjeta() {
  if (navigator.share) {
    navigator.share({
      title: 'Sergio Villagra - Electricista',
      text: '¡Hola! Te comparto el contacto de Sergio Villagra (Electricista Habilitado Cat III):',
      url: window.location.href
    })
    .catch((error) => console.log('Error al compartir', error));
  } else {
    const whatsappUrl = "https://wa.me/?text=" + encodeURIComponent("¡Hola! Te comparto el contacto de Sergio Villagra (Electricista Habilitado): https://villaser.com.ar/tarjeta/index.html");
    window.open(whatsappUrl, '_blank');
  }
}
