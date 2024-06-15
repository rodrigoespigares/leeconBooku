import { Icon } from '@iconify/react';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { db } from '../../../config';

export default function Recompensas({ modal, onOcultar }) {
    const [verModal, setVerModal] = useState(false);
    const [recompensas, setRecompensas] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentRecompensaIndex, setCurrentRecompensaIndex] = useState(null);
    const [showForm, setShowForm] = useState(false);
    let [confirmar, setConfirmar] = useState(false);
    let [borrado, setBorrado] = useState(0)
    const [newRecompensa, setNewRecompensa] = useState({
        number: '',
        premio: '',
        foto: 'https://firebasestorage.googleapis.com/v0/b/lee-con-booku.appspot.com/o/money.png?alt=media&token=97d4de41-e1e5-4c80-8715-b8f5b5e15369'
    });

    useEffect(() => {
        setVerModal(modal);

        const archivo = query(collection(db, "recompensas"), where("activa", "==", true));
        getDocs(archivo)
            .then((querySnapshot) => {
                const recompensas = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const sortedRecompensas = recompensas[0].recompensas.sort((a, b) => a.number - b.number);
                setRecompensas(sortedRecompensas);
                setNewRecompensa({
                    number: parseInt(sortedRecompensas[sortedRecompensas.length - 1]?.number || 0) + 1,
                    premio: '',
                    foto: 'https://firebasestorage.googleapis.com/v0/b/lee-con-booku.appspot.com/o/money.png?alt=media&token=97d4de41-e1e5-4c80-8715-b8f5b5e15369'
                });
            });
    }, [modal]);

    function ocultar() {
        setVerModal(false);
        onOcultar();
    };

    function handleInputChange(e) {
        const { name, value } = e.target;
        setNewRecompensa(prevState => ({ ...prevState, [name]: value }));
    };

    function addRecompensa() {
        const updatedRecompensas = [...recompensas, newRecompensa];
        const sortedRecompensas = updatedRecompensas.sort((a, b) => a.number - b.number);
        const recompensasDoc = doc(db, 'recompensas', '5zvEygcjucpYze6gKYdz');

        updateDoc(recompensasDoc, { recompensas: sortedRecompensas })
            .then(() => {
                setRecompensas(sortedRecompensas);
                setNewRecompensa({
                    number: parseInt(newRecompensa.number) + 1,
                    premio: '',
                    foto: 'https://firebasestorage.googleapis.com/v0/b/lee-con-booku.appspot.com/o/money.png?alt=media&token=97d4de41-e1e5-4c80-8715-b8f5b5e15369'
                });
                setIsEditing(false);
                setCurrentRecompensaIndex(null);
                setShowForm(false);
            });
    };

    function handleEditRecompensa(index) {
        setNewRecompensa(recompensas[index]);
        setIsEditing(true);
        setCurrentRecompensaIndex(index);
        setShowForm(true);
    };

    function handleUpdateRecompensa() {
        const updatedRecompensas = [...recompensas];
        updatedRecompensas[currentRecompensaIndex] = newRecompensa;
        const sortedRecompensas = updatedRecompensas.sort((a, b) => a.number - b.number);
        const recompensasDoc = doc(db, 'recompensas', '5zvEygcjucpYze6gKYdz');

        updateDoc(recompensasDoc, { recompensas: sortedRecompensas })
            .then(() => {
                setRecompensas(sortedRecompensas);
                setNewRecompensa({
                    number: parseInt(newRecompensa.number) + 1,
                    premio: '',
                    foto: 'https://firebasestorage.googleapis.com/v0/b/lee-con-booku.appspot.com/o/money.png?alt=media&token=97d4de41-e1e5-4c80-8715-b8f5b5e15369'
                });
                setIsEditing(false);
                setCurrentRecompensaIndex(null);
                setShowForm(false);
                props.onMensaje("Recompensa actualizada!");
            });
    };

    function handleDeleteRecompensa(index) {
        const updatedRecompensas = recompensas.filter((_, i) => i !== index);
        const sortedRecompensas = updatedRecompensas.sort((a, b) => a.number - b.number);
        const recompensasDoc = doc(db, 'recompensas', '5zvEygcjucpYze6gKYdz');

        updateDoc(recompensasDoc, { recompensas: sortedRecompensas })
            .then(() => {
                setRecompensas(sortedRecompensas);
                setConfirmar(!confirmar)
                props.onMensaje("Recompensa borrada!");
            })
            .catch((error) => {
                console.error("Error deleting document: ", error);
            });
    };

    function resetForm() {
        setNewRecompensa({
            number: parseInt(recompensas[recompensas.length - 1]?.number || 0) + 1,
            premio: '',
            foto: 'https://firebasestorage.googleapis.com/v0/b/lee-con-booku.appspot.com/o/money.png?alt=media&token=97d4de41-e1e5-4c80-8715-b8f5b5e15369'
        });
        setIsEditing(false);
        setCurrentRecompensaIndex(null);
        setShowForm(!showForm);
    };

    return (
        <div
            className={`modal fade justify-content-center align-items-baseline align-items-md-center ${verModal ? 'show' : ''}`}
            style={{ display: verModal ? 'flex' : 'none' }}
            onClick={ocultar}
        >
            <div className="grupos modal-content w-75 overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="modal-body">
                    <div>
                        <button onClick={ocultar} type="button" className="btn position-absolute top-0 end-0">
                            <Icon className='display-1' icon="material-symbols:close-rounded" />
                        </button>
                    </div>
                    <div className='d-flex flex-column align-items-center py-5 admin__usuarios'>
                        <h2 className='text-uppercase text-center'>Gestionar Recompensas</h2>
                        <div className='d-flex flex-column align-items-center align-items-lg-baseline flex-lg-row flex-lg-wrap justify-content-center'>
                            {recompensas && recompensas.map((recompensa, index) => (
                                <div className='w-lg-25 d-flex flex-column align-items-center m-2 ' key={index}>
                                    <div className='w-25'>
                                        <img className='w-100' src={recompensa.foto} alt="" />
                                    </div>
                                    <p className='fs-2 text-primary'>{recompensa.number}</p>
                                    <p className='fs-2 text-primary'>{recompensa.premio}</p>
                                    <div className='d-flex gap-2'>
                                        <button className='btn btn-primary' onClick={() => handleEditRecompensa(index)}>Editar</button>
                                        <button className='btn btn-danger-long' onClick={() => {setBorrado(index) ;setConfirmar(!confirmar)}}>Eliminar</button>
                                    </div>
                                </div>
                            ))}
                            {/* BOTÓN DE AÑADIR */}
                            <button className='btn text-primary ms-5' onClick={() => {
                                resetForm();
                            }}>
                                <Icon className='display-1' icon="material-symbols:add-circle-outline" />
                            </button>
                        </div>
                        {showForm && (
                            <div className='mt-4 d-flex flex-column align-items-center'>
                                <h3 className='fs-2 text-primary'>{isEditing ? "Editar Recompensa" : "Añadir Nueva Recompensa"}</h3>

                                <div className="w-md-50 d-flex flex-column gap-3 mb-4">
                                    <div className="form-input">
                                        <input
                                            type="text"
                                            name="number"
                                            placeholder="Número recompensa"
                                            value={newRecompensa.number}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="form-input">
                                        <input
                                            type="text"
                                            name="premio"
                                            placeholder="Premio"
                                            value={newRecompensa.premio}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <button onClick={isEditing ? handleUpdateRecompensa : addRecompensa} className='btn btn-primary'>
                                    {isEditing ? "Guardar Cambios" : "Añadir"}
                                </button>
                                
                                
                                <button onClick={resetForm} className='btn btn-secondary mt-2'>Cancelar</button>
                                
                            </div>
                        )}
                    </div>
                </div>
                <div className={`modal fade justify-content-center align-items-center ${confirmar ? 'show' : ''}`} style={{ display: confirmar ? 'flex' : 'none' }}>
                    <div className="modal-content w-30">
                        <div className="modal-body">
                            <div className='d-flex flex-column py-5'>
                                <h2 className='fs-1 fw-bold text-primary text-center'>¿Quieres borrar la recompensa?</h2>
                                <div className='d-flex justify-content-between mt-5 pt-5'>
                                <button onClick={() => {
                                handleDeleteRecompensa(borrado)
                                }} className='btn btn-danger-long'>Borrar</button>
                                <button className='btn btn-tertiary-dark' onClick={() => { setConfirmar(!confirmar) }}>Cerrar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}