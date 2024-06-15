import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react/dist/iconify.js';

import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from '../../config';
import booku from '../../assets/booku.png'
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'

export default function Home() {

    let location = useLocation();
    let navigate = useNavigate();
    let [books, setBooks] = useState([]);
    let [currentIndex, setCurrentIndex] = useState(0);
    let [user, setUsuario] = useState("");
    let [amigos, setAmigos] = useState([]);
    let [show, setShow] = useState(false);
    let [resultados, setResultados] = useState([])
    let [busqueda, setBusqueda] = useState([])
    let [estadoAmigo, setEstadoAmigo] = useState("");
    let [reto, setReto] = useState([]);
    let [infoBooku, setBooku] = useState({});
    let [preHistorial, setPreHistorial] = useState([]);
    let [historial, setHistorial] = useState([]);
    let [preActual, setPreActual] = useState([]);
    let [now, setNow] = useState([]);
    let [confirmar, setConfirmar] = useState(false);
    let [borrado, setBorrado] = useState(0)
    let initialMensaje = location.state?.mensaje;
    let [mensaje, setMensaje] = useState(initialMensaje || "");
    let [verHistorial, setVerHistorial] = useState(false)

    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            setUsuario(user)
            if (user) {
                let configCollection = collection(db, "config");
                let configQuery = query(configCollection, where("user_id", "==", user.uid));
                let amigosCollection = collection(db, "amigos");
                let docRef = doc(amigosCollection, user.uid);

                getDocs(configQuery)
                    .then((docSnapshot) => {
                        docSnapshot.forEach((doc) => {
                            let data = doc.data();

                            // Filtrar data.actual y almacenar los resultados filtrados
                            let filteredActual = data.actual.filter((e) => {
                                let currentTimeMillis = new Date().getTime();
                                let fechaEndMillis = e.fecha_end.seconds * 1000 + Math.floor(e.fecha_end.nanoseconds / 1000000);
                                return fechaEndMillis > currentTimeMillis;
                            });

                            if (filteredActual.length !== data.actual.length) {
                                data.actual = filteredActual;
                                updateDoc(doc.ref, data)
                                    .then(() => {
                                        console.log("Documento actualizado correctamente.");
                                    })
                                    .catch((error) => {
                                        console.error("Error al actualizar documento:", error);
                                    });
                            }
                            setPreHistorial(data.historial);
                            setPreActual(data.actual);
                        });
                    })

                getDoc(docRef)
                    .then((docSnapshot) => {
                        if (docSnapshot.exists()) {
                            let data = docSnapshot.data();
                            // AMIGOS
                            data.amigos.map((e) => {
                                let friendQuery = query(configCollection, where("user_id", "==", e));

                                getDocs(friendQuery)
                                    .then((querySnapshot) => {
                                        let updatedAmigos = [];
                                        querySnapshot.forEach((doc) => {
                                            updatedAmigos.push(doc.data());
                                            setAmigos((prevAmigos) => [...prevAmigos, ...updatedAmigos]);
                                        })
                                    })
                            })
                        }
                    })

                fetch("https://api-booku.vercel.app/reto/", {
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


                let juegoCollection = collection(db, "juego");
                let juegoDef = doc(juegoCollection, user.uid);

                getDoc(juegoDef)
                    .then((docSnapshot) => {
                        if (docSnapshot.exists()) {
                            let data = docSnapshot.data()
                            let fecha = new Date()
                            let restar = Math.floor(Math.floor(Math.floor((fecha.getTime() / 1000) - data.last_fed.seconds) / 60 / 60) / 2)
                            if (data.estado.comida - restar >= 0) {
                                data.estado.comida -= restar
                            } else {
                                data.estado.vida -= restar
                            }
                            data.last_fed = fecha
                            updateDoc(juegoDef, data)
                            setBooku(data)
                        } else {
                            let juego = {
                                estado: {
                                    comida: 100,
                                    vida: 100,
                                },
                                nombre: "Hola",
                                last_fed: new Date(),
                            }
                            setDoc(juegoDef, juego);
                            setBooku(juego)
                        }
                    })
            }
        })
        fetch("https://www.googleapis.com/books/v1/volumes?q=Cuco")
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setBooks(data.items);
            })

    }, []);
    useEffect(() => {
        if (preHistorial.length > 0 || preActual.length > 0) {
            cargaHistorial()
        }
    }, [preHistorial, preActual])
    useEffect(() => {
        if (mensaje != "") {
            const timer = setTimeout(() => {
                setMensaje("");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [mensaje])

    function gestionar(id, add) {
        let amigosCollection = collection(db, "amigos");
        let docRef = doc(amigosCollection, user.uid);
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


                    updateDoc(docRef, { solicitudes: newSolicitudes });
                    setAmigos(newSolicitudes);

                    if (add == true) {
                        data.amigos.map((e) => {
                            newAmigos.push(e);
                        })
                        newAmigos.push(id);
                        updateDoc(docRef, { amigos: newAmigos });
                    }


                }
            })
        getDoc(amigoRef)
            .then((docSnapshot) => {
                if (docSnapshot.exists()) {
                    let data = docSnapshot.data();

                    let newAmigos = [...data.pendientes];

                    let idBorrada = user.uid;
                    newAmigos = newAmigos.filter((e) => {
                        return e !== idBorrada;
                    });

                    updateDoc(amigoRef, { pendientes: newAmigos }).then(() => {
                      buscarAmigos();
                      actualizaAmigos();
                    });

                    if (add) {
                        newAmigos = [...data.amigos];
                        newAmigos.push(user.uid);
                        updateDoc(amigoRef, { amigos: newAmigos }).then(() => {
                          buscarAmigos();
                          actualizaAmigos();
                        });
                    }
                }
            })
    }

    function buscarAmigos() {
        let configCollection = collection(db, "config");
        let queryConf = query(configCollection, where("user_name", "==", busqueda));
        getDocs(queryConf)
            .then((docSnapshot) => {
                let data = "";
                docSnapshot.forEach((doc) => {
                    // Accede a los datos de cada documento
                    data = doc.data();
                    setResultados([data])
                });
                if (docSnapshot.empty) {
                    setResultados(["No hay resultados"])
                }
                let amigosCollection = collection(db, "amigos");
                let docRef = doc(amigosCollection, user.uid);
                getDoc(docRef)
                    .then((docSnapshot) => {
                        if (docSnapshot.exists()) {
                            let check = docSnapshot.data();
                            let encontrado = false;
                            // SOLICITUDES
                            check.solicitudes.map((e) => {
                                if (e == data.user_id) {
                                    setEstadoAmigo(<div key={data.user_id}>
                                        <button onClick={() => {gestionar(data.user_id, false)}} className='btn text-danger'><Icon className='display-3' icon="material-symbols:close-small" /></button>
                                        <button onClick={() => {gestionar(data.user_id, true)}} className='btn text-success'><Icon className='display-3' icon="dashicons:yes" /></button>
                                    </div>)
                                    encontrado = true;
                                }
                            })
                            // PENDIENTE
                            check.pendientes.map((e) => {
                                if (e == data.user_id) {
                                    setEstadoAmigo("Solicitado")
                                    encontrado = true;
                                }
                            })
                            // AMIGOS
                            check.amigos.map((e) => {
                                if (e == data.user_id) {
                                    setEstadoAmigo("Agregado")
                                    encontrado = true;
                                }
                            })
                            if (!encontrado) {
                                setEstadoAmigo(<button className='btn btn-primary' onClick={() => {
                                    soliFriend(data.user_id)
                                }} key={data.user_id}>Solicitar</button>)
                            }
                        }
                    })
            })
    }
    function actualizaAmigos() {
        let amigosCollection = collection(db, "amigos");
        let docRef = doc(amigosCollection, user.uid);
        getDoc(docRef)
            .then((docSnapshot) => {
                if (docSnapshot.exists()) {
                    let data = docSnapshot.data();
                    // AMIGOS
                    setAmigos([]);
                    data.amigos.map((e) => {
                        let configCollection = collection(db, "config");
                        let friendQuery = query(configCollection, where("user_id", "==", e));

                        getDocs(friendQuery)
                            .then((querySnapshot) => {
                                let updatedAmigos = [];
                                querySnapshot.forEach((doc) => {
                                    updatedAmigos.push(doc.data());
                                })
                                setAmigos((prevAmigos) => [...prevAmigos, ...updatedAmigos]);
                            })
                    })
                }
            })
    }
    function soliFriend(id) {
        let amigosCollection = collection(db, "amigos");
        let docRef = doc(amigosCollection, user.uid);
        let amigoClear = doc(amigosCollection, id);

        getDoc(docRef)
            .then((docSnapshot) => {
                if (docSnapshot.exists()) {
                    let peticiones = [];
                    peticiones.push(...docSnapshot.data().pendientes)
                    peticiones.push(id)
                    updateDoc(docRef, { pendientes: peticiones }).then(() => {
                        buscarAmigos();
                    });
                }
            });


        getDoc(amigoClear)
            .then((docSnapshot) => {
                if (docSnapshot.exists()) {
                    let data = docSnapshot.data();
                    let amigosSolicitudes = data.solicitudes;
                    amigosSolicitudes.push(user.uid)
                    updateDoc(amigoClear, { solicitudes: amigosSolicitudes });
                }
            })
    }
    function handleClose() {
        setShow(false)
    };
    function handleShow() {
        setShow(true)
    };
    function cargaHistorial() {
        let historyPromises = preHistorial.map((objeto) =>
            fetch(`https://api-booku.vercel.app/reto/show/${objeto.id_reto}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.accessToken}`,
                },
            }).then(response => response.json())
        );

        let actualPromises = preActual.map((objeto) =>
            fetch(`https://api-booku.vercel.app/reto/show/${objeto.id_reto}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.accessToken}`,
                },
            }).then(response => response.json())
        );

        Promise.all(historyPromises).then(data => {
            setHistorial(data.map(item => item.data));
        });

        Promise.all(actualPromises).then(data => {
            setNow(data.map(item => item.data));
        });
    }
    function toogleHistorial() {
        setVerHistorial(!verHistorial)
    }

    return (
        <>
            {mensaje != "" && (
                <div className='w-100 d-flex justify-content-center'>
                    <div className="alert alert-success w-50 fade show position-absolute" role='alert'>
                        {mensaje}
                    </div>
                </div>
            )}
            <div className='d-flex flex-column flex-lg-row align-items-center justify-content-center h-100 gap-5 py-5 py-lg-0'>
                {/*JUEGO*/}
                <div className='home-cubos d-flex flex-column align-items-center justify-content-evenly h-75 rounded-5'>
                    <div className='home-cubos-booku'>
                        <img className='w-100' src={booku} alt="" />
                    </div>
                    <div id='juego_estados' className='d-flex flex-column align-items-center w-75 gap-5'>
                        {infoBooku && Object.keys(infoBooku).length !== 0 && (
                            <div className='d-flex flex-column w-100 gap-2'>
                                <div className="progress">
                                    <label className='fs-1' htmlFor="">❤️</label>
                                    <div
                                        className="progress-bar bg-success fs-2"
                                        style={{ width: `${infoBooku.estado.vida}%` }}
                                    >
                                        {infoBooku.estado.vida}%
                                    </div>
                                </div>
                                <div className="progress">
                                    <label className='fs-1' htmlFor="">🍎</label>
                                    <div
                                        className="progress-bar bg-warning fs-2"
                                        style={{ width: `${infoBooku.estado.comida}%` }}
                                    >
                                        {infoBooku.estado.comida}%
                                    </div>
                                </div>
                            </div>
                        )}
                        <Link to="/play" className='btn btn-primary'>JUGAR</Link>
                    </div>
                </div>
                {/*Parte central*/}
                <div className='home-cubos-centro d-flex flex-column h-75 gap-5'>
                    {/*ACTUALES*/}
                    <div className="home-cubos-bloque d-flex flex-column h-50 rounded-5">
                        <div className='px-5 py-4 d-flex justify-content-between'>
                            <h2 className='display-3 fw-bold text-primary'>Retos actuales</h2>
                            <button onClick={toogleHistorial} className='btn btn-secondary-small'>Historial</button>
                        </div>
                        {preActual.length === 0 ? (
                            <div className='px-5 py-4'>
                                <p className='fs-3 text-primary py-0 my-0 text-center'>No estas en ningún reto ahora mismo</p>
                            </div>
                        ) : (
                            preActual.map((e, index) => {
                                let retoNombre = now.find((i) => e.id_reto === i.id);
                                return (
                                    <div key={e.id_reto + e.fecha_start.seconds} className='d-flex justify-content-between align-items-center px-5'>
                                        <div className='d-flex flex-column'>
                                            <p className='fs-1 text-primary py-0 my-0'>{retoNombre?.nombre}</p>
                                            <p className='text-primary fw-bold py-0 my-0'>
                                                {e ? new Date(e.fecha_start.seconds * 1000).toLocaleDateString() : "No encontrado"}
                                            </p>
                                        </div>
                                        <Link to={"/detalle/reto/" + e.id_reto} className='btn btn-primary'>
                                            <Icon icon="material-symbols:info-outline" />
                                        </Link>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    {/*RECOMENDADOS*/}
                    <div className="home-cubos-bloque d-flex flex-column h-50 rounded-5  gap-3">
                        <h2 className='display-3 fw-bold text-primary ps-5'>Retos recomendados</h2>
                        {reto.filter((reto) => { return reto.uid == null }).slice(0, 4).map((e) => (
                            <article key={e.id} className='d-flex w-100 px-5 justify-content-between align-items-center'>
                                <p className='fs-1 text-primary'>{e.nombre}</p>
                                <Link to={'/detalle/reto/' + e.id} className='btn btn-primary'><Icon className='fs-1' icon="simple-line-icons:user-follow" /></Link>
                            </article>
                        ))}
                        <Link to={'/retos'} className='reto_show_more'>Ver más</Link>
                    </div>

                </div>

                {/*AMIGOS*/}
                <div className="home-cubos d-flex flex-column h-75 rounded-5 position-relative">
                    <h2 className='display-3 fw-bold text-primary ps-5'>Amigos</h2>
                    <div className='position-absolute top-5 end-0 mt-2 me-5'>
                        <button onClick={actualizaAmigos} className=' fs-3 btn'><Icon icon="oi:reload" /></button>
                        <button onClick={handleShow} className=' fs-1 btn'><Icon icon="material-symbols:search" /></button>
                    </div>
                    <section className='lista_amigos d-flex flex-column w-100 gap-1'>
                        {amigos.length === 0 ? (
                            <div className='px-5 py-4 d-flex justify-content-center align-items-center h-100'>
                                <p className='fs-1 text-primary py-0 my-0 text-center'>Parece que aún no tienes amigos</p>
                            </div>
                        ) : (
                            <>
                                {amigos.map((e, index) => (
                                    <Link to={"/detalle/amigo/" + e.user_id} key={'amigos' + index} className='d-flex align-items-center justify-content-evenly'>
                                        <div className='d-flex w-75 align-items-center'>
                                            <div className='foto-perfil pe-3'>
                                                <img className='rounded-5' src={e.foto == "" ? ejemplo : e.foto} alt={"Foto de: " + e.user_name} />
                                            </div>
                                            <p className='fs-1'>{e.user_name}</p>
                                        </div>
                                        <button className='btn btn-primary' user={e.user_id}><Icon icon="mdi:eye" /></button>
                                    </Link>
                                ))}
                            </>
                        )}
                        
                    </section>
                </div>



                {/* MODALES */}
                <div className={` modal fade ${show ? 'show' : ''}`} id="buscarAmigos" style={{ display: show ? 'block' : 'none' }}>
                    <div className=" modal-dialog">
                        <div className="formularios modal-content">
                            <div className="modal-header">
                                <h2 className="display-3" id="exampleModalLabel">Buscar amigos</h2>
                                <button type="button" className="btn btn-close-white" onClick={handleClose}><Icon className='display-1' icon="material-symbols:close-rounded" /></button>
                            </div>
                            <div className="modal-body">
                                <div className='form'>
                                    <div className='form-input-small'>
                                        <input className='input-small' type="text" id='buscar' placeholder='Buscar' onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                buscarAmigos();
                                            }
                                        }} onChange={(e) => {
                                            setBusqueda(e.target.value)
                                        }} />
                                        <button onClick={buscarAmigos}><Icon icon="material-symbols:search" /></button>
                                    </div>
                                    {resultados.map((e, index) => {
                                        if (e != "No hay resultados") {
                                            return (
                                                <div className='d-flex w-100 justify-content-between fs-1 align-items-center py-5 px-2' key={'resultados' + index}>
                                                    <div className='w-25'>
                                                        <img className='w-100' src={e.foto} alt={"Foto de perfil de " + e.user_name} />
                                                    </div>
                                                    <p>{e.user_name}</p>
                                                    {estadoAmigo}
                                                </div>
                                            )
                                        } else {
                                            return (
                                                <div className='d-flex w-100 justify-content-between fs-1 align-items-center py-5 px-2' key={'resultados' + index}>
                                                    <p>{e}</p>
                                                </div>
                                            )
                                        }
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`modal fade justify-content-center align-items-center ${verHistorial != 0 ? 'show' : ''}`} style={{ display: verHistorial != 0 ? 'flex' : 'none' }} onClick={(event) => { event.stopPropagation(); toogleHistorial() }}>
                    <div className="grupos modal-content w-md-50">
                        <div className="modal-body" onClick={(event) => event.stopPropagation()}>
                            <div>
                                <h2 className='display-6'>Historial</h2>
                                <button onClick={toogleHistorial} type="button" className="btn position-absolute top-0 end-0">
                                    <Icon className='display-1' icon="material-symbols:close-rounded" />
                                </button>
                            </div>
                            <div className='d-flex flex-wrap py-5 h-100'>
                                {/* HISTORIAL */}
                                <div className='f-flex flex-column gap-3 overflow-y-auto w-100'>
                                    {preHistorial.length === 0 ? (
                                        <div className='px-5 py-4'>
                                            <p className='fs-1 text-primary py-0 my-0'>Aún no has completado ningún reto</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className='d-flex justify-content-between align-items-center px-5 w-100'>

                                                <p className='w-33 fs-1 fw-bold text-primary py-0 my-0'>Nombre</p>
                                                <p className='w-33 fs-1 text-primary fw-bold py-0 my-0 text-center'>Fecha</p>
                                                <p className='w-33 fs-1 text-primary fw-bold py-0 my-0 text-end'>Acciones</p>
                                            </div>
                                            <div className='d-flex flex-column gap-3'>
                                                {preHistorial.map((e, index) => {
                                                    let retoNombre = historial.find((i) => i.id === e.id_reto);
                                                    return (
                                                        <div key={'historial' + index} className='d-flex justify-content-between align-items-center px-5 w-100'>

                                                            <p className='w-33 fs-2 text-primary py-0 my-0'>{retoNombre?.nombre}</p>
                                                            <p className='w-33 fs-2 text-primary py-0 my-0 text-center'>
                                                                {e ? new Date(e.fecha.seconds * 1000).toLocaleDateString() : "No encontrado"}
                                                            </p>

                                                            <div className='w-33 d-flex justify-content-end'>
                                                                <Link to={"/detalle/reto/" + e.id_reto} className=' btn btn-primary'>
                                                                    <Icon icon="material-symbols:info-outline" />
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    )}

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
