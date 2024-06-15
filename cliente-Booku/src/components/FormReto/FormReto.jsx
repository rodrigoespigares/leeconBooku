import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useState, useEffect } from 'react'
import { addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../../config';

export default function FormReto(props) {
    let [noti, setNoti] = useState([]);
    let [duracion, setDuracion] = useState(["", ""]);
    let [busqueda, setBusqueda] = useState("");
    let [result, setResultado] = useState([]);
    let [librosReto, setLibrosReto] = useState([]);
    let [currentIndex, setCurrentIndex] = useState(0);
    let [errores, setError] = useState([]);
    let [nombre, setNombre] = useState("");

    useEffect(() => {
        if (props.nombre !== "" || props.libroReto.length > 0) {
            setNombre(props.nombre);
            setLibrosReto(props.libroReto);
        }
    }, [props.nombre, props.libroReto]);

    function buscarLibro() {
        fetch("https://www.googleapis.com/books/v1/volumes?q=" + busqueda + "&maxResults=12")
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setResultado(data.items);
            });
    }

    function addBook(libro) {
        if (!librosReto.includes(libro)) {
            setLibrosReto([...librosReto, libro]);
        }
    }

    function handlePrev() {
        setCurrentIndex(prevIndex =>
            prevIndex === 0 ? Math.max(0, result.length - 3) : prevIndex - 3
        );
    };

    function handleNext() {
        setCurrentIndex(prevIndex =>
            prevIndex === Math.max(0, result.length - 3) ? 0 : prevIndex + 3
        );
    };

    function quitar(id) {
        setLibrosReto(librosReto.filter(libro => libro.id !== id));
    }

    function validaReto() {
        let error = [];
        if (nombre === "") {
            error["nombre"] = "El nombre no puede estar vacío";
        }
        if (duracion[0] === "") {
            error["duracion"] = "La duración no puede estar vacía";
        }
        if (duracion[1] === "") {
            error["duracion"] = "Elige un tipo de duración";
        }
        if (librosReto.length === 0) {
            error["librosReto"] = "Debes añadir mínimo un libro";
        }
        setError(error);
        if (Object.keys(error).length === 0) {
            crearReto();
        }
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

    function crearReto() {
        let idLibros = [];
        if (Array.isArray(librosReto)) {
            librosReto.forEach((datos) => {
                if (datos && datos.id) {
                    idLibros.push(datos.id);
                }
            });
        }
        const data = {
            nombre: nombre,
            id_libros: idLibros,
            uid: props.usuario.uid,
            duracion: [duracion[0], duracion[1]]
        };
        fetch("https://api-booku.vercel.app/reto/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${props.usuario.accessToken}`,
            },
            body: JSON.stringify(data)
        }).then(response => {
            return response.json();
        }).then(data => {
            if (props.grupo) {
                const grupoData = query(collection(db, 'grupos'), where("nombre", "==", props.grupo.nombre));
                getDocs(grupoData)
                    .then((querySnapshot) => {
                        querySnapshot.forEach((documentSnapshot) => {
                            let docRef = doc(db, 'grupos', documentSnapshot.id);
                            let fecha = new Date();
                            switch (duracion[1]) {
                                case "1":
                                    fecha = sumarDias(fecha, parseInt(duracion[0]));
                                    break;
                                case "2":
                                    fecha = sumarSemanas(fecha, parseInt(duracion[0]));
                                    break;
                                case "3":
                                    fecha = sumarMeses(fecha, parseInt(duracion[0]));
                                    break;
                            }
                            updateDoc(docRef, {
                                reto_id: {
                                    fecha_max: fecha,
                                    id: data.head.id
                                }
                            })
                            .then(() => {
                                props.onCreado();
                            });
                        });
                    });
            }
            const configData = query(collection(db, 'config'), where("user_id", "==", props.usuario.uid));
            getDocs(configData)
                    .then((querySnapshot) => {
                        querySnapshot.forEach((documentSnapshot) => {
                            let docRef = doc(db, 'config', documentSnapshot.id);
                            
                            let fecha = new Date();
                            switch (duracion[1]) {
                                case "1":
                                    fecha = sumarDias(fecha, parseInt(duracion[0]));
                                    break;
                                case "2":
                                    fecha = sumarSemanas(fecha, parseInt(duracion[0]));
                                    break;
                                case "3":
                                    fecha = sumarMeses(fecha, parseInt(duracion[0]));
                                    break;
                            }
                            let newActual = documentSnapshot.data().actual
                            newActual.push({fecha_end:fecha, fecha_start:new Date(), id_reto:data.head.id})
                            updateDoc(docRef, {
                                actual: newActual
                            })
                            .then(() => {
                                props.onCreado(data.head.id);
                            });
                        });
                    });
        });
    }

    function cambiarRadio(e) {
        let newDuracion = [...duracion];
        newDuracion[1] = e;
        setDuracion(newDuracion);
    }

    return (
        <>
            <div className='d-flex flex-column align-items-center flex-wrap gap-5 w-100'>
                <div className='d-flex flex-column gap-5 w-100'>
                    <div className="form-input">
                        <label htmlFor="nombre">Nombre</label>
                        <input 
                            className={nombre.length >= 0 ? "text-white" : ""} 
                            type="text" 
                            name="nombre" 
                            id="nombre" 
                            value={nombre} 
                            onChange={(e) => setNombre(e.target.value)} 
                        />
                    </div>
                    {errores.nombre && (<p className='fs-2 text-danger'>{errores.nombre}</p>)}
                    <div className='form-two-input'>
                        <label className='form-two-input__label' htmlFor="duracion1">Duración</label>
                        <div className="form-value">
                            <div className='form-value__duracion'>
                                <input 
                                    type="text" 
                                    id="duracion1" 
                                    onChange={(e) => {
                                        let newDuracion = [...duracion];
                                        newDuracion[0] = e.target.value;
                                        setDuracion(newDuracion);
                                    }} 
                                />
                            </div>
                            <div className="form-value__tipo">
                                <input 
                                    hidden 
                                    type='radio' 
                                    name='duracion2' 
                                    id='duracionDia' 
                                    checked={duracion[1] === "1"} 
                                    onChange={() => cambiarRadio("1")} 
                                />
                                <label htmlFor="duracionDia">Día</label>
                                <input 
                                    hidden 
                                    type='radio' 
                                    name='duracion2' 
                                    id='duracionSemana' 
                                    checked={duracion[1] === "2"} 
                                    onChange={() => cambiarRadio("2")} 
                                />
                                <label className='form-value__tipo__selected' htmlFor="duracionSemana">Semana</label>
                                <input 
                                    hidden 
                                    type='radio' 
                                    name='duracion2' 
                                    id='duracionMes' 
                                    checked={duracion[1] === "3"} 
                                    onChange={() => cambiarRadio("3")} 
                                />
                                <label htmlFor="duracionMes">Mes</label>
                            </div>
                        </div>
                    </div>
                    {errores.fecha && (<p className='fs-2 text-danger'>{errores.fecha}</p>)}
                    <div className="form-input-search-mini">
                        <label htmlFor="buscar">Buscar Libro</label>
                        <input 
                            className={busqueda.length >= 0 ? "text-white" : ""} 
                            type="text" 
                            name="buscar" 
                            id="buscar" 
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    buscarLibro();
                                }
                            }} 
                            onChange={(e) => setBusqueda(e.target.value)} 
                        />
                        <button onClick={buscarLibro}><Icon icon="material-symbols:search" /></button>
                    </div>
                    {errores.librosReto && (<p className='fs-2 text-danger'>{errores.librosReto}</p>)}
                    <div className='d-flex flex-column flex-md-row w-100 align-items-center justify-content-between'>
                        {result &&
                            <>
                                <button onClick={handlePrev} className="btn btn-primary btn-carrousel">&#10094;</button>
                                {result.slice(currentIndex, currentIndex + 3).map((libro) => (
                                    <div className='ranking__book' key={libro.id}>
                                        <img className='ranking__book__img' src={libro.volumeInfo.imageLinks ? libro.volumeInfo.imageLinks.thumbnail : ''} alt={"Portada de " + libro.volumeInfo.title} />
                                        <p className='ranking__book__title'>{libro.volumeInfo.title}</p>
                                        <button className='btn btn-primary' onClick={() => addBook(libro)}>Añadir</button>
                                    </div>
                                ))}
                                <button onClick={handleNext} className="btn btn-primary btn-carrousel">&#10095;</button>
                            </>
                        }
                    </div>
                    {librosReto.length > 0 && (
                        <div className='d-flex flex-column gap-3'>
                            <h2>Libros añadidos ({librosReto.length})</h2>
                            <div className='listado-retos d-flex flex-column gap-3'>
                                {librosReto.map((libro) => (
                                    <div key={libro.id} className='d-flex w-100 justify-content-between align-items-center'>
                                        <div className='d-flex w-100'>
                                            <span className='fs-1 text-secondary w-50 gap-5'>{libro.volumeInfo.title}</span>
                                            <span className='fs-1 text-secondary w-50 gap-5'>{libro.volumeInfo.authors[0]}</span>
                                        </div>
                                        <button onClick={() => quitar(libro.id)} className='btn btn-primary'><Icon className='display-2' icon="solar:trash-bin-2-bold" /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <button onClick={validaReto} className='btn btn-primary'>Crear Reto</button>
                </div>
            </div>
        </>
    )
}