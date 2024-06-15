import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { addDoc, collection, getDoc, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config';
import { Icon } from '@iconify/react/dist/iconify.js';
import FormReto from '../FormReto/FormReto';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'

import Amigo from './Amigo/Amigo';
import Config from './Config/Config';
import Notas from './Notas/Notas';
import Loading from '../Loading/Loading';

export default function Detalle() {
    let navega = useNavigate();
    let location = useLocation();
    let initialMensaje = location.state?.mensaje;
    let error = location.state?.error;


    let { check, id } = useParams();

    let [reto, setReto] = useState([]);
    let [usuario, setUsuario] = useState("");
    let [books, setBooks] = useState([]);
    let [amigos, setAmigos] = useState([]);
    let [amigosUser, setAmigosUser] = useState([]);
    let [solicitadosUser, setSolicitadosUser] = useState([]);
    let [peticionesUser, setPeticionesUser] = useState([]);

    let [grupo, setGrupo] = useState([]);
    let [info, setInfo] = useState([]);
    let [libro, setLibro] = useState([]);
    let [isExpanded, setIsExpanded] = useState(false);
    let [lastConx, setLastConx] = useState("");
    let [retoGrupo, setRetoGrupo] = useState("");


    let [nombre, setNombre] = useState("");

    let [mostrarForm, setMostrarForm] = useState(false);

    let [resenas, setResenas] = useState([])
    let [totalResena, setTotal] = useState([]);
    let [comentario, setComentario] = useState("");
    let [n_starts, setN_starts] = useState(0);
    let [description, setDescription] = useState("")
    let [truncatedDescription, setTruncatedDescription] = useState("")
    let [retoAmigo, setRetoAmigo] = useState([]);
    let [retoAmigoActual, setRetoAmigoActual] = useState([]);

    let [librosRetoGrupo, setLibrosRetoGrupo] = useState([]);
    let [usuariosGrupo, setUsuariosGrupo] = useState([]);
    let [configGrupo, setConfigGrupo] = useState(false);
    let [verNotas, setVerNotas] = useState(false);

    let [mensaje, setMensaje] = useState(initialMensaje || "");
    let [err, setErr] = useState(error || "");
    let [showMessage, setShowMessage] = useState(true);

    let [estadoReto, setEstadoReto] = useState("");
    let [confirmar, setConfirmar] = useState(false);
    let [confirmarSalir, setConfirmarSalir] = useState(false);

    useEffect(() => {
        if (mensaje != "") {
            const timer = setTimeout(() => {
                setMensaje("");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [mensaje]);
    useEffect(() => {
        if (err != "") {
            const timer = setTimeout(() => {
                setErr("");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [err]);
    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            setUsuario(user)
            if (user) {
                if (check == "reto") {
                    fetch("https://api-booku.vercel.app/reto/show/" + id, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${user.accessToken}`,
                        },
                    }).then(response => {
                        return response.json();
                    }).then(data => {
                        setReto(data.data)
                    })

                } else if (check == "libro") {
                    fetch("https://www.googleapis.com/books/v1/volumes/" + id)
                        .then(response => {
                            return response.json();
                        })
                        .then((data) => {
                            setLibro(data)
                            setDescription(data.volumeInfo.description);

                            setTruncatedDescription(truncateText(data.volumeInfo.description, 200));
                        })


                    actualizarComentarios();
                }
            }
        })

    }, [check, id]);
    useEffect(() => {
        if (usuario) {
            switch (check) {
                case "reto":
                    statusReto();
                    actualizarAmigos();
                    break;
                case "grupo":
                    actualizarGrupo();
                    genteGrupo();
                    break;
                case "amigo":
                    infoUsuario();
                    actualizaAmigos();
                    break;
            }
        }
    }, [usuario, check, id])
    useEffect(() => {
        if (reto && reto.id_libros && reto.id_libros.length > 0) {
            const fetchPromises = reto.id_libros.map((id) => {
                return fetch(`https://www.googleapis.com/books/v1/volumes/${id}`)
                    .then(response => {
                        return response.json();
                    });
            });

            Promise.all(fetchPromises)
                .then(results => {
                    const booksData = results.map(result => result);
                    setBooks(booksData);
                })
        }
    }, [reto, check, id]);
    useEffect(() => {
        if (info && info.user_id) {
            ultimaCon();
        }
    }, [info]);

    function statusReto() {
        const configCollection = collection(db, "config");
        const configQuery = query(configCollection, where("user_id", "==", usuario.uid));

        getDocs(configQuery)
            .then((querySnapshot) => {
                let encontrado = false;
                querySnapshot.forEach((docSnapshot) => {
                    if (encontrado) return;

                    const data = docSnapshot.data();

                    if (data.actual !== undefined) {
                        data.actual.forEach((element) => {
                            if (element.id_reto == id) {
                                setEstadoReto(
                                    <div className='d-flex flex-column gap-3'>
                                        <button onClick={completar} className='btn btn-primary'>Completar reto</button>
                                        <button onClick={() => {setConfirmar(true)}} className='btn btn-outline-secondary fs-4'>Abandonar reto</button>
                                    </div>
                                );
                                encontrado = true;
                            }
                        });
                    } else {
                        data.actual = [];
                        updateDoc(doc(db, 'config', docSnapshot.id), data)
                            .then(() => {
                                setMensaje("Documento actualizado correctamente");
                            })
                            .catch((error) => {
                                console.error("Error al actualizar documento:", error);
                            });
                    }
                    if (!encontrado) {
                        data.historial.forEach((element) => {
                            if (element.id_reto === id) {
                                setEstadoReto(<button className='btn btn-primary' onClick={unirse}>Repetir reto</button>);
                                encontrado = true;
                            }
                        });
                    }

                });

                if (!encontrado) {

                    setEstadoReto(<button className='btn btn-primary' onClick={unirse}>Unirse a reto</button>);
                }
            })
            .catch((error) => {
                console.error("Error obteniendo documentos:", error);
            });
    }
    function abandonar(){
        const configCollection = collection(db, "config");
        const configQuery = query(configCollection, where("user_id", "==", usuario.uid));

        getDocs(configQuery)
            .then((querySnapshot) => {
                querySnapshot.forEach((docSnapshot) => {


                    const data = docSnapshot.data();



                    data.actual = data.actual.filter((e) => {
                        return e.id_reto != id
                    })

                    updateDoc(doc(db, 'config', docSnapshot.id), data)
                        .then(() => {
                            setMensaje("Has salido del reto... No te rindas el siguiente irá mejor!");
                            statusReto();
                            setConfirmar(false)
                        })
                        .catch((error) => {
                            console.error("Error al actualizar documento:", error);
                        });
                })

            });
    }
    function sumarDias(fecha, dias) {
        let nuevaFecha = new Date(fecha);
        nuevaFecha.setDate(nuevaFecha.getDate() + dias);
        return nuevaFecha;
    }
    function sumarSemanas(fecha, semanas) {
        return sumarDias(fecha, semanas * 7);
    }
    function sumarMeses(fecha, meses) {
        let nuevaFecha = new Date(fecha);
        nuevaFecha.setMonth(nuevaFecha.getMonth() + meses);
        return nuevaFecha;
    }
    function unirse() {
        const configCollection = collection(db, "config");
        const configQuery = query(configCollection, where("user_id", "==", usuario.uid));
        getDocs(configQuery)
            .then((querySnapshot) => {
                querySnapshot.forEach((docSnapshot) => {


                    const datos = docSnapshot.data();
                    let end = new Date();

                    let tipoReto
                    fetch("https://api-booku.vercel.app/reto/show/" + id, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${usuario.accessToken}`,
                        },
                    }).then(response => {
                        return response.json();
                    }).then(data => {
                        

                        tipoReto = data.data
                        if (tipoReto && tipoReto.duracion && tipoReto.duracion.tipo) {
                            switch (tipoReto.duracion.tipo) {
                                case "1":
                                    end = sumarDias(end, parseInt(tipoReto.duracion.duracion));
                                    break;
                                case "2":
                                    end = sumarSemanas(end, parseInt(tipoReto.duracion.duracion));
                                    break;
                                case "3":
                                    end = sumarMeses(end, parseInt(tipoReto.duracion.duracion));
                                    break;
                                default:
                                    console.error("Tipo de duración no válido");
                                    return;
                            }
                        } else {
                            console.error("reto.duracion.tipo es undefined");
                            return;
                        }
    
                        let nuevoReto = {
                            fecha_start: new Date(),
                            fecha_end: end,
                            id_reto: id
                        }
    
                        datos.actual.push(nuevoReto);
                        updateDoc(doc(db, 'config', docSnapshot.id), datos)
                            .then(() => {
                                setMensaje("Te has unido correctamente");
                                statusReto();
                            })
                            .catch((error) => {
                                console.error("Error al actualizar documento:", error);
                            });
                    })
                    
                    
                })

            });

    }
    function completar(){
        const configCollection = collection(db, "config");
        const configQuery = query(configCollection, where("user_id", "==", usuario.uid));

        getDocs(configQuery)
            .then((querySnapshot) => {
                querySnapshot.forEach((docSnapshot) => {


                    const data = docSnapshot.data();
                    
                    let retoLeido = {
                        fecha: new Date(),
                        id_reto: id
                    }
                    let start = data.actual.filter(element => {
                        return element.id_reto == id
                    });


                    let fechaActual = new Date();

                    let fechaStartMilisegundos = start[0].fecha_start.seconds * 1000;

                    let difMilisegundos = fechaActual - fechaStartMilisegundos;

                    let diasPasados = Math.floor(difMilisegundos / (1000 * 60 * 60 * 24));

                    let ganado = diasPasados * 50;


                    data.actual = data.actual.filter((e) => {
                        return e.id_reto != id
                    })

                    data.historial.push(retoLeido);

                    data.monedas += ganado
                    updateDoc(doc(db, 'config', docSnapshot.id), data)
                        .then(() => {
                            setMensaje("Enhorabuena reto completado! Has ganado: "+ganado+"monedas.");
                            statusReto();
                        })
                        .catch((error) => {
                            console.error("Error al actualizar documento:", error);
                        });
                })

            });
    }
    function toggleDescription() {
        setIsExpanded(!isExpanded);
    };
    function truncateText(text, length) {
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    };
    function actualizarComentarios() {
        let resenaCollection = collection(db, "resena");
        let resenaQuery = query(resenaCollection, where("id_libro", "==", id));
        getDocs(resenaQuery)
            .then((querySnapshot) => {
                let resenaArr = []
                let total = 0;
                let pasos = 0;
                querySnapshot.forEach((doc) => {

                    let resenaData = doc.data()
                    resenaData.id = doc.id
                    pasos++;
                    total += parseInt(resenaData.n_starts);

                    let configCollection = collection(db, "config");
                    let configQuery = query(configCollection, where("user_id", "==", resenaData.uid));
                    getDocs(configQuery)
                        .then((query) => {
                            query.forEach((document) => {
                                resenaData.nombre = document.data().user_name
                                resenaArr.push(resenaData)
                                setComentario("");
                                setN_starts(0)
                            })
                            setResenas(resenaArr)

                        })
                })
                total = parseFloat(total) / pasos;

                setTotal(total.toFixed(2));
            })
    }
    function infoUsuario() {
        let configCollection = collection(db, "config");
        let configQuery = query(configCollection, where("user_id", "==", id));
        
        getDocs(configQuery)
            .then((querySnapshot) => {
                
                querySnapshot.forEach((doc) => {
                    setInfo(doc.data())
                    let retos = []
                    let retosActuales = []
                    
                    doc.data().historial.map((reto) => {
                        fetch("https://api-booku.vercel.app/reto/show/" + reto.id_reto, {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${usuario.accessToken}`,
                            },
                        }).then(response => {
                            return response.json();
                        }).then(data => {
                            data.data.fecha = reto.fecha
                            retos.push(data.data)
                            if(retos.length == doc.data().historial.length){
                                setRetoAmigo(retos)
                            }
                        })
                    })
                    doc.data().actual.map((reto) => {
                        fetch("https://api-booku.vercel.app/reto/show/" + reto.id_reto, {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${usuario.accessToken}`,
                            },
                        }).then(response => {
                            
                            return response.json();
                        }).then(data => {
                            data.data.fecha = reto.fecha_start
                            
                            retosActuales.push(data.data)
                            if(retosActuales.length == doc.data().actual.length){
                                setRetoAmigoActual(retosActuales)
                            }
                        })
                    })
                })
            })
    }
    function ultimaCon() {
        let juegoCollection = collection(db, "juego");
        let docRef = doc(juegoCollection, info.user_id);

        getDoc(docRef)
            .then((docSnapshot) => {
                setLastConx(docSnapshot.data().last_fed)
            })
    }
    function actualizaAmigos() {
        let amigosCollection = collection(db, "amigos");
        let docRef = doc(amigosCollection, usuario.uid);
        getDoc(docRef)
            .then((docSnapshot) => {
                if (docSnapshot.exists()) {
                    let data = docSnapshot.data();
                    // AMIGOS
                    setAmigosUser([]);
                    let updatedAmigos = [];
                    data.amigos.map((e) => {
                        let configCollection = collection(db, "config");
                        let friendQuery = query(configCollection, where("user_id", "==", e));

                        getDocs(friendQuery)
                            .then((querySnapshot) => {
                                
                                querySnapshot.forEach((doc) => {
                                    updatedAmigos.push(doc.data());
                                    if(data.amigos.length == updatedAmigos.length){
                                        setAmigosUser(updatedAmigos);
                                    }
                                    
                                })

                            })
                    })
                    setSolicitadosUser([]);
                    data.solicitudes.map((e) => {
                        let configCollection = collection(db, "config");
                        let friendQuery = query(configCollection, where("user_id", "==", e));

                        getDocs(friendQuery)
                            .then((querySnapshot) => {
                                let solicitudesAmigos = [];
                                querySnapshot.forEach((doc) => {
                                    solicitudesAmigos.push(doc.data());
                                    setSolicitadosUser(solicitudesAmigos);
                                })
                            })
                    })
                    setPeticionesUser([]);
                    data.pendientes.map((e) => {
                        let configCollection = collection(db, "config");
                        let friendQuery = query(configCollection, where("user_id", "==", e));

                        getDocs(friendQuery)
                            .then((querySnapshot) => {
                                let peticionesAmigos = [];
                                querySnapshot.forEach((doc) => {
                                    peticionesAmigos.push(doc.data());
                                    setPeticionesUser(peticionesAmigos);
                                })
                            })
                    })
                }
            })
    }
    function actualizarGrupo() {
        let gruposCollection = collection(db, "grupos");
        let docRef = doc(gruposCollection, id);
        getDoc(docRef)
            .then((docSnapshot) => {
                let data = docSnapshot.data();
                data.id = docSnapshot.id;
                setGrupo(data);
                if (data.reto_id == undefined) {
                    toggleForm()
                } else {
                    fetch("https://api-booku.vercel.app/reto/show/" + data.reto_id.id, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${usuario.accessToken}`,
                        },
                    }).then(response => {
                        return response.json();
                    }).then(data => {
                        setRetoGrupo(data.data)
                        let librosReto = []
                        data.data.id_libros.map((libro) => {
                            fetch("https://www.googleapis.com/books/v1/volumes/" + libro)
                                .then(response => {
                                    return response.json();
                                }).then(data => {
                                    librosReto.push(data);
                                    setLibrosRetoGrupo(librosReto)
                                })
                        })

                    })
                }
            })
    };
    function genteGrupo() {
        let configCollection = collection(db, "config");
        let queryCollection = query(configCollection, where("id_grupos", "array-contains", id));

        getDocs(queryCollection).then((querySnapshot) => {
            let usuarios = [];
            querySnapshot.forEach((doc) => {
                usuarios.push(doc.data());
                setUsuariosGrupo(usuarios);
            });
        })
    }
    function actualizarAmigos() {
        let amigosCollection = collection(db, "amigos");
        let docRef = doc(amigosCollection, usuario.uid);
        getDoc(docRef)
            .then((docSnapshot) => {
                if (docSnapshot.exists()) {
                    let data = docSnapshot.data();

                    data.amigos.map((e) => {
                        let configCollection = collection(db, "config");
                        let friendQuery = query(configCollection, where("user_id", "==", e));

                        getDocs(friendQuery)
                            .then((querySnapshot) => {
                                let updatedAmigos = []
                                getDocs(friendQuery)
                                    .then((querySnapshot) => {
                                        let updatedAmigos = [];
                                        querySnapshot.forEach((doc) => {
                                            let datos = doc.data();
                                            
                                            
                                            if (Array.isArray(datos.actual)) {
                                                datos.actual.map((reto) => {
                                                    if (reto.id_reto == id) {
                                                        updatedAmigos.push(datos);
                                                    }
                                                });
                                            }
                                        });
                                        setAmigos((prevAmigos) => [...prevAmigos, ...updatedAmigos]);
                                    })
                                setAmigos(updatedAmigos);
                            })
                    })
                }
            })
    }
    function toggleForm() {
        setMostrarForm(!mostrarForm);
        if (libro.volumeInfo != undefined) {
            setNombre("Leer " + libro.volumeInfo.title)
        }
        if(mostrarForm){
            setMensaje("Reto creado correctamente");
            actualizarGrupo();
        }
    }
    function comentar() {
        addDoc(collection(db, "resena"), {
            comentario: comentario,
            fecha: new Date(),
            id_libro: id,
            n_starts: n_starts,
            uid: usuario.uid
        }).then(() => {
            actualizarComentarios();
        })
    }
    function abandonarGrupo(){
        const configCollection = collection(db, "config");
        const configQuery = query(configCollection, where("user_id", "==", usuario.uid));

        getDocs(configQuery)
            .then((querySnapshot) => {
                querySnapshot.forEach((docSnapshot) => {
                    const userData = docSnapshot.data();
                    const updatedGroups = userData.id_grupos.filter((grupoId) => grupoId !== id);

                    updateDoc(docSnapshot.ref, { id_grupos: updatedGroups })
                        .then(() => {
                            navega(`/home`, { state: { mensaje: "Has abandonado el grupo" } })
                        })
                        .catch((error) => {
                            console.error("Error actualizando el documento:", error);
                            setMensaje("Error al abandonar el grupo");
                            setShowMessage(true);
                        });
                });
            })
            .catch((error) => {
                console.error("Error obteniendo documentos:", error);
            });
    }

    let tipos = {
        "1": "Días",
        "2": "Semanas",
        "3": "Meses"
    }

    let renderReto = (
        <section className='detalle detalle__reto'>
            <section className='detalle__reto__libros'>
                {books && books.map((libro) => (
                    <Link to={"/detalle/libro/"+libro.id} key={libro.id} className='detalle__reto__libros__content text-decoration-none'>
                        <div className='detalle__reto__libros__content--img'>
                            <img className='w-100' src={libro.volumeInfo.imageLinks.thumbnail} alt={'Libro de ' + libro.volumeInfo.title} />
                        </div>
                        <h2>{libro.volumeInfo.title}</h2>
                    </Link>

                )
                )}


            </section>
            <div className='detalle__reto__info pb-md-5'>
                <section className='detalle__reto__info__tecnicos'>
                    <p className='detalle__reto__info__tecnicos__datos'><b>Nombre: </b>{reto.nombre}</p>
                    {reto.duracion && (<p className='detalle__reto__info__tecnicos__datos'><b>Duración: </b>{reto.duracion.duracion} {tipos[reto.duracion.tipo]}</p>)}
                    {estadoReto}
                </section>
                <section className='detalle__reto__info__amigos'>
                    <h2>Amigos unidos al reto</h2>
                    <section className='detalle__reto__info__amigos__listado'>
                        {amigos && (
                            amigos.map((amigo) => (
                                <Link key={amigo.user_id} to={"/detalle/amigo/" + amigo.user_id} className='detalle__reto__info__amigos__listado__amigo text-decoration-none'>
                                    <div className='detalle__reto__info__amigos__listado__amigo__foto'>
                                        <img className='w-100' src={amigo.foto} alt={"Foto de " + amigo.user_name} />
                                    </div>
                                    <h3 className='detalle__reto__info__amigos__listado__amigo__nombre'>{amigo.user_name}</h3>
                                </Link>
                            ))
                        )}
                    </section>
                </section>
            </div>
            <div className={`modal fade justify-content-center align-items-center ${confirmar ? 'show' : ''}`} style={{ display: confirmar ? 'flex' : 'none' }}>
                <div className="modal-content w-md-50">
                    <div className="modal-body">
                        <div className='d-flex flex-column py-5'>
                            <h2 className='display-1 fw-bold text-primary'>¿Estas seguro de abandonar el reto?</h2>
                            <div className='d-flex justify-content-between mt-5 pt-5'>
                            <button onClick={() => {
                              abandonar()
                            }} className='btn btn-danger-long'>Abandonar</button>
                            <button className='btn btn-tertiary-dark' onClick={() => { setConfirmar(!confirmar) }}>Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
    let renderGrupo = (
        <section className='detalle detalle_grupo'>

            {(usuario.uid == grupo.uid && grupo.reto_id == undefined) && (
                <div className={`modal fade justify-content-center align-items-center ${mostrarForm ? 'show' : ''}`} style={{ display: mostrarForm ? 'flex' : 'none' }}>
                    <div className="configuracion modal-content w-md-50">
                        <div className="modal-body">
                            <div>
                                <h2 className='display-6'>Crea reto para tu grupo</h2>
                            </div>
                            <FormReto onCreado={toggleForm} usuario={usuario} nombre={"Reto de grupo " + grupo.nombre} libroReto={[]} grupo={grupo}></FormReto>
                        </div>
                    </div>
                </div>
            )}
            <section className='detalle_grupo__izquierda'>
                <h2 className='detalle_grupo__izquierda--title'>{retoGrupo.nombre}</h2>
                {grupo.reto_id && (<p className='detalle_grupo__izquierda--info mt-2'>Fecha para completar el reto {new Date(grupo.reto_id.fecha_max.seconds * 1000).toLocaleDateString()}</p>)}
                <p className='detalle_grupo__izquierda--info mt-3'>Libros: </p>
                <div className='d-flex flex-wrap gap-3'>
                    {librosRetoGrupo && librosRetoGrupo.map((libro) => (
                        <Link to={'/detalle/libro/'+libro.id} key={libro.id} className='detalle_grupo__izquierda__libros__content text-decoration-none'>
                            <div className='detalle_grupo__izquierda__libros__content--img'>
                                <img className='w-100' src={libro.volumeInfo.imageLinks.thumbnail} alt={'Libro de ' + libro.volumeInfo.title} />
                            </div>
                            <h2>{libro.volumeInfo.title}</h2>
                        </Link>
                    ))}
                </div>
            </section>
            <section className='detalle_grupo__derecha'>
                {usuario.uid == grupo.uid && (
                    <div className='d-flex flex-column gap-3'>
                        <button onClick={() => { setConfigGrupo(!configGrupo) }} className='btn btn-primary'>Configuración del grupo</button>
                        {grupo.examen_id && (<button onClick={() => { setVerNotas(!configGrupo) }} className='btn btn-primary'>Notas de examen</button>)}
                        {grupo.examen_id == undefined && (<Link to={"/examen/" + grupo.id + "/crear"} className='btn btn-primary'>Crear Examen</Link>)}
                        {grupo.examen_id && (<Link to={"/examen/" + grupo.id + "/editar"} className='btn btn-primary'>Editar Examen</Link>)}

                    </div>
                )}
                <div className='d-flex flex-column gap-3 mt-3 mb-5'>
                    {grupo && (<button className='btn btn-primary' onClick={()=>{setConfirmarSalir(!confirmarSalir)}}>Salir de grupo</button>)}
                    {grupo.examen_id && !grupo.notas?.[usuario.uid] && (<Link to={"/examen/" + grupo.id} className='btn btn-primary'>Hacer Examen</Link>)}
                    {grupo.notas && grupo.notas[usuario.uid] && (<h2 className='text-center text-primary'> Nota {grupo.notas[usuario.uid]}</h2>)}
                </div>

                <h2 className='detalle_grupo__derecha--title text-center'>Usuarios en este grupo</h2>
                <div className='d-flex flex-column gap-3 px-5 mt-3'>
                    {usuariosGrupo && usuariosGrupo.map((user) => (
                        <Link to={"/detalle/amigo/" + user.user_id} key={user.user_id} className='d-flex text-decoration-none align-items-center w-100 gap-3'>
                            <div className='w-15'>
                                <img className='w-100' src={user.foto} alt={"Foto de " + user.user_name} />
                            </div>
                            <p className='fs-1'>{user.user_name}</p>
                        </Link>
                    ))}
                </div>

            </section>

            {configGrupo==1 && (
                <div className={`modal fade justify-content-center align-items-center ${configGrupo != 0 ? 'show' : ''}`} style={{ display: configGrupo != 0 ? 'flex' : 'none' }} onClick={() => { setConfigGrupo(!configGrupo) }}>
                    <div className="grupos modal-content w-md-50">
                        <div className="modal-body" onClick={(event) => event.stopPropagation()}>
                            <div>
                                <button onClick={() => { setConfigGrupo(!configGrupo) }} type="button" className="btn position-absolute top-0 end-0">
                                    <Icon className='display-1' icon="material-symbols:close-rounded" />
                                </button>
                            </div>
                            <div className='d-flex flex-wrap justify-content-center py-5'>
                                <Config onRemove={() => {
                                    setMensaje("El grupo ha sido editado correctamente");
                                    setShowMessage(true)
                                    setConfigGrupo(!configGrupo);
                                    actualizarGrupo();
                                }} onMensaje={() => {
                                    setMensaje("El grupo ha sido editado correctamente");
                                    setShowMessage(true)
                                    setConfigGrupo(!configGrupo);
                                    actualizarGrupo();
                                }} onError={() => {
                                    setError("El grupo no ha sido editado")
                                }} usuario={usuario} idGrupo={id}></Config>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            

            {grupo.examen_id && (
                <div className={`modal fade justify-content-center align-items-center ${verNotas != 0 ? 'show' : ''}`} style={{ display: verNotas != 0 ? 'flex' : 'none' }} onClick={() => { setVerNotas(!verNotas) }}>
                    <div className="grupos modal-content w-md-50">
                        <div className="modal-body" onClick={(event) => event.stopPropagation()}>
                            <div>
                                <button onClick={() => { setVerNotas(!verNotas) }} type="button" className="btn position-absolute top-0 end-0">
                                    <Icon className='display-1' icon="material-symbols:close-rounded" />
                                </button>
                            </div>
                            <div className='d-flex flex-wrap justify-content-center py-5'>
                                <Notas onActualizarGrupo={actualizarGrupo} usuario={usuario} idGrupo={id}></Notas>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={`modal fade justify-content-center align-items-center ${confirmarSalir ? 'show' : ''}`} style={{ display: confirmarSalir ? 'flex' : 'none' }}>
                <div className="modal-content w-md-50">
                    <div className="modal-body">
                        <div className='d-flex flex-column py-5'>
                            <h2 className='display-1 fw-bold text-primary'>¿Estas seguro de abandonar el grupo?</h2>
                            <div className='d-flex justify-content-between mt-5 pt-5'>
                            <button onClick={() => {
                              abandonarGrupo()
                            }} className='btn btn-danger-long'>Abandonar</button>
                            <button className='btn btn-tertiary-dark' onClick={() => { setConfirmarSalir(!confirmarSalir) }}>Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            

        </section>
    );
    let renderAmigo = (
        <Amigo onActualizarAmigos={actualizaAmigos} info={info} lastConx={lastConx} retoAmigoActual={retoAmigoActual} retoAmigo={retoAmigo} amigosUser={amigosUser} usuario={usuario} id={id} solicitadosUser={solicitadosUser} pendientesUser={peticionesUser}></Amigo>
    )
    let renderLibro = (
        <section className='detalle detalle__libro'>
            {libro.volumeInfo && (
                <>
                    <section className='detalle__libro__book'>
                        <div className='detalle__libro__book__caratula'>
                            <img className='w-100 h-100' src={libro.volumeInfo.imageLinks.thumbnail} alt={"Portada de " + libro.volumeInfo.title} />
                        </div>
                        <h2 className='detalle__libro__book__title'>{libro.volumeInfo.title}</h2>
                    </section>

                    <section className='d-flex detalle__libro__info'>
                        <div className='d-flex flex-column gap-5'>
                            <div>
                                <p className='detalle__libro__info__data'><b>Autor: </b>{libro.volumeInfo.authors[0]}</p>
                                <p className='detalle__libro__info__data'><b>ISBN: </b>{libro.volumeInfo.industryIdentifiers[1].identifier}</p>
                                <div>
                                    <p className='detalle__libro__info__data'><b>Descripción:</b></p>
                                    <div className='detalle__libro__info__desc' dangerouslySetInnerHTML={{ __html: (isExpanded ? description : truncatedDescription) }}></div>
                                </div>
                                <button onClick={toggleDescription} className='btn fs-3 text-selected fw-bold'>
                                    {isExpanded ? <>Ver menos <Icon icon="mingcute:up-fill" /> </> : <>Ver más <Icon icon="mingcute:down-fill" /></>}
                                </button>
                            </div>
                            <button onClick={toggleForm} className='btn btn-primary'>Leer!</button>
                        </div>
                        <div className='detalle__libro__info__resenas'>
                            <h2>Reseñas: {!isNaN(totalResena) ? totalResena + '/5' : ""}</h2>
                            <section className='d-flex flex-column align-items-center w-100 gap-2'>
                                <div className="star-rating">
                                    <input type="radio" checked={n_starts==5} id="star5" name="rating" value="5" onChange={(e) => {
                                        setN_starts(e.target.value)
                                    }} />
                                    <label htmlFor="star5" title="5 stars"></label>
                                    <input type="radio" checked={n_starts==4}  id="star4" name="rating" value="4" onChange={(e) => {
                                        setN_starts(e.target.value)
                                    }} />
                                    <label htmlFor="star4" title="4 stars"></label>
                                    <input type="radio" checked={n_starts==3} id="star3" name="rating" value="3" onChange={(e) => {
                                        setN_starts(e.target.value)
                                    }} />
                                    <label htmlFor="star3" title="3 stars"></label>
                                    <input type="radio" checked={n_starts==2} id="star2" name="rating" value="2" onChange={(e) => {
                                        setN_starts(e.target.value)
                                    }} />
                                    <label htmlFor="star2" title="2 stars"></label>
                                    <input type="radio" checked={n_starts==1} id="star1" name="rating" value="1" onChange={(e) => {
                                        setN_starts(e.target.value)
                                    }} />
                                    <label htmlFor="star1" title="1 star"></label>
                                </div>
                                <textarea className='w-100' name="comentario" id="comentario" value={comentario} onChange={(e) => {
                                    setComentario(e.target.value)
                                }}></textarea>
                                <button onClick={comentar} className='btn btn-tertiary-dark'>Comentar</button>
                            </section>
                            <section className='resenas w-100'>
                                {resenas && resenas.map((resena) => (
                                    <article className='resenas__resena' key={resena.id}>
                                        <div className="Stars" style={{ '--rating': resena.n_starts }} aria-label="Rating of this product is 2.3 out of 5."></div>
                                        <p className='resenas__resena__text'>{resena.comentario}</p>
                                        <div className='w-100 d-flex justify-content-between'>
                                            <p className='resenas__resena__info'>{resena.nombre}</p>
                                            <p className='resenas__resena__info'>{new Date(resena.fecha.seconds * 1000).getDate() + '/' + (new Date(resena.fecha.seconds * 1000).getMonth() + 1) + '/' + new Date(resena.fecha.seconds * 1000).getFullYear()}</p>
                                        </div>
                                    </article>
                                ))}

                            </section>

                        </div>
                    </section>
                </>

            )}
            {(libro && nombre) && (
                <div className={`modal fade justify-content-center align-items-baseline ${mostrarForm ? 'show' : ''}`} style={{ display: mostrarForm ? 'flex' : 'none' }} onClick={(event) => { event.stopPropagation(); setMostrarForm(!mostrarForm) }}>
                    <div className="configuracion modal-content w-md-50">
                        <div className="modal-body" onClick={(event) => event.stopPropagation()}>
                            <div>
                                <h2 className='display-6'>Crea tu reto</h2>
                                <button onClick={() => {setMostrarForm(!mostrarForm)}} type="button" className="btn btn-close-white position-absolute top-0 end-0">
                                    <Icon className='display-1' icon="material-symbols:close-rounded" />
                                </button>
                            </div>
                            <FormReto usuario={usuario} nombre={nombre} libroReto={[libro]} onCreado={(id_reto) => {
                                navega(`/detalle/reto/${id_reto}`, { state: { mensaje: "Reto creado correctamente" } })
                            }}></FormReto>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )

    if (check === "reto" && reto) {
        return (
            <>
                <Link to="/home" className="mt-5 ms-5 btn btn-secondary">Volver</Link>
                <section className='d-flex flex-column align-items-center'>
                    {showMessage && mensaje && ( // Mostrar el mensaje solo si showMessage es true
                        <div className="alert alert-success w-50 fade show" role='alert'>
                            {mensaje}
                        </div>
                    )}
                    {renderReto}
                </section>
            </>
        );
    } else if (check === "grupo" && grupo) {
        return (
            <>
                <Link to="/home" className="mt-5 ms-5 btn btn-secondary">Volver</Link>
                <section className='d-flex flex-column align-items-center'>
                    {showMessage && mensaje && (
                        <div className="alert alert-success w-50 fade show" role='alert'>
                            {mensaje}
                        </div>
                    )}
                    {err!="" && (
                        <div className="alert alert-danger w-50 fade show" role='alert'>
                            {err}
                        </div>
                    )}
                    {renderGrupo}
                </section>
            </>
        );
    } else if (check === "amigo" && info && amigosUser && solicitadosUser && peticionesUser) {
        return (
            <>
                <Link to="/home" className="mt-5 ms-5 btn btn-secondary">Volver</Link>
                <section className='d-flex flex-column align-items-center'>
                    {showMessage && mensaje && ( 
                        <div className="alert alert-success w-50 fade show" role='alert'>
                            {mensaje}
                        </div>
                    )}
                    {renderAmigo}
                </section>
            </>
        );
    } else if (check === "libro" && libro) {
        return (
            <>
                <Link to="/home" className="mt-5 ms-5 btn btn-secondary">Volver</Link>
                <section className='d-flex flex-column align-items-center'>
                    {showMessage && mensaje && ( // Mostrar el mensaje solo si showMessage es true
                        <div className="alert alert-success w-50 fade show" role='alert'>
                            {mensaje}
                        </div>
                    )}
                    {renderLibro}
                </section>
            </>
        );
    } else {
        return <Loading></Loading>;
    }
}
