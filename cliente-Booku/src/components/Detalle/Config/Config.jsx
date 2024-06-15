import React, { useEffect, useState } from 'react';
import { db } from '../../../config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Icon } from '@iconify/react/dist/iconify.js';

export default function Config(props) {
    let [nombre, setNombre] = useState("");
    let [retoGrupo, setRetoGrupo] = useState({});
    let [errores, setErrores] = useState({});
    let [passActual, setPassActual] = useState("");
    let [pass, setPass] = useState("");
    let [passNew, setPassNew] = useState("");
    let [passNewConf, setPassNewConf] = useState("");
    let [visiblePass, setVisiblePass] = useState(false);
    let [grupo, setGrupo] = useState("");
    let [confirmar, setConfirmar] = useState(false);
    let grupoDataRef = doc(db, 'grupos', props.idGrupo);

    useEffect(() => {
        if(grupo == ""){
            cargarExamen();
        }
    }, []);

    function cargarExamen() {
       
        getDoc(grupoDataRef)
            .then((docSnapshot) => {
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data();
                    setNombre(data.nombre);
                    setPassActual(data.password);
                    setGrupo(data);
                    let reto_id = data.reto_id.id;

                    if(reto_id){
                        fetch(`https://api-booku.vercel.app/reto/show/${reto_id}`, {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${props.usuario.accessToken}`,
                            },
                        })
                        .then(response => response.json())
                        .then(data => {
                            setRetoGrupo(data.data);
                        })
                        .catch(error => {
                            console.error("Error fetching reto data:", error);
                        });
                    }
                }
            })
            .catch(error => {
                console.error("Error fetching grupo data:", error);
            });
    }

    function validarCambios() {
        let err = {};

        if (pass != "" && passNew != ""){
            if (pass !== passActual) {
                err["contrasena"] = "Contraseñas no coinciden";
            }
            if (passNew !== passNewConf) {
                err["contrasena"] = "Contraseñas no coinciden";
            }
        }
        if (!nombre) {
            err["nombre"] = "El nombre no puede estar vacío";
        }
        if (Object.keys(err).length === 0) {
            editarGrupo();
        } else {
            setErrores(err);
        }
    }

    function editarGrupo() {
        const grupoDataRef = doc(db, 'grupos', props.idGrupo);

        updateDoc(grupoDataRef, {
            ...grupo,
            nombre: nombre,
            password: pass == passActual && passNew != "" ? passNew : passActual,
        })
        .then(() => {
            props.onMensaje();
        })
        .catch((error) => {
            props.onError();
        });
    }

    function removeReto(){
        delete grupo["reto_id"];
        setDoc(grupoDataRef, grupo)
        .then(() => {
            props.onRemove();
            setConfirmar(!confirmar)
        })
        .catch((error) => {
            props.onError();
        });
    }

    return (
        <section className='w-100'>
            <article className='form-input'>
                <h2>Código de unión</h2>
                <p className='fs-2'>{props.idGrupo}</p>
            </article>

            <h2 className='text-center'>Modificar</h2>
            <article className='form-input'>
                <h3 className='fs-1 text-primary'>Nombre de grupo</h3>
                <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </article>
            {retoGrupo && (
                <article className='form-input'>
                    <h3 className='fs-1 text-primary'>Nombre de reto</h3>
                    <div className='d-flex w-100 justify-content-center gap-3 align-items-center'>
                        <p className='fs-2 text-secondary'>{retoGrupo.nombre}</p>
                        <button onClick={() => {
                          setConfirmar(!confirmar)
                        }} className='btn btn-primary'>
                            <Icon icon="solar:trash-bin-minimalistic-bold" />
                        </button>
                    </div>
                </article>
            )}
            <article className='form-input'>
                <div className='form-input' style={{ display: (!visiblePass ? "flex" : "none") }}>
                    <h3 className='fs-1 text-primary'>Contraseña</h3>
                    <button className='btn fs-2 text-secondary p-0' onClick={() => setVisiblePass(!visiblePass)}>
                        Restablecer contraseña
                    </button>
                </div>
                <div className='w-100' style={{ display: (visiblePass ? "block" : "none") }}>
                    <article className='form-input'>
                        <h3 className='fs-1 text-primary'>Contraseña actual</h3>
                        <input type="password" onChange={(e) => setPass(e.target.value)} />
                    </article>
                    <article className='form-input'>
                        <h3 className='fs-1 text-primary'>Contraseña nueva</h3>
                        <input type="password" onChange={(e) => setPassNew(e.target.value)} />
                    </article>
                    <article className='form-input'>
                        <h3 className='fs-1 text-primary'>Confirma nueva contraseña</h3>
                        <input type="password" onChange={(e) => setPassNewConf(e.target.value)} />
                    </article>
                    <div className='d-flex justify-content-center w-100 mt-5'>
                        <button className='btn fs-2 text-secondary p-0' onClick={() => setVisiblePass(!visiblePass)}>
                            Cancelar
                        </button>
                    </div>
                </div>
            </article>
            {Object.keys(errores).length > 0 && (
                <div className='d-flex justify-content-center w-100 mt-5'>
                    <ul>
                        {Object.keys(errores).map((key) => (
                            <li key={key} className='text-danger fs-2'>{errores[key]}</li>
                        ))}
                    </ul>
                </div>
            )}
            <div className='d-flex justify-content-center w-100 mt-5'>
                <button onClick={validarCambios} className='btn btn-primary'>Guardar</button>
            </div>
            <div className={`modal fade justify-content-center align-items-center ${confirmar ? 'show' : ''}`} style={{ display: confirmar ? 'flex' : 'none' }}>
                    <div className="modal-content w-30">
                        <div className="modal-body">
                            <div className='d-flex flex-column py-5'>
                                <h2 className='fs-1 fw-bold text-primary text-center'>¿Quieres borrar el reto? Deberás crear otro nuevo</h2>
                                <div className='d-flex justify-content-between mt-5 pt-5'>
                                <button onClick={() => {
                                removeReto()
                                }} className='btn btn-danger-long'>Borrar</button>
                                <button className='btn btn-tertiary-dark' onClick={() => { setConfirmar(!confirmar) }}>Cerrar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        </section>
    );
}