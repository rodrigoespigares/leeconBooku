import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react/dist/iconify.js';
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../../../config';

export default function HacerExamen(props) {
    let [preguntas, setPreguntas] = useState([
        { question: '', options: ['', '', '', ''], solution: '' }
    ]);
    let [respuestasSeleccionadas, setRespuestasSeleccionadas] = useState([]);
    let [fecha, setFecha] = useState("");
    let [entrega, setEntrega] = useState("");
    let [contrasena, setContrasena] = useState("");
    let [id_examen, setIdExamen] = useState();
    let [esconder, setEsconder] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if(props.idGrupo && props.usuario.accessToken){
            cargarExamen();
        }
        
    }, [props.idGrupo, props.usuario.accessToken]);

    function handleRespuestaSeleccionada(preguntaIndex, opcionText) {
        const nuevasRespuestas = [...respuestasSeleccionadas];
        if (!nuevasRespuestas.includes(opcionText)) {
            nuevasRespuestas[preguntaIndex] = opcionText;
            setRespuestasSeleccionadas(nuevasRespuestas);
        } else {
            nuevasRespuestas[preguntaIndex] = "";
            setRespuestasSeleccionadas(nuevasRespuestas);
        }
    }

    function cargarExamen() {
        let grupoDataRef = doc(db, 'grupos', props.idGrupo);
        getDoc(grupoDataRef)
            .then((docSnapshot) => {
                if (docSnapshot.exists()) {
                    setIdExamen(docSnapshot.data().examen_id);
                    fetch('https://api-booku.vercel.app/examenes/show/' + docSnapshot.data().examen_id,{
                        method: 'GET',
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Bearer "+props.usuario.accessToken
                        },
                    })
                        .then((response) => response.json())
                        .then((data) => {
                            const examData = data.data;
                            setFecha(new Date(examData.fecha).toISOString().slice(0, 16));
                            setEntrega(new Date(examData.tiempo).toISOString().slice(0, 16));
                            setContrasena(examData.contrasena);

                            const formattedPreguntas = examData.examen.preguntas.map((question, index) => ({
                                question: question,
                                options: examData.examen.respuestas[index],
                                solution: examData.examen.solucion[index]
                            }));

                            setPreguntas(formattedPreguntas);
                        });
                }
            });
    }

    function entregar() {
        let correctas = 0;
        preguntas.forEach((pregunta, index) => {
            if (pregunta.solution === respuestasSeleccionadas[index]) {
                correctas++;
            }
        });
        let nota = ((correctas * 10) / preguntas.length).toFixed(2);
        let premio = 100;

        let updatePromises = [];
        fetch(`https://api-booku.vercel.app/examenes/show/${id_examen}`,{
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer "+props.usuario.accessToken
            },
        }).then((response) => {
            return response.json();
        }).then((data) => {
            let tiempo = new Date(data.data.tiempo);

            let fechaActual = new Date();
            
            let tiempoMillis = tiempo.getTime();
            let fechaActualMillis = fechaActual.getTime();
                        

            if (!(tiempoMillis > fechaActualMillis)) {
                navigate(`/detalle/grupo/${props.idGrupo}`, { state: { error: 'Examen no se ha entregado ha pasado el tiempo de entrega.' } });
            }else{
                if (nota >= 5) {
                    let configCollection = collection(db, "config");
                    let configQuery = query(configCollection, where("user_id", "==", props.usuario.uid));
                    updatePromises.push(
                        getDocs(configQuery).then((querySnapshot) => {
                            let updatePromisesInner = [];
                            querySnapshot.forEach((doc) => {
                                let datos = doc.data();
                                datos.monedas = datos.monedas + (premio * nota);
                                updatePromisesInner.push(updateDoc(doc.ref, datos));
                            });
                            return Promise.all(updatePromisesInner);
                        })
                    );
                }
        
                let grupoDataRef = doc(db, 'grupos', props.idGrupo);
                updatePromises.push(
                    getDoc(grupoDataRef).then((docSnapshot) => {
                        if (docSnapshot.exists()) {
                            let datos = docSnapshot.data();
                            let key = props.usuario.uid;
                            if (datos.notas && typeof datos.notas === 'object') {
                                datos.notas[key] = nota;
                            } else {
                                datos.notas = { [key]: nota };
                            }
                            return updateDoc(docSnapshot.ref, datos);
                        }
                    })
                );
        
                Promise.all(updatePromises)
                    .then(() => {
                        navigate(`/detalle/grupo/${props.idGrupo}`, { state: { mensaje: 'Examen entregado exitosamente' } });
                    })
                    .catch((error) => {
                        console.error("Error updating document: ", error);
                    });
            }
        })

        
    }

    return (
        <section className='examen'>
            <h2 className='examen--title'>Hacer examen</h2>
            {preguntas.map((q, index) => (
                <article id={"pregunta" + index} key={"article" + index} className='examen__pregunta__vacia position-relative bg-secondary-800'>
                    <h2 className='text-white display-2 fw-bold'>{q.question}</h2>
                    <div className='d-flex flex-wrap w-100 justify-content-evenly row-gap-3'>
                        {q.options.map((option, optionIndex) => (
                            <div className={option.length >= 50 ? 'w-100' : 'w-45'} key={optionIndex}>
                                <button onClick={() => { handleRespuestaSeleccionada(index, option) }} className={'btn w-100 ' + (respuestasSeleccionadas.includes(option) ? "btn-selected" : "btn-primary")} htmlFor={"option_" + index + "_" + optionIndex}>
                                    {option}
                                </button>
                            </div>
                        ))}
                    </div>
                </article>
            ))}

            <button onClick={entregar} className='btn btn-primary mb-3'>
                Entregar
            </button>

            <section className={'menu__examen'} style={{ top: 40 - (preguntas.length <= 10 ? preguntas.length : 15) + "%", width: (esconder ? "min-content" : "50vw") }}>
                <div className={'d-flex flex-wrap w-100 overflow-hidden gap-3 menu__examen__preguntas'}>
                    {preguntas.map((q, index) => (
                        <a href={"#pregunta" + index} key={index} className='menu__examen--item'>{index + 1}</a>
                    ))}
                </div>
                <div className={'d-flex menu__examen__controladores '+ (esconder?'flex-column':'flex-row')}>
                    <a href={"#pregunta0"} className='menu__examen__controladores--item'>
                        <Icon icon="lets-icons:up" />
                    </a>
                    <a href={"#pregunta" + (preguntas.length - 1)} className='menu__examen__controladores--item'>
                        <Icon icon="lets-icons:down" />
                    </a>
                    <button className='menu__examen__controladores--item' onClick={() => { setEsconder(!esconder)}}>{esconder?(<Icon className='display-5' icon="mingcute:left-line" />):(<Icon className='display-5' icon="mingcute:right-line" />)}</button>
                </div>
            </section>
        </section>
    );
}