import { Icon } from '@iconify/react';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { db } from '../../../config';
import DataTable from 'react-data-table-component';
import EditGrupoModal from './EditGrupoModal/EditGrupoModal';

export default function Reto(props) {
    const [verModal, setVerModal] = useState(false);
    const [grupos, setGrupos] = useState([]);
    const [filterText, setFilterText] = useState('');
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedGrupo, setSelectedGrupo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (props.modal) {
            setVerModal(props.modal);

            if(grupos.length==0){
                cargaGrupos();
            }
        }
    }, [props.modal]);

    useEffect(() => {
        if (!loading) {
            const fetchRetoNames = () => {
                const fetchPromises = grupos.map(grupo => {
                    if (grupo.reto_id) {
                        return fetch(`https://api-booku.vercel.app/reto/show/${grupo.reto_id.id}`, {
                            method: 'GET',
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": "Bearer " + props.usuario.accessToken
                            },
                        })
                            .then(response => response.json())
                            .then(data => ({ ...grupo, nombreReto: data.data?.nombre || 'Sin nombre' }))
                            .catch(error => ({ ...grupo, nombreReto: 'Error al cargar' }));
                    } else {
                        return Promise.resolve({ ...grupo, nombreReto: 'Sin reto' });
                    }
                });

                Promise.all(fetchPromises)
                    .then(updatedGrupos => setGrupos(updatedGrupos))
                    .catch(error => console.error('Error fetching reto names:', error));
            };

            fetchRetoNames();
        }
    }, [loading]);

    function cargaGrupos(){
        getDocs(collection(db, 'grupos')).then(querySnapshot => {
            const documentos = [];
            querySnapshot.forEach(doc => {
                documentos.push({ id: doc.id, ...doc.data() });
            });
            setGrupos(documentos);
            setLoading(false);
        }).catch(error => {
            console.error('Error fetching grupos:', error);
            setLoading(false);
        });
    }
    function handleEditClick(grupo) {
        setSelectedGrupo(grupo);
        setEditModalVisible(true);
    }

    function handleSaveGrupo(grupo) {
        updateDoc(doc(db, "grupos",grupo.id), grupo).then(() => {
          cargaGrupos();
          setVerModal(!verModal);
          props.onMensaje("Grupo actualizado!");
        })
    }

    function ocultar() {
        setVerModal(!verModal);
        props.onOcultar();
    }

    const filteredData = grupos.filter(grupo =>
        grupo.nombre.toLowerCase().includes(filterText.toLowerCase())
    )
        .map(grupo => ({
            ...grupo,
            nombreGrupo: grupo.nombre,
            codigoGrupo: grupo.id,
            acciones: <button className='btn' onClick={() => handleEditClick(grupo)}><Icon className='fs-1 text-primary' icon="majesticons:edit-pen-2" /></button>
        }));

    const columns = [
        {
            name: "Nombre del Grupo",
            selector: row => row.nombreGrupo,
            sortable: true,
        },
        {
            name: "Código del Grupo",
            selector: row => row.codigoGrupo,
            sortable: true,
        },
        {
            name: "Nombre de reto",
            selector: row => row.nombreReto || 'Cargando...',
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
                        <h2 className='text-uppercase text-center'>Gestionar Grupos</h2>

                        <DataTable
                            columns={columns}
                            data={filteredData}
                            pagination
                            className="table-responsive"
                            subHeader
                            noDataComponent="No hay retos para mostrar"
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
                <EditGrupoModal
                    show={editModalVisible}
                    grupo={selectedGrupo}
                    onSave={handleSaveGrupo}
                    onClose={() => setEditModalVisible(false)}
                />
            )}
        </div>
    );
}