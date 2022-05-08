//Cantidad maxima de procesos en memoria
const PROCESOS_MAX_EN_MEMORIA = 5;

//Tiempo maximo de espera
const MAX_LOCKED_TIME = 8;

// Cronómetros
const GLOBAL_TIMER = new Timer(1000);

//Proceso Nulo
const PROCESO_NULL = new Proceso(null, null, null);

//Quantium
let Quantium;
let valorQuantium;

// Lista de procesos
let procesosNuevos= [];
let procesosListos = [];
let procesosBloqueados = [];
let procesosTerminados = [];

let procesoActual;

let lastId;

// Detener proceso en ejecución
let abortController;
let abortSignal;

let pause;
let numeroLote = 0;
let numeroProcesos = 0;

//Memoria
let memory = new Memory();


document.addEventListener('DOMContentLoaded', function(){
    addEventListener();    
});

function addEventListener(){
    const botonIngresar =  document.querySelector('#ingresar');
    botonIngresar.addEventListener('click', ObtenerNumeroProcesos);  

    document.addEventListener('keydown', (e)=>{
        const alerta = document.querySelector('.alerta');
        switch(e.key){
            case 'e':
                if(!pause && procesoActual != PROCESO_NULL){
                    console.log('error');
                    procesoActual.resultado = 'ERROR';
                    setProcesoEstado(procesoActual, estados.TERMINADO, 'ERROR');
                    enviarTerminados();
                    Terminados(procesoActual);

                    if(!isLastProceso()){
                        sacarDeNuevos();
                        sacarDePreparados();
                    }else{
                        GLOBAL_TIMER.repeat(false);
                    }
                }
                break;
            case 'i':
                    alerta.innerHTML = `PROCESO BLOQUEADO`;
                    if(!pause && procesoActual != PROCESO_NULL){
                        setProcesoEstado(procesoActual, estados.BLOQUEADO, 'NULL');
                        memory.update(procesoActual.id, estados.BLOQUEADO);
                        procesosBloqueados.push(procesoActual);
                        sacarDePreparados();
                    }
                break;
            case 'p':
                    alerta.innerHTML = `PAUSE`;
                    console.log('Pause');
                    pause = true;
                    GLOBAL_TIMER.pause();
                break;
            case 'c':
                    alerta.innerHTML = ` `;
                    console.log('Continua');
                    pause = false;
                    document.querySelector('.contedorzote').style.display ='grid';
                    document.querySelector('.bcp').style.display = 'none';
                    document.querySelector('.paginas').style.display = 'none';
                    GLOBAL_TIMER.resume();
                break;
            case 'n':
                    if(!pause){
                        console.log('Nuevo Proceso');
                        GLOBAL_TIMER.repeat(true);
                        procesosNuevos.push(crearProcesos(lastId+1));
                    }
                break;
            case 't':
                console.log('BCP');
                pause = true;
                GLOBAL_TIMER.pause();
                document.querySelector('.contedorzote').style.display ='none';
                document.querySelector('.bcp').style.display = 'block';
                const bcp = document.querySelector('#BCP');
                bcp.innerHTML = ` `;
                
                if(procesoActual != PROCESO_NULL){
                    createBCPTable([procesoActual]);
                }
                createBCPTable(procesosNuevos);
                createBCPTable(procesosListos);
                createBCPTable(procesosBloqueados);
                createBCPTable(procesosTerminados);
               break;
            case 'a':
                console.log('Tabla de paginas');
                pause = true;
                GLOBAL_TIMER.pause();
                document.querySelector('.contedorzote').style.display ='none';
                document.querySelector('.paginas').style.display = 'block';
                const div = document.querySelector('#paginasProcesos');
                div.textContent = '';
                if(procesoActual != PROCESO_NULL){
                    actualizarTablaPaginas([procesoActual]);
                }
                actualizarTablaPaginas(procesosListos);
                actualizarTablaPaginas(procesosBloqueados);
                break;
            default:
                break;

        }
    });
}


