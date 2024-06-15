import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useEffect, useState } from 'react';

export default function EditGrupoModal({ show, grupo, onSave, onClose }) {
    const [nombre, setNombre] = useState(grupo?.nombre || '');


    const [errores, setError] = useState([]);

    useEffect(() => {
        if (grupo) {
            setNombre(grupo.nombre);
        }
    }, [grupo]);

    const handleSave = () => {

        const data = {
            ...grupo,
            nombre: nombre
        };

        onSave(data);
    };

    function onCerrar(){
        onClose();
    }

    return (
        <div
            className={`modal fade justify-content-center align-items-baseline align-items-md-center ${show ? 'show' : ''}`}
            style={{ display: show ? 'flex' : 'none' }}
            onClick={onCerrar}
        >
            <div className="modal-content w-50" onClick={e => e.stopPropagation()}>
                <div className="modal-body">
                    <div>
                        <button onClick={onCerrar} type="button" className="btn position-absolute top-0 end-0">
                            <Icon className='display-1' icon="material-symbols:close-rounded" />
                        </button>
                    </div>
                    <div className='d-flex flex-column align-items-center py-5'>
                        <h2 className='text-uppercase display-2 fw-bold text-primary text-center'>Editar Grupo</h2>
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
                            <button onClick={handleSave} className="btn btn-primary mt-3">Guardar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}