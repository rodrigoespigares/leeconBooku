import { Icon } from '@iconify/react';
import { collection, getDocs, query, updateDoc, where, doc } from 'firebase/firestore'; // Ensure `doc` is imported
import React, { useState, useEffect } from 'react';
import { db } from '../../../config';
import DataTable from 'react-data-table-component';
import EditUserModal from './EditUserModal/EditUserModal';

export default function Usuarios(props) {
    const [verModal, setVerModal] = useState(false);
    const [usuarios, setUsuarios] = useState([]);
    const [filterText, setFilterText] = useState('');
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        setVerModal(props.modal);
        const fetchData = async () => {
            const querySnapshot = await getDocs(collection(db, 'config'));
            const documentos = [];
            querySnapshot.forEach(doc => {
                documentos.push({ id: doc.id, ...doc.data() });
            });
            setUsuarios(documentos);
        };
        fetchData();
    }, [props.modal]);

    function ocultar() {
        setVerModal(!verModal);
        props.onOcultar();
    }

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setEditModalVisible(true);
    };

    function handleSaveUser(user) {
        updateDoc(doc(db, "config", user.id), user)
            .then(() => {
                setUsuarios((usuarios) => usuarios.map(u => (u.id === user.id ? user : u)));
                setEditModalVisible(false);
                props.onMensaje("Usuario actualizado!");
            })
            .catch((error) => {
                console.error("Error updating documents: ", error);
            });
    }

    const permisos = {
        0: "Usuario",
        2: "Profesor",
        3: "Escritor",
        5: "Administrador",
    };

    const filteredData = usuarios
        .filter(usuario =>
            usuario.user_name.toLowerCase().includes(filterText.toLowerCase()) ||
            (usuario.status === 1 ? "Activo" : "Bloqueado").toLowerCase().includes(filterText.toLowerCase()) ||
            permisos[usuario.permisos].toLowerCase().includes(filterText.toLowerCase())
        )
        .map(usuario => ({
            ...usuario,
            nombre: usuario.user_name,
            estado: usuario.status === 1 ? "Activo" : "Bloqueado",
            rango: permisos[usuario.permisos],
            acciones: <button className='btn' onClick={() => handleEditClick(usuario)}><Icon className='fs-1 text-primary' icon="majesticons:edit-pen-2" /></button>
        }));

    const columns = [
        {
            name: "Nombre",
            selector: row => row.nombre,
            sortable: true,
        },
        {
            name: "Estado",
            selector: row => row.estado,
            sortable: true,
        },
        {
            name: "Rango",
            selector: row => row.rango,
            sortable: true,
        },
        {
            name: "Acciones",
            selector: row => row.acciones,
            sortable: false,
            width: "20rem",
        }
    ];

    return (
        <div
            className={`modal fade justify-content-center align-items-baseline align-items-md-center ${verModal ? 'show' : ''}`}
            style={{ display: verModal ? 'flex' : 'none' }}
            onClick={ocultar}
        >
            <div className="grupos modal-content w-75" onClick={e => e.stopPropagation()}>
                <div className="modal-body">
                    <div>
                        <button onClick={ocultar} type="button" className="btn position-absolute top-0 end-0">
                            <Icon className='display-1' icon="material-symbols:close-rounded" />
                        </button>
                    </div>
                    <div className='d-flex flex-column align-items-center py-5 admin__usuarios'>
                        <h2 className='text-uppercase text-center'>Gestionar Usuarios</h2>

                        <DataTable
                            columns={columns}
                            data={filteredData}
                            pagination
                            className="table-responsive"
                            subHeader
                            noDataComponent="No hay usuarios para mostrar"
                            subHeaderComponent={
                                <div className='w-md-25'>
                                    <input
                                        type="text"
                                        placeholder="Buscar..."
                                        className="form-search w-100"
                                        value={filterText}
                                        onChange={e => setFilterText(e.target.value)}
                                    />
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
                <EditUserModal
                    show={editModalVisible}
                    user={selectedUser}
                    onSave={handleSaveUser}
                    onClose={() => setEditModalVisible(false)}
                />
            )}
        </div>
    );
}