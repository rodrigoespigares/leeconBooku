import React, { useState } from 'react'

import { Link } from 'react-router-dom';
import {
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    FacebookAuthProvider

} from "firebase/auth";
import { auth } from '../../config';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom'
import { collection, addDoc, query, where, getDocs, doc, setDoc} from "firebase/firestore"; 
import { db } from '../../config';

export default function Login() {
    const [emailInicio, setEmailInicio] = useState("");
    const [passInicio, setPassInicio] = useState("");
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
                        status: 1,
                        recompensa_n: 0,
                        id_grupos: [],
                        id_retos: [],
                        last_recompensa: new Date(),
                        monedas: 1000
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
    function inicioCorreo() {
        signInWithEmailAndPassword(auth, emailInicio, passInicio)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                // ...
                generaConfig(user.uid, user.email, "https://firebasestorage.googleapis.com/v0/b/lee-con-booku.appspot.com/o/fotos%2Fperfil-de-usuario-google-chrome-vacio-1654188725.jpg?alt=media&token=474869b1-c5ce-42a5-9ecb-a8508deed293")
                navega('/home');
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                if (errorCode == "auth/missing-email") {
                    document.getElementById("inicioMail").classList.add("err");
                    setErrores([ "No tiene ninguna cuenta asociada"])
                }
                if (errorCode == "auth/invalid-email") {
                    document.getElementById("inicioMail").classList.add("err");
                    setErrores([ "No tiene ninguna cuenta asociada"])
                }
                if (errorCode == "auth/invalid-credential") {
                    document.getElementById("inicioMail").classList.add("err");
                    document.getElementById("inicioPass").classList.add("err");
                    setErrores([ "Error en el inicio de sesión"])
                }
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
                <Link to="/registro" className='d-md-none btn btn-primary-superior'> REGISTRATE</Link>
                <Link to="/"><button className="login-close btn"><Icon icon="iconamoon:close-bold" /></button></Link>
                
            </div>
            <h2 className='display-2'>Inicia Sesión</h2>
            <section className='login-form'>
                <div className='form-input my-4'>
                    <input type="text" name="user" id="inicioMail" placeholder='Usuario' onChange={(e) => {
                                
                                setEmailInicio(e.target.value);
                                document.getElementById("inicioMail").classList.remove("err")
                            }}/>
                </div>
                <div className='form-input my-4'>
                    <input type="password" name="password" id="inicioPass" placeholder='Contraseña' onChange={(e) => {
                                setPassInicio(e.target.value);
                                document.getElementById("inicioPass").classList.remove("err")
                            }}/>
                </div>
                <button className='btn btn-primary' onClick={inicioCorreo}>ENTRAR</button>
                
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
                <h4>¿Aún no tienes cuenta? <Link to="/registro">REGISTRATE</Link></h4>
            </section>
        </div>
    )
}
