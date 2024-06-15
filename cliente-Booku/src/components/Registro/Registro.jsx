import React, { useState } from 'react'

import { Link } from 'react-router-dom';
import {
    GoogleAuthProvider,
    signInWithPopup,
    FacebookAuthProvider,
    createUserWithEmailAndPassword

} from "firebase/auth";

import { collection, addDoc, query, where, getDocs, setDoc, doc} from "firebase/firestore"; 
import { db } from '../../config';
import { auth } from '../../config';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom'

export default function Registro() {
    const [emailRegistro, setEmailregistro] = useState("");
    const [passRegistro, setPassRegistro] = useState("");
    const [passRegistroConf, setPassRegistroConf] = useState("");
    let [errores, setErrores] = useState([]);

    let navega = useNavigate();

    function generaConfig(uid,userName, foto){
        const configCollection = collection(db, "config");
        const friendCollection = collection(db, "amigos");
        const almacenCollection = collection(db, "almacen");
        const userQuery = query(configCollection, where("user_id", "==", uid));
        let creaAmigos = false;

        getDocs(userQuery)
            .then((querySnapshot) => {
                if (querySnapshot.size == 0) {
                    creaAmigos = true;
                    return addDoc(configCollection, {
                        actual:[],
                        historial: [],
                        user_id: uid,
                        user_name: userName,
                        permisos: 0,
                        foto:foto,
                        status: 2,
                        recompensa_n: 0,
                        id_grupos: [],
                        id_retos: [],
                        last_recompensa: new Date(),
                        monedas: 1000
                    }).then(() => {
                        navega('/home');
                    });
                }
                return Promise.resolve();
            }).then(() => {
                if(creaAmigos){
                    const docRef = doc(friendCollection, uid);
                    return setDoc(docRef, {
                        amigos: [],
                        pendientes: [],
                        solicitudes: [],
                    }).then(() => {
                        const docRef = doc(almacenCollection, uid);
                        return setDoc(docRef, {
                        })
                    });
                }else{
                    return "";
                }
            })
    }

    function registroCorreo() {
        setErrores([])
        try {
            if (passRegistro != passRegistroConf) {
                
                throw new Error("Las contraseñas no coinciden");
            }


            createUserWithEmailAndPassword(auth, emailRegistro, passRegistro)
                .then((userCredential) => {
                    // Signed up 
                    const user = userCredential.user;
                    // ...
                    generaConfig(user.uid, user.email, "https://firebasestorage.googleapis.com/v0/b/lee-con-booku.appspot.com/o/fotos%2Fperfil-de-usuario-google-chrome-vacio-1654188725.jpg?alt=media&token=474869b1-c5ce-42a5-9ecb-a8508deed293")
                    
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;

                    if (errorCode == "auth/weak-password") {
                        document.getElementById("registroPass").classList.add("err");
                        setErrores(["La contraseña necesita más caracteres"])
                    }
                    if (errorCode == "auth/invalid-email") {
                        document.getElementById("registroMail").classList.add("err");
                        setErrores(["Este email no puede ser usado"])
                    }
                    if (errorCode == "auth/email-already-in-use") {
                        document.getElementById("registroMail").classList.add("err");
                        setErrores(["Este email ya esta registrado"])
                    }
                });
        }catch(error){
            setErrores(["Las contraseñas no coinciden"])
        }
        
    }
    function iniciaSesionGoogle() {
        setErrores([])
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then((result) => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;
                // The signed-in user info.
                const user = result.user;
                // IdP data available using getAdditionalUserInfo(result)
                // ...
                generaConfig(user.uid, user.email, user.photoURL)
                navega('/home');
            })
            .catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                const email = error.customData.email;
                // The AuthCredential type that was used.
                const credential = GoogleAuthProvider.credentialFromError(error);
                // ...

                setErrores([...errores, errorMessage])
            });
    }

    function iniciaSesionFacebook() {
        setErrores([])
        const provider = new FacebookAuthProvider();
        signInWithPopup(auth, provider)
            .then((result) => {
                // The signed-in user info.
                const user = result.user;

                // This gives you a Facebook Access Token. You can use it to access the Facebook API.
                const credential = FacebookAuthProvider.credentialFromResult(result);
                const accessToken = credential.accessToken;

                // IdP data available using getAdditionalUserInfo(result)
                // ...
                generaConfig(user.uid, user.email, user.photoURL)
                navega('/home');
            })
            .catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                const email = error.customData.email;
                // The AuthCredential type that was used.
                const credential = FacebookAuthProvider.credentialFromError(error);
                setErrores([...errores, errorMessage])
                // ...
            });
    }
    return (
        <div id='login'>
            <div className='d-flex justify-content-between justify-content-md-end align-items-center position-absolute top-0 start-0 w-100 py-2 px-4'>
                <Link to="/inicio-sesion" className='d-md-none btn btn-primary-superior'> INICIO SESIÓN</Link>
                <Link to="/"><button className="login-close btn"><Icon icon="iconamoon:close-bold" /></button></Link>
            </div>
            <h2 className='display-2 mt-5'>Registrate</h2>
            <section className='login-form'>
                <div className='form-input my-4'>
                    <input type="text" name="user" id="registroMail" placeholder='Email' onChange={(e) => {

                        setEmailregistro(e.target.value);
                        document.getElementById("registroMail").classList.remove("err")
                    }} />
                </div>
                <div className='form-input my-4'>
                    <input type="password" name="password" id="registroPass" placeholder='Contraseña' onChange={(e) => {
                        setPassRegistro(e.target.value);
                        document.getElementById("registroPass").classList.remove("err")
                    }} />
                </div>
                <div className="form-input my-4">
                    <input type="password" name="password" id="registroPass" placeholder='Confirma contraseña' onChange={(e) => {
                        setPassRegistroConf(e.target.value);
                        document.getElementById("registroPass").classList.remove("err")
                    }} />
                </div>
                <button className='btn btn-primary' onClick={registroCorreo}>DAR DE ALTA</button>

                <section className='text-danger login-err'>
                    {errores.map((error, index) => (
                        <p className='text-center' key={index}>{error}</p>
                    ))}

                </section>

            </section>
            <section className="login-bottom my-5">
                <p className='login-bottom--text d-flex align-items-center'><div className='line mx-3'></div> O <div className='line mx-3'></div></p>
                <div className='login-bottom--buttons my-3'>
                    <button className='btn btn-primary' onClick={iniciaSesionFacebook}><Icon icon="gg:facebook" /> FACEBOOK</button>
                    <button className='btn btn-primary' onClick={iniciaSesionGoogle}><Icon icon="gg:google" /> GOOGLE</button>
                </div>
                <p className='text-center'>Al registrarte en Booku, aceptas nuestros Términos y Política de privacidad.</p>
            </section>
            <section className='login-extra d-none d-md-flex flex-column'>
                <h4>¿Ya tienes cuenta? <Link to="/inicio-sesion">INICIA SESIÓN</Link></h4>
            </section>
        </div>
    )
}
