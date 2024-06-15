import React, { useState } from 'react'
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../../../config';

export default function Tienda(props) {
    let [errores, setErrores] = useState([]);
    const almacenCollection = collection(db, "almacen");


    function comprar(producto){
        let errores = []
        if(props.monedas - producto.precio >= 0){
            let docRef = doc(almacenCollection, props.user_id);
            let configCollection = collection(db, "config");
            let queryConfig = query(configCollection, where("user_id", "==", props.user_id));

            getDoc(docRef)
                .then((docSnapshot) => {
                    if (!docSnapshot.exists()) {
                    
                        setDoc(docRef, {
                            [producto.nombre] : {
                                producto: producto,
                                cantidad: 1
                            }
                        });
                    } else {
                        if (docSnapshot.data() && docSnapshot.data()[producto.nombre]) {
                            let almacenData = docSnapshot.data();
                            almacenData[producto.nombre].cantidad += 1;
                            updateDoc(docRef, almacenData);
                        } else {
                            let almacenData = docSnapshot.data();
                            almacenData[producto.nombre] = {
                                producto: producto,
                                cantidad: 1
                            }
                            setDoc(docRef, almacenData);
                        }
                    }
                    getDocs(queryConfig)
                        .then((querySnapshot) => {
                            querySnapshot.forEach((doc) => {
                                updateDoc(doc.ref, {
                                    monedas: props.monedas - producto.precio
                                }).then(() => {
                                    const nuevaConfiguracion = { ...props.config, monedas: props.monedas - producto.precio };
                                    props.actualizarConfiguracion(nuevaConfiguracion);
                                });
                            });
                        })
                })

            // HACER AQUI LA LLAMADA A FUERA
            setErrores(errores)
        }else{
            errores["comprar"] = "¡Te faltan monedas!";
            setErrores(errores);
        }
    }
    return (
        <>
            {props.tienda && (
                <>
                    <p className='text-danger fs-1'>{errores.comprar}</p>
                    <div className='d-flex flex-wrap justify-content-center align-items-end gap-5'>
                        {props.tienda.map((producto) => (
                        <div className='d-flex flex-column align-items-center' key={producto.nombre}>
                            
                            
                            
                            <img src={producto.foto} alt={producto.nombre} style={{ width: '100px' }} />
                            <div className='d-flex w-100 justify-content-evenly align-items-center'>
                                <span className='fs-3'>❤️ {producto.vida}</span>
                                <span className='fs-3'>🍎 {producto.comida}</span>
                            </div>
                            <h2>{producto.nombre}</h2>
                            <p className='fs-1'>{producto.precio}🪙</p>
                            <button onClick={() => {
                                comprar(producto)
                            }} className='btn btn-primary'>Comprar</button>
                        </div>
                        ))}
                        
                    </div>
                    
                </>
            )}
        </>
    )
}