function ObtenerNumeroProcesos(){
    const procesos = Number(document.querySelector('#procesos').value);
    Quantium = Number(document.querySelector('#quantium').value);

    //Valida si es un numero mayor a 0
    if(procesos && Quantium){
        if(Quantium >= 3 && Quantium <= 6){
            document.querySelector('.Nproceso').style.display = 'none';
            ingresarProceso(procesos);
        }else{
            alert('El valor del Quantum debe ser mayor de 3 y menor que 6');
        } 
    }else{
        alert('Debes ingresar por lo menos 1 proceso y el valor del Quantum');
    }   
}

function ingresarProceso(procesos){
    
    for(let i = 0; i<procesos; i++){
        const proceso = crearProcesos(i+1);
        procesosNuevos.push(proceso);
    }
    run();
}

async function run(){
    while(isSacarNuevos()){
        sacarDeNuevos();
    }   
    sacarDePreparados();
    sacarDeNuevos();

    actualizarMemoria();

    await manageProcess();    //Termino todos los procesos
    GLOBAL_TIMER.destroy();
    createFinalTable();

}


//Revisa si es posible agregar nuevos procesos a la cola --------------------
function isSacarNuevos(){
    if(procesosNuevos.length){
        return procesosNuevos.length > 0 && memory.freeFrames.length >= procesosNuevos[0].pages;
    }
    return false;
}


//---------------------------------------------------------------------------

/**
 * Si es posible, obtiene el proceso al frente de la cola de nuevos
 * y lo agrega a Listos, si el proceso en ejecucion es el nulo, entonces envia 
 * el proceso obtenido a ejecucion
*/
function sacarDeNuevos(){
    if(isSacarNuevos()){
        let process =  procesosNuevos.shift();
        setProcesoEstado(process, estados.LISTO, '-');
        process.llegada = GLOBAL_TIMER.currentCycle;
        procesosListos.push(process);
        memory.add(process);
        if(procesoActual == PROCESO_NULL){
            sacarDePreparados();
        }
    }
}


function sacarDePreparados(){
    if(procesosListos.length){
        //valorQuantium = Quantium;
        procesoActual = procesosListos.shift();
        procesoActual.quantum = 0;
        setProcesoEstado(procesoActual, estados.EJECUCION, '-');
        if(!procesoActual.respondio){
            //Calcula tiempo de  
            procesoActual.respuesta = GLOBAL_TIMER.currentCycle - procesoActual.llegada;
            procesoActual.respondio = true;
        }
        memory.update(procesoActual.id, estados.EJECUCION);
    }else{
        procesoActual = PROCESO_NULL;
    }
}

function sacarDeBloqueados(){
    if(procesosBloqueados.length && procesosBloqueados[0].bloqueado == MAX_LOCKED_TIME){
        let process = procesosBloqueados.shift();
        process.bloqueado = 0;
        setProcesoEstado(process, estados.LISTO, '-');
        procesosListos.push(process);
        memory.update(process.id, estados.LISTO);
        if(procesoActual == PROCESO_NULL){
            sacarDePreparados();
        }
    }
}

//Envia los procesos a Terminados
function enviarTerminados(){
    procesoActual.finalizo = GLOBAL_TIMER.currentCycle;
    procesosTerminados.push(procesoActual);
    memory.remove(procesoActual.id);
}

function checkQuantium(){
    if(procesoActual != PROCESO_NULL){
        document.querySelector('#VQuantium').textContent=`${procesoActual.quantum + 1}`;
    }else{
        document.querySelector('#VQuantium').textContent=`NULL`;
    }
   
}

function checkMemoryProcess(){
    if(++procesoActual.servicio == procesoActual.tiempoEstimado){
        setProcesoEstado(procesoActual, estados.TERMINADO, 'OK');
        Terminados(procesoActual);
        enviarTerminados();
        sacarDePreparados();
    }else if(++procesoActual.quantum == Quantium){
        procesosListos.push(procesoActual);
        setProcesoEstado(procesoActual, estados.LISTO, '-');
        memory.update(procesoActual.id, estados.LISTO);
        sacarDePreparados();
    }

    procesosBloqueados.forEach(process=>{
        process.info = MAX_LOCKED_TIME - (++process.bloqueado);
    });
    sacarDeNuevos();
    sacarDeBloqueados();
}


