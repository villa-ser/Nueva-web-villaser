function ejecutarBusqueda() {
    const rawQuery = document.getElementById("searchInput").value;
    const resultsContainer = document.getElementById("resultsContainer");
    resultsContainer.innerHTML = "";

    if (rawQuery.trim() === "") return;

    const palabrasBusqueda = obtenerPalabrasClave(rawQuery).filter(p => !palabrasVacias.has(p)).slice(0, 5);

    if (palabrasBusqueda.length === 0) {
        resultsContainer.innerHTML = `<div class="corp-card fade-in-up visible" style="text-align:center; padding: 25px 15px;"><span style="color:var(--ngc-text-main); font-weight:600;">Por favor ingresá términos técnicos específicos.</span><br><span style="font-size:0.8rem; color:var(--ngc-text-faded); display:block; margin-top:10px;">Ej: "tablero", "boca", "jabalina"</span></div>`;
        return;
    }

    const coincidencias = [];
    const busquedaCompleta = rawQuery.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    const busquedaCompletaNorm = normalizarFoneticaYPlural(busquedaCompleta);

    for (const item of allData) {
        let score = 0; 
        const conceptoNormalizado = item.concepto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        const conceptoNormalizadoFonetico = normalizarFoneticaYPlural(conceptoNormalizado);
        const palabrasDelConcepto = obtenerPalabrasClave(item.concepto);
        
        if (conceptoNormalizado.includes(busquedaCompleta)) {
            score += 100;
            if (conceptoNormalizado === busquedaCompleta) score += 50; 
        } else if (conceptoNormalizadoFonetico.includes(busquedaCompletaNorm)) {
            score += 80;
            if (conceptoNormalizadoFonetico === busquedaCompletaNorm) score += 40; 
        }

        let cumpleTodas = true;
        for (const palabraBuscada of palabrasBusqueda) {
            const opcionesBuscadas = obtenerSinonimos(palabraBuscada);
            let mejorPuntajePalabra = 0;
            let palabraEncontrada = false;

            for (const opcion of opcionesBuscadas) {
                const opcionFonetica = normalizarFoneticaYPlural(opcion);
                for (const palabraConcepto of palabrasDelConcepto) {
                    const conceptoFonetico = normalizarFoneticaYPlural(palabraConcepto);

                    if (opcion === palabraConcepto) {
                        palabraEncontrada = true;
                        mejorPuntajePalabra = Math.max(mejorPuntajePalabra, opcion === palabraBuscada ? 10 : 7);
                    } else if (opcionFonetica === conceptoFonetico) {
                        palabraEncontrada = true;
                        mejorPuntajePalabra = Math.max(mejorPuntajePalabra, opcion === palabraBuscada ? 9 : 6);
                    } else if (sonSimilares(opcion, palabraConcepto)) {
                        palabraEncontrada = true;
                        mejorPuntajePalabra = Math.max(mejorPuntajePalabra, 4);
                    } else if (sonSimilares(opcionFonetica, conceptoFonetico)) {
                        palabraEncontrada = true;
                        mejorPuntajePalabra = Math.max(mejorPuntajePalabra, 3);
                    }
                }
            }
            if (!palabraEncontrada) { cumpleTodas = false; break; }
            score += mejorPuntajePalabra;
        }
        if (cumpleTodas) coincidencias.push({ item: item, score: score });
    }

    coincidencias.sort((a, b) => b.score - a.score);
    const mejoresResultados = coincidencias.slice(0, 10).map(c => c.item);

    if (mejoresResultados.length === 0) {
        resultsContainer.innerHTML = `<div class="corp-card fade-in-up visible" style="text-align:center; padding: 25px 15px;"><span style="color:var(--error-red); font-weight:600;">No se encontraron precios referenciales.</span><br><span style="font-size:0.8rem; color:var(--ngc-text-faded); display:block; margin-top:10px;">Intentá usar palabras más cortas o generales. (Ej: "tablero", "boca", "jabalina")</span></div>`;
        return;
    }

    mejoresResultados.forEach(item => {
        let precioFormat = "$ Consultar";
        let priceNum = Number(item.precio);
        if (!isNaN(priceNum) && item.precio !== "") {
            precioFormat = `$ ${priceNum.toLocaleString('es-AR')}`;
        } else if (item.precio) {
            precioFormat = `$ ${item.precio}`;
        }

        const card = document.createElement("div");
        
        // ACÁ ESTÁ LA MAGIA DEL ESTILO: usamos corp-card para los resultados
        card.className = "corp-card fade-in-up visible"; 
        card.style.cursor = "pointer";
        card.style.padding = "20px";

        const mensajeWp = encodeURIComponent(`Hola Sergio, quisiera solicitar un presupuesto a medida basado en este concepto: "${item.concepto}". Vi que el valor referencial de mano de obra es de ${precioFormat}.`);
        const urlWp = `https://wa.me/543513559347?text=${mensajeWp}`;

        // Reestructurado al 100% con HTML en línea para evitar requerir más CSS externo
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                <span style="font-size: 0.95rem; font-weight: 700; color: var(--ngc-text-main); flex: 1; padding-right: 15px; line-height: 1.4;">${item.concepto}</span>
                <div style="text-align: right; min-width: 90px;">
                    <span style="font-size: 1.1rem; font-weight: 700; color: var(--ngc-neon); display: block;">${precioFormat}</span>
                    <span style="font-size: 0.65rem; color: var(--ngc-text-faded); text-transform: uppercase; font-weight: 600;">Solo M. de Obra</span>
                </div>
            </div>
            
            <div class="result-obs-preview" style="font-size: 0.8rem; color: var(--ngc-neon); display: flex; align-items: center; gap: 6px; font-weight: 500;">
                <i class="fa-solid fa-chevron-down acc-icon-indicator" style="transition: transform 0.3s;"></i> <span class="txt-ver-mas">Ver detalles</span>
            </div>
            
            <div class="result-details" style="margin-top: 15px; border-top: 1px solid var(--ngc-privacy-border); padding-top: 15px; display: none;">
                <div style="margin-bottom: 12px; font-size: 0.85rem;">
                    <span style="color: var(--ngc-text-faded); font-weight: 600; font-size: 0.75rem; text-transform: uppercase;">Observaciones</span><br> 
                    <span style="color: var(--ngc-text-main); display: block; margin-top: 3px;">${item.observaciones ? item.observaciones : "Precio estimativo por el servicio de instalación. No incluye materiales."}</span>
                </div>
                <div style="display: flex; gap: 15px; margin-bottom: 18px;">
                    <div style="flex: 1; font-size: 0.85rem;">
                        <span style="color: var(--ngc-text-faded); font-weight: 600; font-size: 0.75rem; text-transform: uppercase;">Entidad</span><br> 
                        <span style="color: var(--ngc-text-main); display: block; margin-top: 3px;">${item.organizacion}</span>
                    </div>
                    <div style="flex: 1; font-size: 0.85rem;">
                        <span style="color: var(--ngc-text-faded); font-weight: 600; font-size: 0.75rem; text-transform: uppercase;">Categoría</span><br> 
                        <span style="color: var(--ngc-text-main); display: block; margin-top: 3px;">${item.tema}</span>
                    </div>
                </div>
                
                <a href="${urlWp}" target="_blank" class="corp-btn success-btn btn-whatsapp" style="width: 100%;">
                    <i class="fab fa-whatsapp" style="font-size: 1.1rem;"></i> Consultar Viabilidad
                </a>
            </div>
        `;

        // Lógica de acordeón resuelta en JavaScript (sin tocar CSS extra)
        card.addEventListener("click", (e) => {
            if (e.target.closest('.btn-whatsapp')) return; // Evita que se abra/cierre si tocás el botón
            
            card.classList.toggle("active");
            
            const details = card.querySelector('.result-details');
            const icon = card.querySelector('.acc-icon-indicator');
            const txt = card.querySelector('.txt-ver-mas');
            
            if (card.classList.contains("active")) {
                details.style.display = "block";
                icon.style.transform = "rotate(180deg)";
                txt.textContent = "Ocultar detalles";
            } else {
                details.style.display = "none";
                icon.style.transform = "rotate(0deg)";
                txt.textContent = "Ver detalles";
            }
        });

        resultsContainer.appendChild(card);
    });
        }
