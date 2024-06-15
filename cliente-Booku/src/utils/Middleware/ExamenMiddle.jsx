import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config';
import { Navigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../config.js';
import Loading from '../../components/Loading/Loading.jsx';

export default function ExamenMiddle({ Component }) {
    let [isAuth, setIsAuth] = useState(false);
    let [isLoading, setIsLoading] = useState(true);
    let [contrasena, setContrasena] =useState("")
    let [input, setInput] = useState("");
    let [isPass, setPass] = useState(false)
    let { check, id } = useParams();
    let [error, setError] = useState("");

    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            if (!user) {
                setIsAuth(false);
                setIsLoading(false);
                return;
            }
            let grupoDataRef = doc(db, 'grupos', id);
            getDoc(grupoDataRef)
                .then((docSnapshot) => {
                    if (docSnapshot.exists()) {
                        fetch('https://api-booku.vercel.app/examenes/show/' + docSnapshot.data().examen_id,{
                            method: 'GET',
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": "Bearer "+user.accessToken
                            },
                        })
                            .then((response) => response.json())
                            .then((data) => {
                                const examData = data.data;
                                
                                setContrasena(examData.contrasena);
                                setIsLoading(false)

                            });
                    }
                });
            
        });
    }, [check, id]);

    function checkPass(){
        if(input == contrasena){
            setPass(true)
            setError("")
        }else{
            setError("Contraseña incorrecta")
        }
    }

    if (isLoading) {
        return <Loading />;
    }

    return isPass ? <Component /> : (
        <div className='h-100 w-100 d-flex flex-column align-items-center justify-content-center gap-3'>
            <div className='w-md-50'>
                <div className='form-input'>
                    <label htmlFor="pass">Contraseña del examen</label>
                    <input className='text-center' type="password" onChange={(e) => {
                        setInput(e.target.value)
                    }} onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            checkPass();
                        }
                    }}/>
                </div>
            </div>
            {error && (<p className='fs-1 text-danger'>{error}</p>)}
            <button className='btn btn-primary' onClick={checkPass}>Enviar</button>
        </div>
    );
}