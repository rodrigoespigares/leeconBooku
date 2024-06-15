import React, { useEffect, useState } from 'react'

import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react/dist/iconify.js';
import FormReto from '../FormReto/FormReto'

export default function Retos() {
    let navega = useNavigate();
    let [reto, setReto] = useState([]);
    let [nombre, setNombre] = useState("");
    let [fecha, setFecha] = useState("");
    let [mostrarForm, setMostrarForm] = useState(false);
    let [busqueda, setBusqueda] = useState();
    let [result, setResultado] = useState();
    let [librosReto, setLibrosReto] = useState([])
    let [currentIndex, setCurrentIndex] = useState(0);
    let [noti, setNoti] = useState();
    let [user, setUser] = useState();
    let [errores, setError] = useState([])

    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user)
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
            }
        })
    }, []);

    function toggleForm(){
        setMostrarForm(!mostrarForm);
    }

    function buscarLibro(){
        fetch("https://www.googleapis.com/books/v1/volumes?q="+busqueda+"&maxResults=12")
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setResultado(data.items);
            })
    }

    function addBook(libro){
        if(!librosReto.includes(libro)){
            setLibrosReto([...librosReto, libro])
        }
    }
    function handlePrev(){
        setCurrentIndex(prevIndex =>
            prevIndex === 0 ? Math.max(0, result.length - 3) : prevIndex - 3
        );
    };
    function handleNext(){
        setCurrentIndex(prevIndex =>
            prevIndex === Math.max(0, result.length - 3) ? 0 : prevIndex + 3
        );
    };

    function quitar(id){
        setLibrosReto(librosReto.filter(libro => libro.id !== id))
    }

    function validaReto(){
        let error =[];
        if(nombre == ""){
            error["nombre"]= "El nombre no puede estar vacío"
        }
        if(fecha == ""){
            error["fecha"]= "La fecha no puede estar vacía"
        }
        if(librosReto == ""){
            error["librosReto"]= "Debes añadir mínimo un libro"
        }
        setError(error);
        if(Object.keys(error).length == 0){
            crearReto()
        }
        

    }

    function crearReto(){
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
            uid: user.uid,
            fecha_max: fecha
        };
        
        fetch("https://api-booku.vercel.app/reto/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user.accessToken}`,
            },
            body: JSON.stringify(data)
        }).then(response => {
            return response.json();
        }).then(data => {
            setNoti(data.data)
        })

        
    }

    return (
        <>
            <Link to="/home" className="mt-5 ms-5 btn btn-secondary">Volver</Link>
            <div className='d-flex flex-column flex-md-row justify-content-center align-items-center h-100 gap-5 py-5 py-md-0'>
                {reto.map((e, index) => 
                    !e.uid || e.uid === "" ? (
                        <Link to={'/detalle/reto/'+e.id} className='tarjeta-grande' key={index}>
                            <p>{e.nombre}</p>
                        </Link>     
                    ) : ''
                )}
                <button onClick={toggleForm} className='btn tarjeta-grande'>
                    <p>Crear</p>
                </button>

                <div className={`modal fade justify-content-center align-items-baseline ${mostrarForm ? 'show' : ''}`} style={{ display: mostrarForm ? 'flex' : 'none' }} onClick={(event) => { event.stopPropagation(); toggleForm() }}>
                    <div className="configuracion modal-content w-md-50">
                        <div className="modal-body" onClick={(event) => event.stopPropagation()}>
                            <div>
                                <h2 className='display-6'>Crea tu reto</h2>
                                <button onClick={toggleForm} type="button" className="btn btn-close-white position-absolute top-0 end-0">
                                    <Icon className='display-1' icon="material-symbols:close-rounded" />
                                </button>
                            </div>
                            <div className='d-flex flex-column align-items-center flex-wrap gap-5 w-100'>
                                <FormReto nombre={""} libroReto={[]} usuario={user} onCreado={(id_reto) => {
                                    navega(`/detalle/reto/${id_reto}`, { state: { mensaje: "Reto creado correctamente" } })
                                }}></FormReto>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
