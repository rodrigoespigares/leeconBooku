import React, { useEffect, useState } from 'react';
import { db } from '../../../config';
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { Icon } from '@iconify/react/dist/iconify.js';

export default function Notas(props) {

    const [notas, setNotas] = useState([]);
    const [nombre, setNombre] = useState("");
    const [retoGrupo, setRetoGrupo] = useState({});
    const [usuarios, setUsuarios] = useState({});
    const [confirmar, setConfirmar] = useState(false);
    const [userRemove, setUserRemove] = useState("");
    const [idUsuario, setKey] = useState("");

    useEffect(() => {
        cargarExamen();
    }, [props.idGrupo]);

    function cargarExamen() {
        const grupoDataRef = doc(db, 'grupos', props.idGrupo);
        getDoc(grupoDataRef)
            .then((docSnapshot) => {
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data();
                    const format = {};

                    const userPromises = Object.keys(data.notas).map((key) => {
                        const configCollection = collection(db, "config");
                        const configQuery = query(configCollection, where("user_id", "==", key));
                        return getDocs(configQuery)
                            .then((querySnapshot) => {
                                querySnapshot.forEach((document) => {
                                    format[key] = document.data().user_name;
                                });
                            });
                    });

                    Promise.all(userPromises).then(() => {
                        setUsuarios(format);
                    });

                    setNotas(data.notas);
                }
            }).catch(error => {
                console.error("Error fetching grupo data:", error);
            });
    }

    function confirmarModal(nombre,key) {
        return () => {
            setConfirmar(!confirmar);
            setUserRemove(nombre);
            setKey(key)
        };
    }

    function remove(key){
        let grupoDataRef = doc(db, 'grupos', props.idGrupo);
        getDoc(grupoDataRef)
            .then((docSnapshot) => {
                if (docSnapshot.exists()) {
                    let data = docSnapshot.data();
                    let updatedNotas = { ...data.notas };
                    delete updatedNotas[key];

                    updateDoc(grupoDataRef, { notas: updatedNotas })
                }
            })
            .then(() => {
                cargarExamen();
                setConfirmar(!confirmar);
                props.onActualizarGrupo();
            })
            .catch(error => {
                console.error("Error fetching grupo data:", error);
            });
    }

    return (
        <>
            <section>
                <article className='d-flex flex-column'>
                    <h2>Notas de usuarios</h2>
                    <div className='d-flex flex-column gap-3 mt-2'>
                        {notas && Object.keys(notas).length > 0 ? Object.entries(notas).map(([key, value]) => (
                            <div key={key} className='d-flex justify-content-between'>
                                <p className='fs-1 text-primary'><span>{usuarios[key] || 'Usuario no encontrado'}</span>: {value}</p>
                                <button onClick={confirmarModal(usuarios[key], key)} className='btn btn-primary'>
                                    <Icon icon="ri:delete-bin-2-fill" />
                                </button>
                            </div>
                        )) : notas && Object.keys(notas).length === 0 ? (
                            <p className='fs-1 text-primary'>Nadie ha hecho el examen.</p>
                        ) : (
                            <p className='fs-1 text-primary'>Cargando notas...</p>
                        )}
                    </div>
                </article>
            </section>

            <div className={`modal fade justify-content-center align-items-center ${confirmar ? 'show' : ''}`} style={{ display: confirmar ? 'flex' : 'none' }}>
                <div className="modal-content w-md-50">
                    <div className="modal-body">
                        <div className='d-flex flex-column py-5'>
                            <h2 className='display-1 fw-bold text-primary'>¿Quieres borrar la nota de {userRemove}?</h2>
                            <div className='d-flex justify-content-between mt-5 pt-5'>
                            <button onClick={() => {
                              remove(idUsuario)
                            }} className='btn btn-danger-long'>Borrar</button>
                            <button className='btn btn-tertiary-dark' onClick={() => { setConfirmar(!confirmar) }}>Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}