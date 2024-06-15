import { Icon } from '@iconify/react';
import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import EditRetoModal from './EditRetoModal/EditRetoModal';
import { db } from '../../../config';

export default function Reto(props) {
    let [verModal, setVerModal] = useState(false);
    let [retos, setRetos] = useState([]);
    let [libros, setLibros] = useState({});
    let [filterText, setFilterText] = useState('');
    let [editModalVisible, setEditModalVisible] = useState(false);
    let [selectedReto, setSelectedReto] = useState(null);
    let [modalAddReto, setModalAddReto] = useState(false)

    let [duracion, setDuracion] = useState(["", ""]);
    let [busqueda, setBusqueda] = useState("");
    let [result, setResultado] = useState([]);
    let [librosReto, setLibrosReto] = useState([]);
    let [currentIndex, setCurrentIndex] = useState(0);
    let [errores, setError] = useState([]);
    let [nombre, setNombre] = useState("");

    useEffect(() => {
        setVerModal(props.modal);
        cargaRetos();
    }, [props.modal]);

    const cargaRetos = () => {
        fetch("https://api-booku.vercel.app/reto/", {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${props.usuario.accessToken}`
            },
        })
            .then(response => response.json())
            .then(data => {
                if (data && data.data) {
                    setRetos(data.data);
                    const bookIds = [...new Set(data.data.flatMap(reto => reto.id_libros || []))];
                    fetchBookDetails(bookIds);
                } else {
                    console.error('Invalid data received from API:', data);
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    };

    const fetchBookDetails = (bookIds) => {
        if (bookIds.length > 0) {
            const librosData = {};
            Promise.all(
                bookIds.map(id =>
                    fetch(`https://www.googleapis.com/books/v1/volumes/${id}`)
                        .then(response => response.json())
                        .then(data => {
                            if (data && data.volumeInfo && data.volumeInfo.title) {
                                librosData[id] = data.volumeInfo.title;
                            }
                        })
                        .catch(error => {
                            console.error(`Error fetching book details for ID ${id}:`, error);
                        })
                )
            ).then(() => {
                setLibros(librosData);
            });
        }
    };

    const handleEditClick = (reto) => {
        setSelectedReto(reto);
        setEditModalVisible(true);
    };

    const handleSaveReto = (reto) => {
        reto.uid = "";

        fetch('https://api-booku.vercel.app/reto/update/' + selectedReto.id, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${props.usuario.accessToken}`
            },
            body: JSON.stringify(reto)
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('La solicitud no fue exitosa');
                }
                return response.json();
            })
            .then((data) => {
                setEditModalVisible(false);
                cargaRetos();
                props.onMensaje("Reto actualizado!");
            })
            .catch((error) => {
                console.error('Error en la solicitud:', error);
            });
    };

    const ocultar = () => {
        setVerModal(!verModal);
        props.onOcultar();
    };

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
            uid: "",
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
            props.onMensaje("Reto creado correctamente");
            setModalAddReto(false)
        });
    }

    function cambiarRadio(e) {
        let newDuracion = [...duracion];
        newDuracion[1] = e;
        setDuracion(newDuracion);
    }

    const extractDuracion = (duracion) => {
        let tipo = {
            1: "días",
            2: "semanas",
            3: "meses"
        };

        // Verificar si duracion es un string
        if (typeof duracion === 'string') {
            // Intentar analizar el string JSON
            try {
                duracion = JSON.parse(duracion);
            } catch (error) {
                console.error('Error parsing duracion:', error);
                return '';
            }
        }

        if (Array.isArray(duracion) && duracion.length > 0) {
            const duracionesString = duracion.map(item => `${item.duracion} ${tipo[item.tipo]}`).join(', ');
            return duracionesString;
        } else if (typeof duracion === 'object' && duracion !== null) {
            return `${duracion.duracion} ${tipo[duracion.tipo]}`;
        } else {
            return '';
        }
    };

    const filteredData = retos
        .filter(reto => reto.nombre.toLowerCase().includes(filterText.toLowerCase()))
        .map(reto => ({
            ...reto,
            nombreReto: reto.nombre,
            duracion: reto.duracion,
            libros: (reto.id_libros || []).map(id => libros[id] || id).join(', '),
            acciones: (
                <button className='btn' onClick={() => handleEditClick(reto)}>
                    <Icon className='fs-1 text-primary' icon="majesticons:edit-pen-2" />
                </button>
            )
        }));

    const columns = [
        {
            name: "Nombre del Reto",
            selector: row => row.nombreReto,
            sortable: true,
        },
        {
            name: "Duración",
            selector: row => extractDuracion(row.duracion),
            sortable: true,
            sortFunction: (a, b) => {
                const duracionA = parseFloat(a.duracion[0].duracion);
                const tipoA = parseFloat(a.duracion[0].tipo);
                const duracionB = parseFloat(b.duracion[0].duracion);
                const tipoB = parseFloat(b.duracion[0].tipo);

                const tipoDuracion = {
                    "1": 1,
                    "2": 7, // Una semana equivale a 7 días
                    "3": 30 // Tomando un mes como 30 días (aproximado)
                };

                // Convertir la duración a días antes de comparar
                const duracionEnDiasA = duracionA * tipoDuracion[tipoA];
                const duracionEnDiasB = duracionB * tipoDuracion[tipoB];

                return duracionEnDiasA - duracionEnDiasB;
            }
        },
        {
            name: "Libros",
            selector: row => row.libros,
            sortable: false,
        },
        {
            name: "Acciones",
            selector: row => row.acciones,
            sortable: false,
            width: "20rem",
        }
    ];

    return (
        <div className={`modal fade justify-content-center align-items-baseline align-items-md-center ${verModal ? 'show' : ''}`} style={{ display: verModal ? 'flex' : 'none' }} onClick={ocultar}>
            <div className="grupos modal-content w-75" onClick={e => e.stopPropagation()}>
                <div className="modal-body">
                    <div>
                        <button onClick={ocultar} type="button" className="btn position-absolute top-0 end-0">
                            <Icon className='display-1' icon="material-symbols:close-rounded" />
                        </button>
                    </div>
                    <div className='d-flex flex-column align-items-center py-5 admin__usuarios'>
                        <h2 className='text-uppercase text-center'>Gestionar Reto</h2>

                        <DataTable
                            columns={columns}
                            data={filteredData}
                            pagination
                            className="table-responsive"
                            subHeader
                            noDataComponent="No hay retos para mostrar"
                            subHeaderComponent={
                                <div className='w-md-25 d-flex flex-column flex-md-row gap-3'>
                                    <input
                                        type="text"
                                        placeholder="Buscar..."
                                        className="form-search w-100"
                                        value={filterText}
                                        onChange={e => setFilterText(e.target.value)}
                                    />
                                    <button
                                        className="btn btn-primary w-100"
                                        onClick={() => {
                                            setModalAddReto(true)
                                        }}
                                    >
                                        Añadir retos
                                    </button>
                                </div>
                            }
                            paginationComponentOptions={{
                                rowsPerPageText: 'Filas por página',
                                rangeSeparatorText: 'de',
                                noRowsPerPage: false,
                                selectAllRowsItem: false,
                                selectAllRowsItemText: 'Todos'
                            }}
                        />

                    </div>
                </div>
            </div>
            {editModalVisible && (
                <EditRetoModal
                    show={editModalVisible}
                    reto={selectedReto}
                    onSave={handleSaveReto}
                    onClose={() => setEditModalVisible(false)}
                />
            )}
            {modalAddReto && (
                <div className={`modal fade justify-content-center align-items-baseline align-items-md-center ${modalAddReto ? 'show' : ''}`} style={{ display: modalAddReto ? 'flex' : 'none' }} onClick={() => {setModalAddReto(false)}}>
                    <div className="modal-content w-md-50 overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="modal-body">
                            <div>
                                <button onClick={() => {setModalAddReto(false)}} type="button" className="btn position-absolute top-0 end-0">
                                    <Icon className='display-1' icon="material-symbols:close-rounded" />
                                </button>
                            </div>
                            <div className='d-flex flex-column align-items-center py-5'>
                                <h2 className='text-uppercase display-2 fw-bold text-primary text-center'>Crea reto recomendado</h2>
                            </div>
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
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}