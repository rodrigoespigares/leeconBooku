import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import CrearExamen from './CrearExamen/CrearExamen';
import HacerExamen from './HacerExamen/HacerExamen';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

export default function Examen() {
    let [usuario, setUsuario] = useState("");
    let { check, id } = useParams();
    
    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            setUsuario(user);
        });


    }, []);
  
    if(check=="editar" || check=="crear"){
        return <CrearExamen check={check} usuario={usuario} accion={check} idGrupo={id}/>
    }else{
        return <HacerExamen idGrupo={id} usuario={usuario}/>
    }
}