function setProcesoEstado(proceso, estado, info){
    proceso.estado = estado;
    proceso.info = info;
}

async function manageProcess(){
    return new Promise((resolve)=>{
        GLOBAL_TIMER
        .action(timer=>{

            if(isLastProceso()){
                //Termina timer
                timer.repeat(timer.currentCycle + procesoActual.remain - 1);
            }
            document.querySelector('#procesosNuevos').textContent = `Procesos Nuevos: ${procesosNuevos.length}`;
            document.querySelector('#numQuantium').textContent = `Quantum: ${Quantium}`;
            document.querySelector('#tiempoTotal').textContent = `Tiempo Global: ${timer.currentCycle} segundos`;
            
            
           
            checkMemoryProcess(); //Revisa si el tiempo maximo estimado de cada proceso finalizo
            actualizarPoceso();
            actualizarProcesosListos();
            checkQuantium();
            actualizarBloqueados();
            actualizarMemoria();
        })
        .done(resolve)
        .start();   
    })
}

function isLastProceso(){
    return !procesosNuevos.length && !procesosListos.length && !procesosBloqueados.length;
}

function actualizarMemoria(){
   memory.freeFrames.forEach(index => {
       let progressBar = document.getElementById(`progress-${index}`);
       progressBar.max = 100;
       progressBar.value = 0;
       progressBar.content = '0/4';
      
       const page = document.getElementById(`process-${index}`);
       page.textContent = 'FREE';
   });
   
   memory.occupiedFrames.forEach(index=>{
        const progressBar = document.getElementById(`progress-${index}`);
        const PInfo = document.getElementById(`info-${index}`);
        const frame = memory.frames[index];
        

        if(frame.state == estados.LISTO){
            progressBar.className='listo';
        }
        else if(frame.state == estados.EJECUCION){
            progressBar.className='ejecucion';
        }
        else if(frame.state == estados.BLOQUEADO){
            progressBar.className='bloqueado';
        }
        else if(frame.state == 'os'){
            progressBar.className='os';
        }
        const progress = frame.size * 100 / FRAME_SIZE;
        progressBar.value = progress;
        PInfo.textContent = `${frame.size}/${FRAME_SIZE}`;

        const page = document.getElementById(`process-${index}`);
        page.textContent = frame.id; 
   });

   document.getElementsByName('memoria-libre').forEach(e => e.textContent = `${memory.free}/${MEMORY_SIZE}`);
   document.getElementsByName('frames-libre').forEach(e => e.textContent = `${memory.freeFrames.length}/${TOTAL_FRAMES}`);
   document.getElementsByName('frames-ocupados').forEach(e => e.textContent = `${memory.occupiedFrames.length}/${TOTAL_FRAMES}`);
}

function actualizarTablaPaginas(procesos){
    const div = document.querySelector('#paginasProcesos');
    
    procesos.forEach(proceso=>{
        const table = document.createElement('table');
        table.className = 'tabla2';
        const thead = document.createElement('thead');
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.textContent = `Proceso: ${proceso.id}`;
        const td2 = document.createElement('td');
        td2.textContent = `Tamaño: ${proceso.size}  - Paginas: ${proceso.pages}`;
        // const td3 = document.createElement('td');
        // td3.textContent = `Paginas: ${proceso.pages}`;

        tr.append(td, td2);
        thead.append(tr);
        

        const tbody = document.createElement('tbody');
        const titulo  = document.createElement('tr');
        const pagina = document.createElement('td');
        pagina.textContent = 'Pagina';
        const frame = document.createElement('td');
        frame.textContent = 'Frame';
        table.append(pagina,frame);

        tbody.append(titulo);

        proceso.pageTable.forEach((frame, page)=>{
            const row = document.createElement('tr');
            const tdpage = document.createElement('td');
            tdpage.textContent = page;
            const tdFrame = document.createElement('td');
            tdFrame.textContent = frame;
            row.append(tdpage, tdFrame);
            tbody.append(row);
        });
        table.append(thead, tbody);
    

        div.append(table);
    })

    
}

