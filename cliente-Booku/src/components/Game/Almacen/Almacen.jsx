import React from 'react'
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../../../config';

export default function Almacen(props) {
    const almacenCollection = collection(db, "almacen");
    const juegoCollection = collection(db, "juego");
    
    function tomar(producto){
        let docRef = doc(almacenCollection, props.config.user_id);
        let juegoRef = doc(juegoCollection, props.config.user_id);
        getDoc(docRef)
            .then((docSnapshot) => {
                let almacenData = docSnapshot.data();
                let productoNombre = producto.producto.nombre;
                if (almacenData[productoNombre]) {
                    almacenData[productoNombre].cantidad -= 1;
                    if (almacenData[productoNombre].cantidad === 0) {
                        delete almacenData[productoNombre];
                    }
                    setDoc(docRef, almacenData).then(() => {
                        props.onTomarProducto();
                    });

                    getDoc(juegoRef)
                        .then((docSnapshot) => {
                            let juegoData = docSnapshot.data();
                            if(juegoData.estado.comida + producto.producto.comida <=100){
                                juegoData.estado.comida += producto.producto.comida
                            }else if(juegoData.estado.comida + producto.producto.comida >100){
                                juegoData.estado.comida = 100
                            }
                            if(juegoData.estado.vida + producto.producto.vida <=100){
                                juegoData.estado.vida += producto.producto.vida
                            }else if(juegoData.estado.vida + producto.producto.vida >100){
                                juegoData.estado.vida = 100
                            }else if(juegoData.estado.vida + producto.producto.vida <= 0){
                                juegoData.estado.vida = 0
                            }
                            updateDoc(juegoRef,juegoData).then(() => {
                                props.onActualizarEstado();
                            });
                            
                        })
                }
            });
        
    }

  return (
    <div className='d-flex flex-wrap w-100 justify-content-center align-items-end gap-5'>
        {Object.entries(props.almacen).length>0? Object.entries(props.almacen).map(([nombre, detalle]) => (
                <div className='d-flex flex-column align-items-center' key={nombre}>
                    <img src={detalle.producto.foto} alt={nombre} style={{ width: '100px' }} />
                    <div className='d-flex w-100 justify-content-evenly align-items-center'>
                        <span className='fs-3'>❤️ {detalle.producto.vida}</span>
                        <span className='fs-3'>🍎 {detalle.producto.comida}</span>
                    </div>
                    <h2>{detalle.producto.nombre} x{detalle.cantidad}</h2>
                    <button onClick={() => {
                        tomar(detalle);
                    }} className='btn btn-primary'>Tomar</button>
                </div>
            ))
            :
            (
                <h2 className='display-2 pt-5 mt-4'>Parece que aun no tienes productos</h2>
            )}
    </div>
  )
}
