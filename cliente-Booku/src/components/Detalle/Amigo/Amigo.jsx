import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from '../../../config';


export default function Amigo(props) {
    const [confirmar, setConfirmar] = useState(false);
    const [borrado, setBorrado] = useState(0);
    let [botones, setBotones] = useState("");

    useEffect(() => {
        if (props.usuario.uid) {
            actualizaBotones();
        }


    }, [props.usuario]);

    function actualizaBotones() {
        const amigosCollection = collection(db, "amigos");
        const docRef = doc(amigosCollection, props.usuario.uid);

        getDoc(docRef)
            .then((docSnapshot) => {
                if (docSnapshot.exists()) {
                    if (docSnapshot.data().solicitudes.includes(props.id)) {
                        setBotones(<div className='d-flex gap-2 w-100'> <button onClick={() => { gestion(props.id, true) }} className='btn btn-success w-50'>Aceptar</button> <button onClick={() => { gestion(props.id, false) }} className='btn btn-danger w-50'>Rechazar</button> </div>)
                    } else if (docSnapshot.data().pendientes.includes(props.id)) {
                        setBotones(<button className='btn btn-warning'>Solicitado</button>)
                    } else if (docSnapshot.data().amigos.includes(props.id)) {
                        setBotones(<button onClick={() => { setBorrado(props.id); setConfirmar(!confirmar) }} className='btn btn-danger'>Eliminar amigo</button>)
                    } else if (props.id != props.usuario.uid) {
                        setBotones(<button onClick={() => { soliFriend(props.id) }} className='btn btn-info'>Enviar petición</button>)
                    }
                } else {
                    console.log("No such document!");
                }
            })
            .catch((error) => {
                console.error("Error fetching document:", error);
            });
    }
    function gestion(id, add) {
        let amigosCollection = collection(db, "amigos");
        let docRef = doc(amigosCollection, props.usuario.uid);
        let newSolicitudes = []

        let amigoRef = doc(amigosCollection, id);

        getDoc(docRef)
            .then((docSnapshot) => {
                if (docSnapshot.exists()) {
                    let data = docSnapshot.data();

                    let newAmigos = [];
                    let idBorrada = "";
                    // SOLICITUDES

                    data.solicitudes.map((e) => {
                        if (e != id) {
                            newSolicitudes.push(e)
                        } else {
                            idBorrada = e
                        }
                    })


                    updateDoc(docRef, { solicitudes: newSolicitudes }).then(() => {
                        props.onActualizarAmigos();
                    });

                    if (add == true) {
                        data.amigos.map((e) => {
                            newAmigos.push(e);
                        })
                        newAmigos.push(id);
                        updateDoc(docRef, { amigos: newAmigos }).then(() => {
                            props.onActualizarAmigos();
                        });
                    }
                }
            })
        getDoc(amigoRef)
            .then((docSnapshot) => {
                if (docSnapshot.exists()) {
                    let data = docSnapshot.data();

                    let newAmigos = [...data.pendientes];

                    let idBorrada = props.usuario.uid;
                    newAmigos = newAmigos.filter((e) => {
                        return e !== idBorrada;
                    });

                    updateDoc(amigoRef, { pendientes: newAmigos }).then(() => {
                        actualizaBotones()
                    });

                    if (add) {
                        newAmigos = [...data.amigos];
                        newAmigos.push(props.usuario.uid);
                        updateDoc(amigoRef, { amigos: newAmigos }).then(() => {
                            actualizaBotones()
                        });
                    }
                }
            })
    }
    function soliFriend(id) {
        let amigosCollection = collection(db, "amigos");
        let docRef = doc(amigosCollection, props.usuario.uid);
        let amigoClear = doc(amigosCollection, id);
        props.onActualizarAmigos();
        let solicitado = false;

        getDoc(docRef)
            .then((docSnapshot) => {
                if (docSnapshot.exists()) {
                    let peticiones = [];
                    peticiones.push(...docSnapshot.data().pendientes)
                    if (!docSnapshot.data().solicitudes.includes(id)) {
                        peticiones.push(id)
                        solicitado = true;
                    }
                    updateDoc(docRef, { pendientes: peticiones }).then(() => {
                        props.onActualizarAmigos();
                        actualizaBotones();
                    });

                }
            });


        getDoc(amigoClear)
            .then((docSnapshot) => {
                if (docSnapshot.exists()) {
                    let data = docSnapshot.data();
                    let amigosSolicitudes = data.solicitudes;
                    if (solicitado) {
                        amigosSolicitudes.push(props.usuario.uid)
                    }
                    updateDoc(amigoClear, { solicitudes: amigosSolicitudes });
                }
            })
    }
    function removeFriend(id) {
        let updateAmigos = props.amigosUser;
        let amigosCollection = collection(db, "amigos");
        let docRef = doc(amigosCollection, props.usuario.uid);
        let amigoClear = doc(amigosCollection, id);


        getDoc(docRef)
            .then((docSnapshot) => {
                if (docSnapshot.exists()) {
                    updateAmigos = updateAmigos.filter(usuario => usuario.user_id !== id).map(usuario => usuario.user_id);
                    updateDoc(docRef, { amigos: updateAmigos }).then(() => {
                        actualizaBotones()
                    });
                    setConfirmar(!confirmar)
                    props.onActualizarAmigos();

                }
            });

        getDoc(amigoClear)
            .then((docSnapshot) => {
                if (docSnapshot.exists()) {
                    let data = docSnapshot.data();
                    let amigosBorrado = data.amigos.filter(usuario => usuario !== props.usuario.uid);
                    updateDoc(amigoClear, { amigos: amigosBorrado });
                }
            })
    }
    return (
        <section className='detalle'>
            <section className='d-flex flex-column gap-5'>
                <div className='d-flex gap-5'>
                    <div className='detalle__foto'>
                        <img className='w-100' src={props.info.foto} alt={"Foto de perfil de " + props.info.user_name} />
                    </div>
                    <div className='d-flex flex-column text-primary'>
                        <h2 className='fs-1 fw-bold'>{props.info.user_name}</h2>
                        {props.lastConx && (
                            <p className='fs-3'><b>Última conexión: </b>{new Date(props.lastConx.seconds * 1000).getDate() + '/' + (new Date(props.lastConx.seconds * 1000).getMonth() + 1) + '/' + new Date(props.lastConx.seconds * 1000).getFullYear()}</p>
                        )}
                        {botones}
                    </div>
                </div>
                <div className='home-cubos rounded-5 h-40 px-5 retos'>
                    <h2>Retos Actuales</h2>
                    {props.retoAmigoActual && props.retoAmigoActual.map((reto) => (
                        <article className='retos_reto' key={"actual" + reto.id + "_" + reto.fecha.nanoseconds}>
                            <div className='d-flex flex-column align-items-baseline'>
                                <p>{reto.nombre}</p>
                                <p>{new Date(reto.fecha.seconds * 1000).getDate() + '/' + (new Date(reto.fecha.seconds * 1000).getMonth() + 1) + '/' + new Date(reto.fecha.seconds * 1000).getFullYear()}</p>
                            </div>
                            <Link to={'/detalle/reto/' + reto.id} className='btn btn-primary'><Icon className='fs-1' icon="simple-line-icons:user-follow" /></Link>
                        </article>
                    ))}
                </div>
                <div className='home-cubos rounded-5 h-40 py-2 px-5 retos'>
                    <h2>Historial</h2>
                    {props.retoAmigo && props.retoAmigo.map((retoHecho) => {
                        return (
                            <article className='retos_reto' key={"historial" + retoHecho.id + "_" + retoHecho.fecha.nanoseconds}>
                                <div className='d-flex flex-column align-items-baseline'>
                                    <p>{retoHecho.nombre}</p>
                                    <p>{new Date(retoHecho.fecha.seconds * 1000).getDate() + '/' + (new Date(retoHecho.fecha.seconds * 1000).getMonth() + 1) + '/' + new Date(retoHecho.fecha.seconds * 1000).getFullYear()}</p>
                                </div>
                                <Link to={'/detalle/reto/' + retoHecho.id} className='btn btn-primary'><Icon className='fs-1' icon="simple-line-icons:user-follow" /></Link>
                            </article>
                        )
                    })}
                </div>
            </section>

            <section className='lista_amigos home-cubos rounded-5 px-5 py-2 d-flex flex-column w-md-50 gap-1'>
                <h2>Lista de amigos</h2>
                {
                    props.amigosUser.map((amigo) => (
                        <Link to={"/detalle/amigo/" + amigo.user_id} key={amigo.user_id + Date.now()} className='d-flex align-items-center justify-content-evenly'>
                            <div className='d-flex w-75 align-items-center'>
                                <div className='foto-perfil pe-3'>
                                    <img className='rounded-5' src={amigo.foto == "" ? ejemplo : amigo.foto} alt={"Foto de: " + amigo.user_name} />
                                </div>
                                <p className='fs-1'>{amigo.user_name}</p>
                            </div>
                            <button className='btn btn-primary' onClick={(event) => {
                                setBorrado(props.id)
                                setConfirmar(!confirmar)
                            }}><Icon icon="ri:delete-bin-6-line" /></button>
                        </Link>
                    ))
                }
            </section>

            <div className={`modal fade justify-content-center align-items-center ${confirmar ? 'show' : ''}`} style={{ display: confirmar ? 'flex' : 'none' }}>
                <div className="modal-content w-md-50">
                    <div className="modal-body">
                        <div className='d-flex flex-column py-5'>
                            <h2 className='fs-1 fw-bold text-primary text-center'>¿Quieres borrar este amigo?</h2>
                            <div className='d-flex justify-content-between mt-5 pt-5'>
                                <button onClick={() => {
                                    removeFriend(borrado);
                                }} className='btn btn-danger-long'>Borrar</button>
                                <button className='btn btn-tertiary-dark' onClick={() => { setConfirmar(!confirmar) }}>Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
