import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useEffect, useState } from 'react'


export default function EditUserModal({ show, user, onSave, onClose }) {
    const [userName, setUserName] = useState(user?.user_name || '');
    const [status, setStatus] = useState(user?.status || 1);
    const [permisos, setPermisos] = useState(user?.permisos || 0);

    useEffect(() => {
        if (user) {
            setUserName(user.user_name);
            setStatus(user.status);
            setPermisos(user.permisos);
        }
    }, [user]);

    const handleSave = () => {
        onSave({
            ...user,
            user_name: userName,
            status,
            permisos
        });
    };

    return (
        <div
            className={`modal fade justify-content-center align-items-baseline align-items-md-center ${show ? 'show' : ''}`}
            style={{ display: show ? 'flex' : 'none' }}
            onClick={onClose}
        >
            <div className="modal-content w-50" onClick={e => e.stopPropagation()}>
                <div className="modal-body">
                    <div>
                        <button onClick={onClose} type="button" className="btn position-absolute top-0 end-0">
                            <Icon className='display-1' icon="material-symbols:close-rounded" />
                        </button>
                    </div>
                    <div className='d-flex flex-column align-items-center py-5'>
                        <h2 className='text-uppercase display-2 fw-bold text-primary text-center'>Editar Usuario</h2>
                        <div className='w-100'>
                            <div className="form-input">
                                <label>Nombre</label>
                                <input
                                    type="text"
                                    value={userName}
                                    onChange={e => setUserName(e.target.value)}
                                />
                            </div>
                            <div className="form-input">
                                <label>Estado</label>
                                <select value={status} onChange={e => setStatus(Number(e.target.value))}>
                                    <option value={1}>Activo</option>
                                    <option value={0}>Bloqueado</option>
                                </select>
                            </div>
                            <div className="form-input">
                                <label>Rango</label>
                                <select value={permisos} onChange={e => setPermisos(Number(e.target.value))}>
                                    <option value={0}>Usuario</option>
                                    <option value={2}>Profesor</option>
                                    <option value={3}>Escritor</option>
                                    <option value={5}>Administrador</option>
                                </select>
                            </div>
                        </div>
                        <button onClick={handleSave} className="btn btn-primary mt-3">Guardar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
