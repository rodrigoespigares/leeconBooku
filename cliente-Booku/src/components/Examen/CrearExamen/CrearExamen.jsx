import { Icon } from '@iconify/react/dist/iconify.js'
import { collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react'
import { db } from '../../../config';
import { useNavigate } from 'react-router-dom';

export default function CrearExamen(props) {
    let navega = useNavigate();
    const [preguntas, setPreguntas] = useState([
        { question: '', options: ['', '', '', ''], solution: '' }
    ]);
    let [modal, setModal] = useState(false);
    let [fecha, setFecha] = useState("");
    let [entrega, setEntrega] = useState("");
    let [contrasena, setContrasena] = useState("");
    let [confPass, setConfPass] = useState("");
    let [errores, setErrores] = useState({});
    let [id_examen, setIdExamen] = useState();
    let [passTipo, setPassTipo] = useState("password");
    let [confPassTipo, setConfPassTipo] = useState("password");
    let [esconder, setEsconder]=useState(true);

    useEffect(() => {
        if (props.accion === "editar" && props.idGrupo && props.usuario.accessToken) {
            cargaExamen();
        }
    }, [props.accion, props.idGrupo, props.usuario.accessToken]);

    function cargaExamen() {
        let grupoDataRef = doc(db, 'grupos', props.idGrupo);
        getDoc(grupoDataRef)
            .then((docSnapshot) => {
                if (docSnapshot.exists()) {
                    setIdExamen(docSnapshot.data().examen_id);
                    fetch('https://api-booku.vercel.app/examenes/show/' + docSnapshot.data().examen_id, {
                        method: 'GET',
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Bearer " + props.usuario.accessToken
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
                        })
                }
            });
    }

    function addQuestion() {
        setPreguntas([...preguntas, { question: '', options: ['', '', '', ''], solution: '' }]);
    };

    function handleQuestionChange(index, value) {
        const newpreguntas = [...preguntas];
        newpreguntas[index].question = value;
        setPreguntas(newpreguntas);
    };

    function handleOptionChange(questionIndex, optionIndex, value) {
        const newpreguntas = [...preguntas];
        newpreguntas[questionIndex].options[optionIndex] = value;
        setPreguntas(newpreguntas);
    };

    function solutionCheck(questionIndex, optionIndex) {
        const newpreguntas = [...preguntas];
        newpreguntas[questionIndex].solution = newpreguntas[questionIndex].options[optionIndex];
        setPreguntas(newpreguntas);
    }

    function deleteQuestion(index) {
        const newPreguntas = preguntas.filter((p, i) => i !== index);
        setPreguntas(newPreguntas);
    }

    function validateExam() {
        let err = {};
        if (new Date(fecha) >= new Date(entrega)) {
            err['date'] = "La fecha del examen debe ser anterior a la fecha de entrega.";
        }
        for (let i = 0; i < preguntas.length; i++) {
            if (preguntas[i].question.trim() === "") {
                err['preguntas'] = "Hay preguntas vacías en el examen";
            }
        }
        for (let i = 0; i < preguntas.length; i++) {
            for (let j = 0; j < preguntas[i].options.length; j++) {
                if (preguntas[i].options[j].trim() === "") {
                    err['opciones'] = "Hay opciones vacías en el examen";
                }
            }
        }
        for (let i = 0; i < preguntas.length; i++) {
            if (preguntas[i].solution === undefined || preguntas[i].solution.trim() === "") {
                err['soluciones'] = "Hay soluciones sin marcar en el examen";
            }
        }
        if (contrasena.trim().length < 6) {
            err['contrasena'] = "La longitud mínima de la contraseña debe ser de al menos 6 caracteres.";
        }
        if (contrasena.trim() === "" || confPass.trim() === "") {
            err['contrasena'] = "La contraseña y su confirmación son requeridas.";
        }
        if (contrasena !== confPass) {
            err['contrasena'] = "La contraseña y su confirmación no coinciden.";
        }
        if (Object.keys(err).length > 0) {
            setErrores(err);
        } else {
            setErrores({});
            if (props.check === "editar") {
                editExam();
            } else {
                saveExam();
            }
        }
    }

    function editExam() {
        let preg = preguntas.map(p => p.question);
        let respuestas = preguntas.map(p => p.options);
        let soluciones = preguntas.map(p => p.solution);

        let data = {
            preguntas: preg,
            respuestas: respuestas,
            solucion: soluciones,
            contrasena: contrasena,
            id_grupo: props.idGrupo,
            uid: props.usuario.uid,
            fecha: new Date(fecha),
            tiempo: new Date(entrega)
        }

        fetch('https://api-booku.vercel.app/examenes/edit/' + id_examen, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${props.usuario.accessToken}`,
            },
            body: JSON.stringify(data)
        }).then((response) => response.json())
            .then((data) => {
                navega(`/detalle/grupo/${props.idGrupo}`, { state: { mensaje: "El examen ha sido editado correctamente." } })
            })
    }

    function saveExam() {
        let preg = preguntas.map(p => p.question);
        let respuestas = preguntas.map(p => p.options);
        let soluciones = preguntas.map(p => p.solution);

        let data = {
            preguntas: preg,
            respuestas: respuestas,
            solucion: soluciones,
            contrasena: contrasena,
            id_grupo: props.idGrupo,
            uid: props.usuario.uid,
            fecha: new Date(fecha),
            tiempo: new Date(entrega)
        }

        fetch('https://api-booku.vercel.app/examenes/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${props.usuario.accessToken}`,
            },
            body: JSON.stringify(data)
        }).then((response) => response.json())
            .then((data) => {
                let grupoDataRef = doc(db, 'grupos', props.idGrupo);
                getDoc(grupoDataRef)
                    .then((docSnapshot) => {
                        if (docSnapshot.exists()) {
                            return updateDoc(grupoDataRef, {
                                examen_id: data.head.id
                            }).then(() => {
                                navega(`/detalle/grupo/${props.idGrupo}`, { state: { mensaje: "El examen ha sido creado correctamente." } })
                            });
                        }
                    })

            })
    }

    return (
        <section className='examen'>
            <h2 className='examen--title'><span>{props.check}</span> examen</h2>
            {preguntas.map((q, index) => (
                <article id={"pregunta" + index} key={"article" + index} className='examen__pregunta__vacia position-relative'>
                    <button onClick={() => deleteQuestion(index)} className='btn btn-danger badge position-absolute end-0 top-0 mt-3 me-5'>
                        <Icon className='fs-2' icon="solar:trash-bin-minimalistic-2-outline" />
                    </button>
                    <input
                        className='examen__pregunta__vacia--pregunta'
                        type="text"
                        placeholder='Añade la pregunta'
                        value={q.question}
                        onChange={(e) => handleQuestionChange(index, e.target.value)}
                    />
                    {q.options.map((option, optionIndex) => (
                        <div className='d-flex' key={optionIndex}>
                            <input
                                type='radio'
                                name={'solucion_' + index}
                                onChange={() => solutionCheck(index, optionIndex)}
                                checked={q.solution === option}
                            />
                            <input
                                className='examen__pregunta__vacia--opcion'
                                type="text"
                                placeholder='Añade opciones'
                                value={option}
                                onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                            />
                        </div>
                    ))}
                </article>
            ))}
            <button className='btn mt-4' onClick={addQuestion}>
                <Icon className='icon' icon="ph:plus-circle" />
            </button>
            <button onClick={() => setModal(!modal)} className='btn btn-primary mb-3'>
                {props.check == "editar" ? "Editar" : "Crear"}
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
                    <button className='menu__examen__controladores--item' onClick={() => {setEsconder(!esconder)}}>{esconder?(<Icon className='display-5' icon="mingcute:left-line" />):(<Icon className='display-5' icon="mingcute:right-line" />)}</button>
                </div>
                
            </section>

            <div className={`modal fade justify-content-center align-items-center ${modal ? 'show' : ''}`} id="recompensas" style={{ display: modal ? 'flex' : 'none' }} onClick={(event) => { event.stopPropagation(); setModal(!modal); }}>
                <div className="recompensas modal-content w-md-50">
                    <div className="modal-body" onClick={(event) => event.stopPropagation()}>
                        <div>
                            <h2 className='display-6'>Acabemos de crear el examen</h2>
                            <button onClick={() => setModal(!modal)} type="button" className="btn position-absolute top-0 end-0">
                                <Icon className='display-1' icon="material-symbols:close-rounded" />
                            </button>
                        </div>
                        <div className='d-flex flex-column align-items-center flex-wrap gap-5 w-100'>
                            <div className='d-flex flex-column w-50 gap-5'>
                                <div className='form-input'>
                                    <label htmlFor="fecha">Fecha de examen</label>
                                    <input type="datetime-local" id='fecha' value={fecha} onChange={(e) => setFecha(e.target.value)} />
                                </div>
                                <div className='form-input'>
                                    <label htmlFor="entrega">Fecha de entrega</label>
                                    <input type="datetime-local" id='entrega' value={entrega} onChange={(e) => setEntrega(e.target.value)} />
                                </div>
                                <div className='form-input d-flex flex-column w-100'>
                                    <label htmlFor="contrasena">Contraseña</label>
                                    <div className='w-100'>
                                        <div className='form-input position-relative'>
                                            <input type={passTipo} id='contrasena' value={contrasena} onChange={(e) => setContrasena(e.target.value)} />
                                            <button className='btn position-absolute top-0 end-0 mt-2' onClick={() => {
                                                setPassTipo(passTipo == "password" ? "text" : "password")
                                            }}>
                                                {passTipo == "password" ? (<Icon className='display-1 text-white' icon="ph:eye-closed" />) : (<Icon className='display-1 text-white' icon="mdi:eye-outline" />)}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className='form-input d-flex flex-column w-100'>
                                    <label htmlFor="conf-contrasena">Confirmar contraseña</label>
                                    <div className='w-100'>
                                        <div className='form-input position-relative'>
                                            <input type={confPassTipo} id='conf-contrasena' value={confPass} onChange={(e) => setConfPass(e.target.value)} />
                                            <button className='btn position-absolute top-0 end-0 mt-2' onClick={() => {
                                                setConfPassTipo(confPassTipo == "password" ? "text" : "password")
                                            }}>
                                                {confPassTipo == "password" ? (<Icon className='display-1 text-white' icon="ph:eye-closed" />) : (<Icon className='display-1 text-white' icon="mdi:eye-outline" />)}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {Object.keys(errores).length > 0 && (
                                    <div className="text-danger">
                                        <ul>
                                            {Object.values(errores).map((error, index) => (
                                                <li key={index}>{error}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <button onClick={validateExam} className='btn btn-primary'>{props.check == "editar" ? "Editar" : "Crear"}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}