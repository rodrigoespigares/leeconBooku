import { Icon } from '@iconify/react';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { db } from '../../../config';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function Juego(props) {
    const [verModal, setVerModal] = useState(false);
    const [productos, setProductos] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    let [confirmar, setConfirmar] = useState(false);
    let [borrado, setBorrado] = useState(0)
    const [currentProduct, setCurrentProduct] = useState({
        id: '',
        nombre: '',
        foto: '',
        vida: '',
        comida: '',
        precio: ''
    });

    useEffect(() => {
        setVerModal(props.modal);
        const fetchData = () => {
            getDocs(collection(db, "tienda"))
                .then((querySnapshot) => {
                    let productos = [];
                    querySnapshot.forEach((doc) => {
                        productos.push({ ...doc.data(), id: doc.id });
                    });
                    setProductos(productos);
                })
                .catch((error) => {
                    console.error("Error fetching documents: ", error);
                });
        };

        fetchData();
    }, [props.modal]);

    function ocultar() {
        setVerModal(!verModal);
        props.onOcultar();
    };

    function fileChange(e){
        const file = e.target.files[0];
        if (!file) return;

        const storage = getStorage();
        const storageRef = ref(storage, '/' + file.name);


        uploadBytes(storageRef, file)
            .then(() => {
                return getDownloadURL(storageRef);
            })
            .then((url) => {
                setCurrentProduct(prevProduct => ({ ...prevProduct, foto: url }));
            });
    };

    function handleInputChange(e) {
        const { name, value } = e.target;
        let parsedValue = value;


        if ((name === "comida" || name === "vida") && !isNaN(value)) {
            parsedValue = parseFloat(value);
        }

        setCurrentProduct({ ...currentProduct, [name]: parsedValue });
    };

    const handleAddProduct = () => {
        addDoc(collection(db, "tienda"), currentProduct)
            .then((docRef) => {
                setProductos([...productos, { ...currentProduct, id: docRef.id }]);
                resetForm();
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
            });
    };

    const handleEditProduct = (product) => {
        setCurrentProduct(product);
        setShowForm(true);
        setIsEditing(true);
    };

    const handleUpdateProduct = () => {
        const productRef = doc(db, "tienda", currentProduct.id);
        updateDoc(productRef, currentProduct)
            .then(() => {
                setProductos(productos.map(product =>
                    product.id === currentProduct.id ? currentProduct : product
                ));
                resetForm();
                props.onMensaje("Producto actualizado!");
            })
            .catch((error) => {
                console.error("Error updating document: ", error);
            });
    };

    const handleDeleteProduct = (productId) => {
        const productRef = doc(db, "tienda", productId);
        deleteDoc(productRef)
            .then(() => {
                setProductos(productos.filter(product => product.id !== productId));
                setConfirmar(!confirmar)
                props.onMensaje("Producto borrado!");
            })
            .catch((error) => {
                console.error("Error deleting document: ", error);
            });
    };

    const resetForm = () => {
        setCurrentProduct({
            id: '',
            nombre: '',
            foto: '',
            vida: '',
            comida: '',
            precio: ''
        });
        setShowForm(false);
        setIsEditing(false);
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
                        <h2 className='text-uppercase'>Tienda Booku</h2>
                        <div className='d-flex align-items-center gap-5 flex-wrap w-100 px-5'>
                            <div className='d-flex flex-wrap justify-content-center align-items-end gap-5'>
                                {productos && productos.map((producto) => (
                                    <div className='d-flex flex-column align-items-center' key={producto.id}>
                                        <img src={producto.foto} alt={producto.nombre} style={{ width: '100px' }} />
                                        <div className='d-flex w-100 justify-content-evenly align-items-center'>
                                            <span className='fs-3'>❤️ {producto.vida}</span>
                                            <span className='fs-3'>🍎 {producto.comida}</span>
                                        </div>
                                        <h2>{producto.nombre}</h2>
                                        <p className='fs-1'>{producto.precio}🪙</p>
                                        <div className='d-flex gap-2'>
                                            <button className='btn btn-primary' onClick={() => handleEditProduct(producto)}>Editar</button>
                                            <button className='btn btn-danger-long' onClick={() => { setBorrado(producto.id); setConfirmar(!confirmar) }}>Eliminar</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* BOTÓN DE AÑADIR */}
                            <button className='btn text-primary ms-5' onClick={() => setShowForm(true)}>
                                <Icon className='display-1' icon="material-symbols:add-circle-outline" />
                            </button>
                        </div>
                        {showForm && (
                            <div className='d-flex flex-column align-items-center mt-5 w-100'>
                                <h3 className='fs-1 fw-bold text-primary'>{isEditing ? "Editar Producto" : "Nuevo Producto"}</h3>
                                <div className='d-flex flex-column  align-items-center gap-3'>
                                    <div className='w-md-50 d-flex flex-column gap-3 mb-4'>
                                        <div className="form-input">
                                            <label htmlFor="nombre">Nombre del alimento</label>
                                            <input
                                                type="text"
                                                placeholder="Nombre"
                                                name="nombre"
                                                id='nombre'
                                                value={currentProduct.nombre}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-input">
                                            <label htmlFor="foto">Foto del alimento</label>
                                            <input type="file" name="foto" id="foto" onChange={fileChange}/>
                                        </div>
                                        <div className="form-input">
                                            <label htmlFor="vida">Vida del alimento</label>
                                            <input
                                                type="number"
                                                placeholder="Vida"
                                                name="vida"
                                                id='vida'
                                                value={currentProduct.vida}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-input">
                                            <label htmlFor="comida">Comida del alimento</label>
                                            <input
                                                type="number"
                                                placeholder="Comida"
                                                name="comida"
                                                id='comida'
                                                value={currentProduct.comida}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-input">
                                            <label htmlFor="precio">Precio del alimento</label>
                                            <input
                                                type="number"
                                                placeholder="Precio"
                                                name="precio"
                                                id='precio'
                                                value={currentProduct.precio}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <div className='d-flex gap-3'>
                                        <button className='btn btn-success-long' onClick={isEditing ? handleUpdateProduct : handleAddProduct}>
                                            {isEditing ? "Guardar Cambios" : "Añadir Producto"}
                                        </button>
                                        <button className='btn btn-secondary' onClick={resetForm}>Cancelar</button>
                                    </div>
                                </div>
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
                                        handleDeleteProduct(borrado)
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