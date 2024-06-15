import React, { useEffect, useState } from 'react'
import { Icon } from '@iconify/react';
import logo from '../../assets/logo.png';

import { Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from '../../config';
import Confetti from 'react-confetti'
import CrearGrupo from './CrearGrupo/CrearGrupo';
import Configuracion from './Configuracion/Configuracion';

export default function Static() {
    let navega = useNavigate()
    let [usuario, setUsuario] = useState("");
    let [menu, setMenu] = useState([<Link className='menu__link fs-1 text-uppercase' to="/prueba">Prueba</Link>]);
    let [amigos, setAmigos] = useState([]);
    let login = "";
    let [mostrarGrupos, setMostrarGrupos] = useState(false);
    let [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
    let [mostrarConfiguracion, setMostrarConfiguracion] = useState(false);
    let [permisos, setPermisos] = useState(0);
    let [notificaciones, setNotificaciones] = useState([]);
    let [recompensas, setRecompensas] = useState([]);
    let [show, setShow] = useState();
    let [config, setConfig] = useState({})
    let [showConfetti, setShowConfetti] = useState(false);
    let [verGrupo, setVerGrupo] = useState(0);
    let [juego, setJuego] = useState();
    let [grupos, setGrupos] = useState([]);


    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            setUsuario(user);

            if (user) {
                setMenu([
                    <Link key={"principal"} className='menu__link fw-bold text-uppercase' to="/home">Principal</Link>,
                    <Link key={"retos"} className='menu__link fw-bold text-uppercase' to="/retos">Retos</Link>,
                    <Link key={"juego"} className='menu__link fw-bold text-uppercase' to="/play">Juego</Link>
                ]);

            } else {
                setMenu([
                    <Link key={"index"} className='menu__link fw-bold text-uppercase' to="/">Principal</Link>,
                    <Link key={"about"} className='menu__link fw-bold text-uppercase' to="/sobre-nosotros">Sobre nosotros</Link>,
                    <Link key={"contact"} className='menu__link fw-bold text-uppercase' to="/contacto">Contacto</Link>,
                ]);
            }
        });


    }, []);

    useEffect(() => {
        if (config) {
            cargarJuego();
            cargarGrupos();
        }
    }, [config]);
    useEffect(() => {
        if (usuario) {
            actualizarNotis();
            cargaConfig();
            const intervalId = setInterval(actualizarNotis, 15000); // CAMBIAR 15000
            return () => clearInterval(intervalId);
        }
        
    }, [usuario]);

    function actualizarNotis(){
        let amigosCollection = collection(db, "amigos");
        let configCollection = collection(db, "config");
        let docRef = doc(amigosCollection, usuario.uid);
        let configQuery = query(configCollection, where("user_id", "==", usuario.uid));
        getDoc(docRef)
            .then((docSnapshot) => {
                if (docSnapshot.exists()) {
                    let data = docSnapshot.data();

                    data.solicitudes.map((e) => {
                        let configCollection = collection(db, "config");
                        let friendQuery = query(configCollection, where("user_id", "==", e));
                        getDocs(friendQuery)
                            .then((querySnapshot) => {
                                querySnapshot.forEach((doc) => {
                                    setAmigos([...amigos, doc.data()])
                                })
                            })
                    })
                    getDocs(configQuery)
                        .then((querySnapshot) => {
                            querySnapshot.forEach((doc) => {
                                setPermisos(doc.data().permisos)
                                setConfig(doc.data())
                                
                            })
                        })
                }
            })
    }
    function actualizaGrupos(){
        let configCollection = collection(db, "config");
        let configQuery = query(configCollection, where("user_id", "==", config.user_id));
        getDocs(configQuery)
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    setConfig(doc.data());
                    cargarGrupos();
                })
            })
    }
    function cargarGrupos() {
        if (config && config.id_grupos) {
            const gruposCollection = collection(db, "grupos");
            const gruposPromises = [];
    
            config.id_grupos.forEach((grupoId) => {
                const docRef = doc(gruposCollection, grupoId);
                const promise = getDoc(docRef)
                    .then((docSnapshot) => {
                        if (docSnapshot.exists()) {
                            const grupoData = docSnapshot.data();
                            return { id: docSnapshot.id, ...grupoData };
                        } else {
                            return null;
                        }
                    });
                gruposPromises.push(promise);
            });
    
            Promise.all(gruposPromises)
                .then((grupoDataArray) => {
                    const gruposValidos = grupoDataArray.filter((grupoData) => grupoData !== null);
                    setGrupos(gruposValidos);
                })
                .catch((error) => {
                    console.error("Error cargando grupos:", error);
                });
        }
    }
    function cargarJuego() {
        if (config && config.user_id) {
            let juegoCollection = collection(db, "juego");
            let docRef = doc(juegoCollection, config.user_id);
            getDoc(docRef)
                .then((docSnapshot) => {
                    if (docSnapshot.exists()) {
                        let data = docSnapshot.data();
                        setJuego(data);
                    }
                })
        }
    }
    function cerrarSesion() {
        const auth = getAuth();
        signOut(auth)
            .then(() => {

                navega("/")
            })
    }
    function toggleGrupos() {
        setMostrarGrupos(!mostrarGrupos);
        if (mostrarConfiguracion) {
            setMostrarConfiguracion(!mostrarConfiguracion);
        }
        if (mostrarNotificaciones) {
            setMostrarNotificaciones(!mostrarNotificaciones);
        }
        if (verGrupo != 0) {
            setVerGrupo(0);
        }
    }
    function toggleNotificaciones() {
        setMostrarNotificaciones(!mostrarNotificaciones);

        if (mostrarConfiguracion) {
            setMostrarConfiguracion(!mostrarConfiguracion);
        }
        if (mostrarGrupos) {
            setMostrarGrupos(!mostrarGrupos);
        }
    }
    function toggleConfiguracion() {
        setMostrarConfiguracion(!mostrarConfiguracion);
        if (mostrarGrupos) {
            setMostrarGrupos(!mostrarGrupos);
        }
        if (mostrarNotificaciones) {
            setMostrarNotificaciones(!mostrarNotificaciones);
        }
    }
    function gestion(id, add) {
        let amigosCollection = collection(db, "amigos");
        let docRef = doc(amigosCollection, usuario.uid);
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

                    let idBorrada = usuario.uid;
                    newAmigos = newAmigos.filter((e) => {
                        return e !== idBorrada;
                    });

                    updateDoc(amigoRef, { pendientes: newAmigos });

                    if (add) {
                        newAmigos = [...data.amigos];
                        newAmigos.push(usuario.uid);
                        updateDoc(amigoRef, { amigos: newAmigos });
                    }
                }
            })
    }
    function handleMenuClick() {
        let checkbox = document.getElementById('menu-toggle');
        checkbox.checked = false;
    }
    function clickCalendar() {
        setShow(!show)
        cargaConfig()
        let recompensasCollection = collection(db, "recompensas");
        let recompensasQuery = query(recompensasCollection, where("activa", "==", true));

        getDocs(recompensasQuery)
            .then((querySnapshot) => {
                let recompensas = [];
                querySnapshot.forEach((doc) => {
                    recompensas.push(doc.data());
                })
                setRecompensas(recompensas);
            })

    }
    function cargaConfig() {
        let configCollection = collection(db, "config");
        
        let configQuery = query(configCollection, where("user_id", "==", usuario.uid));

        getDocs(configQuery)
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    setConfig(doc.data());
                    if(doc.data().status == 2){
                        setMostrarConfiguracion(true)
                    }
                });
            })
    }
    function reclamar(premio) {
        config.monedas += parseInt(premio);
        config.last_recompensa = new Date();
        config.recompensa_n++;

        let configCollection = collection(db, "config");
        let configQuery = query(configCollection, where("user_id", "==", usuario.uid));

        getDocs(configQuery)
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    updateDoc(doc.ref, config);
                });
            })
        setShowConfetti(true);

        setTimeout(() => {
            setShowConfetti(false);
        }, 3000);
        clickCalendar()
    }
    function panelGrupos(num) {
        if (num == 1) {
            setVerGrupo(1);
        } else if (num == 2) {
            setVerGrupo(2);
        }
    }

    if (usuario) {
        login = <div className='pe-5 me-0 me-md-5 d-flex align-items-end justify-content-end w-100'>
            {permisos >= 5 && (
                <Link to={"/admin"} className='icon btn'><Icon icon="pajamas:admin" /></Link>
            )}
            <Link to={"/buscador"} className='icon btn'><Icon icon="material-symbols:search" /></Link>
            <button onClick={clickCalendar} className='icon btn'><Icon icon="material-symbols-light:calendar-month" /></button>
            <button onClick={toggleGrupos} className='icon btn'><Icon icon="material-symbols:groups-sharp" /></button>
            <div>
                {amigos.length > 0 && (
                    <div className='badge bg-danger position-absolute mt-2 ms-5'>{amigos.length}</div>
                )}

                <button onClick={toggleNotificaciones} className='icon btn'><Icon icon="ph:bell-ringing" /></button>

            </div>
            <button onClick={() => {
              toggleConfiguracion();
              cargaConfig();
            }} className='icon btn'><Icon icon="ep:setting" /></button>
            <button onClick={cerrarSesion} className='icon btn'><Icon icon="material-symbols:exit-to-app-rounded" /></button>
            {mostrarGrupos && (
                <div className='div-emergente'>
                    <section className="div-emergente-title">
                        <h2>Grupos</h2>
                    </section>
                    <section className="div-emergente-body">
                        <div className='d-flex flex-column w-100 border-bottom pb-3'>
                            {grupos.length == 0? (
                                <p>No hay grupos</p>
                            ) : grupos.map((grupo) => (
                                <Link to={"/detalle/grupo/"+grupo.id} onClick={toggleGrupos} className='btn pt-3 pb-1 fs-3' key={grupo.id}>{grupo.nombre}</Link>
                            ))}
                        </div>
                        <button onClick={() => {
                            panelGrupos(1)
                        }} className='btn pt-3 pb-1 fs-3'>Unirse a Grupo</button>
                        {permisos >= 2 && (
                            <button onClick={() => {
                                panelGrupos(2)
                            }} className='btn pt-3 pb-1 fs-3'>Crear Grupo</button>
                        )}
                    </section>

                </div>
            )}
            {mostrarNotificaciones && (
                <div className='div-emergente'>
                    <section className="div-emergente-title">
                        <h2>Notificaciones</h2>
                    </section>
                    <section className="div-emergente-body">
                        {amigos.map((e) => (
                            <div key={e.user_id} className='d-flex align-items-center gap-2 w-100'>
                                <div className='w-25'>
                                    <img className='w-100' src={e.foto} alt={"Foto de " + e.user_name} />
                                </div>
                                <p className='fs-2'>{e.user_name}</p>
                                <div className='d-flex gap-0'>
                                    <button onClick={() => {
                                        gestion(e.user_id, false)
                                    }} className='text-danger btn p-0'><Icon className='fs-1' icon="material-symbols:close-small" /></button>
                                    <button onClick={() => {
                                        gestion(e.user_id, true)
                                    }} className='text-success btn p-0'><Icon className='fs-1' icon="dashicons:yes" /></button>
                                </div>
                            </div>
                        ))}
                    </section>
                </div>
            )}
        </div>
    } else {
        login = <div className=' d-flex align-items-center justify-content-end pe-5 me-5 w-25'>
            <Link to='/inicio-sesion'><button className='icon btn'><Icon icon="ph:user-duotone" /></button></Link>
        </div>


    }


    return (
        <>
            <header id='header' >
                <nav className="w-10">
                    <input id="menu-toggle" type="checkbox" />
                    <label className='menu-button-container' htmlFor="menu-toggle">
                        <div className='menu-button'></div>
                    </label>
                    <ul className="menu" >
                        {
                            menu.map((e) => (
                                <li key={e.key} onClick={handleMenuClick} className="header__nav__container">{e}</li>
                            ))
                        }
                    </ul>
                </nav>
                <div className='title'>
                    <Link to="/" className='display-1 d-none d-md-block'>Booku</Link>
                    <Link to="/" className='display-1 ms-5 d-flex d-md-none'>B</Link>
                </div>

                {login}
            </header>
            <footer id='footer' className='d-md-flex justify-content-md-evenly'>
                <section id="footer__help">
                    <h3>Acerca de</h3>
                    <ul>
                        <li><Link to="/cookies">Política de cookies</Link></li>
                        <li><Link to="/sobre-nosotros">Sobre nosotros</Link></li>
                        <li><Link to="/contacto">Contacto</Link></li>
                    </ul>
                </section>
                <section className='d-flex flex-column justify-content-center'>
                    <h2 className='display-1'>Booku</h2>
                    <p className='fs-3'>2024&copy;2025 Booku S.L.</p>
                </section>
                <section id="footer__info">
                    <h3>Redes sociales</h3>
                    <div className="rrss__content__social">
                        <a href="https://www.facebook.com"><Icon className='icon' icon="mdi:facebook" /></a>
                        <a href="https://www.instragram.es"><Icon className='icon' icon="mdi:instagram" /></a>
                        <a href="https://www.twitter.es"><Icon className='icon' icon="mdi:twitter" /></a>
                    </div>
                </section>
            </footer>

            <div className={`modal fade justify-content-center align-items-baseline align-items-md-center ${show ? 'show' : ''}`} id="recompensas" style={{ display: show ? 'flex' : 'none' }} onClick={(event) => { event.stopPropagation(); clickCalendar(); }}>
                <div className="recompensas modal-content w-70">
                    <div className="modal-body" onClick={(event) => event.stopPropagation()}>
                        <div>
                            <h2 className='display-6'>Calendario de recompensas</h2>
                            <button onClick={clickCalendar} type="button" className="btn position-absolute top-0 end-0">
                                <Icon className='display-1' icon="material-symbols:close-rounded" />
                            </button>
                        </div>
                        <div className='d-flex flex-wrap justify-content-center' style={{ gap: recompensas.length > 0 ? `${recompensas[0].recompensas.length}rem` : '0rem' }}>
                            {recompensas.length > 0 && recompensas[0].recompensas.map((e) => (
                                <div key={e.number + e.premio} className={'recompensas__recompensa d-flex flex-column align-items-center ' + (config.recompensa_n + 1 != e.number ? "recompensas__recompensa--desactivado" : "")}>
                                    <div className='recompensas__recompensa__foto'>
                                        <img className='w-100' src={e.foto} alt="" />
                                    </div>
                                    <p>Día {e.number}</p>
                                    <p>{e.premio} Bookoins</p>
                                    {(config.recompensa_n + 1 == e.number) && (config.last_recompensa.seconds + (24 * 60 * 60) - 10 < Math.floor(new Date().getTime() / 1000)) ? (
                                        <button onClick={() => {
                                            reclamar(e.premio)
                                        }} className='btn btn-primary'>
                                            Reclamar
                                        </button>
                                    ) : <button className='btn btn-primary' disabled>
                                        Reclamar
                                    </button>}

                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {mostrarConfiguracion &&  (
            <div className={`modal fade justify-content-center align-items-center ${mostrarConfiguracion ? 'show' : ''}`} id="recompensas" style={{ display: mostrarConfiguracion ? 'flex' : 'none' }} onClick={(event) => { event.stopPropagation(); toggleConfiguracion() }}>
                <div className="configuracion modal-content w-md-50">
                    <div className="modal-body" onClick={(event) => event.stopPropagation()}>
                        <div>
                            <h2 className='display-6'>Configuración</h2>
                            <button onClick={toggleConfiguracion} type="button" className="btn position-absolute top-0 end-0">
                                <Icon className='display-1' icon="material-symbols:close-rounded" />
                            </button>
                        </div>
                        <div className='d-flex flex-column align-items-center flex-wrap gap-5 w-100'>
                            <Configuracion onGuardado={toggleConfiguracion} juego={juego} config={config}></Configuracion>
                        </div>
                    </div>
                </div>
            </div>
            )}

            <div className={`modal fade justify-content-center align-items-center ${verGrupo != 0 ? 'show' : ''}`} id="recompensas" style={{ display: verGrupo != 0 ? 'flex' : 'none' }} onClick={(event) => { event.stopPropagation(); toggleGrupos() }}>
                <div className="grupos modal-content w-50">
                    <div className="modal-body" onClick={(event) => event.stopPropagation()}>
                        <div>
                            <button onClick={toggleGrupos} type="button" className="btn position-absolute top-0 end-0">
                                <Icon className='display-1' icon="material-symbols:close-rounded" />
                            </button>
                        </div>
                        <div className='d-flex flex-wrap justify-content-center py-5'>
                            {verGrupo === 1 && (
                                <CrearGrupo onUnido={() => {
                                    setVerGrupo(!verGrupo);
                                    actualizaGrupos();
                                }} number={1} user_id={usuario.uid} />
                            )}
                            {verGrupo === 2 && (
                                <CrearGrupo onUnido={() => {
                                    setVerGrupo(!verGrupo);
                                    actualizaGrupos();
                                }} number={2} user_id={usuario.uid} />
                            )}
                        </div>
                    </div>
                </div>
            </div>



            {showConfetti && <Confetti />}
        </>
    )
}
