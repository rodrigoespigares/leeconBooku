import React, { useEffect, useState } from 'react'


import booku from '../../assets/booku.png'
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../../config';

import { Icon } from '@iconify/react/dist/iconify.js';
import Tienda from './Tienda/Tienda';
import Almacen from './Almacen/Almacen';
import { Link } from 'react-router-dom';

export default function Game() {
    const [infoBooku, setBooku] = useState({})
    const [config, setConfig] = useState("")
    const [mostrarTienda, setMostrarTienda] = useState(false);
    const [tienda, setTienda] = useState([]);
    const [almacen, setAlmacen] = useState([]);
    const [mostrarAlmacen, setMostrarAlmacen] = useState(false);

    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            if (user) {
                let configCollection = collection(db, "config");
                let configRef = query(configCollection, where("user_id", "==", user.uid));

                getDocs(configRef)
                    .then((querySnapshot) => {

                        querySnapshot.forEach((doc) => {
                            setConfig(doc.data())
                        })
                    })
            }
        })

    }, []);

    useEffect(() => {
        if (config) {
            cargarAlmacen();
            actulizaEstado();
        }
    }, [config]);

    function actulizaEstado() {
        let juegoCollection = collection(db, "juego");
        let docRef = doc(juegoCollection, config.user_id);

        getDoc(docRef)
            .then((docSnapshot) => {
                if (docSnapshot.exists()) {
                    setBooku(docSnapshot.data())
                } else {
                    let juego = {
                        estado: {
                            comida: 100,
                            vida: 100,
                        },
                        nombre: "Hola",
                        last_fed: new Date(),
                    }
                    setDoc(docRef, juego);
                    setBooku(juego)
                }
            })
    }


    function cargarTienda() {
        let tiendaCollection = collection(db, "tienda");
        getDocs(tiendaCollection)
            .then((querySnapshot) => {
                let comida = []
                querySnapshot.forEach((doc) => {
                    comida.push(doc.data())
                })
                setTienda(comida)
                setMostrarTienda(!mostrarTienda)
            })
    }
    function cargarAlmacen() {
        let almacenCollection = collection(db, "almacen");
        let almacenDoc = doc(almacenCollection, config.user_id);
        getDoc(almacenDoc)
            .then((querySnapshot) => {

                if (querySnapshot.exists) {
                    setAlmacen(querySnapshot.data())
                }
            })
    }

    function toggleAlmacen() {
        if (!mostrarAlmacen) {
            cargarAlmacen();
        }

        setMostrarAlmacen(!mostrarAlmacen)
    }

    function toggleTienda() {
        cargarTienda();
    }
    function actualizarConfiguracion(nuevaConfiguracion) {
        setConfig(nuevaConfiguracion);
        cargarAlmacen();
    }

    function sumarCantidades() {
        let totalCantidad = 0;
        for (const producto in almacen) {
            if (almacen.hasOwnProperty(producto) && almacen[producto].cantidad) {
                totalCantidad += almacen[producto].cantidad;
            }
        }
        return totalCantidad;
    };


    return (
        <>
            <Link to="/home" className="btn btn-secondary mt-5 ms-5">Volver</Link>
            <div className='d-flex flex-column flex-md-row h-100 align-items-center'>
                <section id="juego_info" className='d-flex flex-column align-items-center w-50'>
                    <div className='w-md-25'>
                        <img className='w-100' src={booku} alt="Aquí está Booku" />
                    </div>
                    <h2 className='display-2 mt-5'>{infoBooku.nombre}</h2>
                </section>
                <section className='h-100 w-md-50 d-flex flex-column justify-content-baseline '>
                    {infoBooku && Object.keys(infoBooku).length !== 0 && (
                        <article id='juego_estados_info' className='h-25 w-md-50 d-flex flex-column justify-content-evenly'>
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
                        </article>
                    )}
                    <article className='d-flex w-md-50 align-items-center justify-content-evenly gap-3'>
                        <button onClick={toggleAlmacen} className='btn btn-primary d-flex flex-column'><Icon className='btn-juego p-4' icon="streamline:refrigerator-solid" /> {sumarCantidades()} 🍔</button>
                        <button onClick={toggleTienda} className='btn btn-primary d-flex flex-column'><Icon className='btn-juego p-4' icon="bi:shop" />{config.monedas} 🪙</button>
                    </article>
                </section>         
            </div>

            <div className={`modal fade justify-content-center align-items-baseline mt-5 pt-5 ${mostrarTienda ? 'show' : ''}`} id="recompensas" style={{ display: mostrarTienda ? 'flex' : 'none' }} onClick={(event) => { event.stopPropagation(); toggleTienda() }}>
                <div className="tienda modal-content w-50">
                    <div className="modal-body" onClick={(event) => event.stopPropagation()}>
                        <div>
                            <h2 className='display-6'>Tienda</h2>
                            <button onClick={toggleTienda} type="button" className="btn position-absolute top-0 end-0">
                                <Icon className='display-1 ' icon="material-symbols:close-rounded" />
                            </button>
                        </div>
                        <div className='d-flex flex-column justify-content-center align-items-center gap-5'>
                            <Tienda config={config} actualizarConfiguracion={actualizarConfiguracion} user_id={config.user_id} monedas={config.monedas} tienda={tienda}></Tienda>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`modal fade justify-content-center align-items-baseline mt-5 pt-5 ${mostrarAlmacen ? 'show' : ''}`} id="recompensas" style={{ display: mostrarAlmacen ? 'flex' : 'none' }} onClick={(event) => { event.stopPropagation(); toggleAlmacen() }}>
                <div className="almacen modal-content w-50">
                    <div className="modal-body" onClick={(event) => event.stopPropagation()}>
                        <div>
                            <h2 className='display-6'>Almacen</h2>
                            <button onClick={toggleAlmacen} type="button" className="btn position-absolute top-0 end-0">
                                <Icon className='display-1 ' icon="material-symbols:close-rounded" />
                            </button>
                        </div>
                        <div className='d-flex flex-column justify-content-center align-items-center gap-5'>
                            <Almacen onActualizarEstado={actulizaEstado} onTomarProducto={cargarAlmacen} config={config} almacen={almacen}></Almacen>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
