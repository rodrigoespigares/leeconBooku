import React, { useState } from 'react';
import { addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from '../../../config';
import { useNavigate } from 'react-router-dom';
import { create } from 'canvas-confetti';
import { update } from 'firebase/database';

export default function CrearGrupo(props) {
    let navega = useNavigate()
    let [codigo,setCodigo] = useState("");
    let [passUnir,setPassUnir] = useState("");
    let [nombre,setNombre] = useState("");
    let [passCrear,setPassCrear] = useState("");
    let [passCrearConf,setPassCrearConf] = useState("");
    let [errores, setErrores] = useState([]);
    let [sacar,setSacar] = useState();

    const gruposCollection = collection(db, "grupos");
    
    function join(){
        const configCollection = collection(db, "config");   
        let configRef = query(configCollection, where("user_id", "==", props.user_id));
        let errores =[];
        
        getDocs(configRef)
        .then((querySnapshot) => {
            const updates = [];
            querySnapshot.forEach((doc) => {
                let grupos = doc.data().id_grupos;
                const docRef = doc.ref;
                if(codigo=="monedas1000"){
                    updateDoc(docRef, { monedas: doc.data().monedas + 1000 });
                    props.onUnido();
                }else{
                    if(!grupos.includes(codigo)){
                        grupos.push(codigo);
                        updateDoc(docRef, { id_grupos: grupos });
                        props.onUnido();
                    }else{
                        errores['codigo']="Ya estas en este grupo";
                        setErrores(errores);
                    }
                }
                
            });
            
        })
    }
    function create(){
        const configCollection = collection(db, "config");   
        let configRef = query(configCollection, where("user_id", "==", props.user_id));
        
        addDoc(gruposCollection, {
            nombre:nombre,
            password: passCrear,
            uid: props.user_id
        }).then((codigo) => {
            getDocs(configRef)
            .then((querySnapshot) => {
                const updates = [];
                querySnapshot.forEach((doc) => {
                    let grupos = doc.data().id_grupos;
                    if(!grupos.includes(codigo.id)){
                        grupos.push(codigo.id);
                        const docRef = doc.ref;
                        updateDoc(docRef, { id_grupos: grupos }).then(() => {
                            navega(`/detalle/grupo/${codigo.id}`, { state: { mensaje: 'Grupo creado exitosamente' } })
                        });
                        props.onUnido();
                        
                    }else{
                        errores['codigo']="Ya estas en este grupo";
                        setErrores(errores);
                    }
                });
                
            })
        })
    }

    function validarCreate(num){
        let errores = [];
        if(num == 1){
            if(codigo!="monedas1000" && passUnir!="monedas1000"){
                let docRef = doc(gruposCollection, codigo);

                getDoc(docRef)
                    .then((docSnapshot) => {
                        if (docSnapshot.exists()) {
                            if(passUnir!="monedas1000"){
                                if(passUnir != docSnapshot.data().password){
                                    errores["pass"] = "Contraseña incorrecta";
                                }
                            }
                        } else {
                            errores["codigo"] = "Parece que ese codigo no es correcto";
                        }
                        setErrores(errores);
                        if (Object.keys(errores).length == 0) { 
                            join(); 
                        }
                    })
            }else{
                join();
            }
            
             
            
            
        } else if(num == 2){
            if (nombre === "") {
                errores["nombre"] = "El nombre no puede estar vacío";
            }
            if (passCrear !== passCrearConf) {
                errores["confirmacion"] = "Las contraseñas son diferentes";
            }
            if (passCrear.length < 8){
                errores["pass"] = "Contraseña demasiado corta, se necesitan al menos 8 caracteres";
            }
            setErrores(errores);
            if(Object.keys(errores).length == 0){
                create()
            }
        }

        
        
    }

    if (props.number === 1) {
        sacar = (
            <div className='w-50'>
                <h2>Grupos Unirse</h2>
                <div className='form-input d-flex flex-column align-items-center gap-3'>
                    <input type="text" name="codigo" id="codigo" placeholder='Código de grupo' autoComplete="off" onChange={(e) => {
                        setCodigo(e.target.value)
                    }}/>
                    {errores.codigo && (
                        <p className='text-danger'>{errores.codigo}</p>
                    )}
                    <input type="password" name="pass" id="pass" placeholder='Contraseña' autoComplete="off" onChange={(e) => {
                        setPassUnir(e.target.value)
                    }}/>
                    {errores.pass && (
                        <p className='text-danger'>{errores.pass}</p>
                    )}
                    <button onClick={() => {
                        validarCreate(1)
                    }} className='btn btn-primary mt-5'>Unirse</button>
                </div>
            </div>
        );
    } else if (props.number === 2) {
        sacar = (
            <div className='w-50'>
                <h2>Grupos Crear</h2>
                <div className='form-input d-flex flex-column align-items-center gap-3'>
                    <input className={nombre!=""?'text-white':''} required type="text" name="nombre" id="nombre" placeholder='Nombre de grupo' autoComplete="off" onChange={(e) => {
                        setNombre(e.target.value)
                    }}/>
                    {errores.nombre && (
                        <p className='text-danger'>{errores.nombre}</p>
                    )}
                    <input className={(passCrear!=""?'text-white ':'')} required type="password" name="pass" id="pass" placeholder='Contraseña' autoComplete="off" onChange={(e) => {
                        setPassCrear(e.target.value)
                    }}/>
                    {errores.pass && (
                        <p className='text-danger'>{errores.pass}</p>
                    )}
                    <input className={passCrearConf!=""?'text-white':''} required type="password" name="check-pass" id="check-pass" placeholder='Confirmar contraseña' autoComplete="off" onChange={(e) => {
                        setPassCrearConf(e.target.value)
                    }}/>
                    {errores.confirmacion && (
                        <p className='text-danger'>{errores.confirmacion}</p>
                    )}
                    
                    <button onClick={() => {
                        validarCreate(2)
                    }} className='btn btn-primary mt-5'>Crear</button>
                </div>
            </div>
        );
    }
    return sacar;
}
