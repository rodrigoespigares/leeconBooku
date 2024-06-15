import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useEffect, useState } from 'react';

export default function EditRetoModal({ show, reto, onSave, onClose, usuario }) {
    const [nombre, setNombre] = useState(reto?.nombre || '');
    const [duracion, setDuracion] = useState(reto?.duracion || ["", ""]);
    const [libros, setLibros] = useState(reto?.id_libros || []);
    const [librosReto, setLibrosReto] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [result, setResultado] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [errores, setError] = useState([]);

    useEffect(() => {
        if (reto) {
            setNombre(reto.nombre);
            setDuracion(reto.duracion);
            setLibros(reto.id_libros);
        }
    }, [reto]);

    useEffect(() => {
        if (libros.length > 0) {
            let librosResultado = [];
    
            Promise.all(
                libros.map((libro) =>
                    fetch("https://www.googleapis.com/books/v1/volumes/" + libro)
                        .then((response) => {
                            if (!response.ok) {
                                throw new Error('Network response was not ok');
                            }
                            return response.json();
                        })
                        .then((data) => {
                            librosResultado.push(data);
                        })
                        .catch((error) => {
                            console.error('Error fetching book:', error);
                        })
                )
            ).then(() => {
                setLibrosReto(librosResultado);
            });
        }
    }, [libros]);

    const handleSave = () => {
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
            duracion: [duracion[0].duracion, duracion[0].tipo]
        };

        onSave(data);
    };

    const buscarLibro = () => {
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
    };

    const addBook = (libro) => {
        if (!librosReto.includes(libro)) {
            setLibrosReto([...librosReto, libro]);
        }
    };

    const handlePrev = () => {
        setCurrentIndex(prevIndex => prevIndex === 0 ? Math.max(0, result.length - 3) : prevIndex - 3);
    };

    const handleNext = () => {
        setCurrentIndex(prevIndex => prevIndex === Math.max(0, result.length - 3) ? 0 : prevIndex + 3);
    };

    const quitar = (id) => {
        setLibrosReto(librosReto.filter(libro => libro.id !== id));
    };

    const validaReto = () => {
        let error = [];
        if (nombre === "") {
            error["nombre"] = "El nombre no puede estar vacío";
        }
        if (duracion[0] === "") {
            error["duracion"] = "La duracion no puede estar vacía";
        }
        if (duracion[1] === "") {
            error["duracion"] = "Elige un tipo de duración";
        }
        if (librosReto.length === 0) {
            error["librosReto"] = "Debes añadir mínimo un libro";
        }
        setError(error);
        if (Object.keys(error).length === 0) {
            handleSave();
        }
    };

    const cambiarRadio = (e) => {
        let newDuracion = [...duracion];
        newDuracion[1] = e;
        setDuracion(newDuracion);
    };

    return (
        <div
            className={`modal fade justify-content-center align-items-baseline align-items-md-center ${show ? 'show' : ''}`}
            style={{ display: show ? 'flex' : 'none' }}
            onClick={onClose}
        >
            <div className="modal-content w-md-50 overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="modal-body">
                    <div>
                        <button onClick={onClose} type="button" className="btn position-absolute top-0 end-0">
                            <Icon className='display-1' icon="material-symbols:close-rounded" />
                        </button>
                    </div>
                    <div className='d-flex flex-column align-items-center py-5'>
                        <h2 className='text-uppercase display-2 fw-bold text-primary text-center'>Editar Reto</h2>
                        <div className='w-100'>
                            <div className="form-input">
                                <label>Nombre</label>
                                <input
                                    type="text"
                                    value={nombre}
                                    onChange={e => setNombre(e.target.value)}
                                />
                            </div>
                            {errores.nombre && (<p className='fs-2 text-danger'>{errores.nombre}</p>)}
                            <div className='form-two-input'>
                                <label className='form-two-input__label'>Duración</label>
                                <div className="form-value">
                                    <div className='form-value__duracion'>
                                        <input
                                            type="text"
                                            value={duracion[0].duracion}
                                            onChange={e => {
                                                let newDuracion = [...duracion];
                                                newDuracion[0] = e.target.value;
                                                setDuracion(newDuracion);
                                            }}
                                        />
                                    </div>
                                    <div className="form-value__tipo">
                                        <input hidden type='radio' name='duracion2' id='duracionDia' checked={duracion[0].tipo == "1"} onChange={() => cambiarRadio("1")} />
                                        <label htmlFor="duracionDia">Día</label>
                                        <input hidden type='radio' name='duracion2' id='duracionSemana' checked={duracion[0].tipo == "2"} onChange={() => cambiarRadio("2")} />
                                        <label className='form-value__tipo__selected' htmlFor="duracionSemana">Semana</label>
                                        <input hidden type='radio' name='duracion2' id='duracionMes' checked={duracion[0].tipo == "3"} onChange={() => cambiarRadio("3")} />
                                        <label htmlFor="duracionMes">Mes</label>
                                    </div>
                                </div>
                            </div>
                            {errores.duracion && (<p className='fs-2 text-danger'>{errores.duracion}</p>)}
                            <div className="form-input-search">
                                <label>Buscar Libro</label>
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
                                {result.length>0 &&
                                    <>
                                        <button onClick={handlePrev} className="btn btn-primary btn-carrousel">&#10094;</button>
                                        {
                                            result.slice(currentIndex, currentIndex + 3).map((libro) => (
                                                <div className='ranking__book' key={libro.id}>
                                                    <img className='ranking__book__img' src={libro.volumeInfo.imageLinks ? libro.volumeInfo.imageLinks.thumbnail : ''} alt={"Portada de " + libro.volumeInfo.title} />
                                                    <p className='ranking__book__title'>{libro.volumeInfo.title}</p>
                                                    <button className='btn btn-primary' onClick={() => addBook(libro)}>Añadir</button>
                                                </div>
                                            ))
                                        }
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
                            <button onClick={validaReto} className="btn btn-primary mt-3">Guardar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}