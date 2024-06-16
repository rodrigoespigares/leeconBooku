import React, { useEffect, useState } from 'react'
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from '../../../config';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function Configuracion(props) {
    let [n_booku, setN_booku] = useState("");
    let [nombre, setNombre] = useState("");
    let [foto, setFoto] = useState("");
    

    useEffect(() => {
        if (props.juego && props.juego.nombre) {
            setN_booku(props.juego.nombre);
        }
    }, [props.juego]);
    useEffect(() => {
        if (props.config && nombre == "") {
            setNombre(props.config.user_name || '');
            setFoto(props.config.foto || '');
        }
    }, [props.config]);
    function n_bookuChange (e){
        setN_booku(e.target.value);
    };
    function nombreChange (e){
        setNombre(e.target.value);
    };
    function fileChange(e){
        const file = e.target.files[0];
        if (!file) return;

        const storage = getStorage();
        const storageRef = ref(storage, 'fotos/' + file.name);


        uploadBytes(storageRef, file)
            .then(() => {
                return getDownloadURL(storageRef);
            })
            .then((url) => {
                setFoto(url); 
            });
    };
    function guardar(){
        if (props.config.status == 2) {
            let configCollection = collection(db, 'config');
            let configQuery = query(configCollection, where("user_id", "==", props.config.user_id));
            getDocs(configQuery)
                .then((querySnapshot) => {
                    querySnapshot.docs.map((docSnapshot) => {
                        let docRef = doc(db, 'config', docSnapshot.id);
                        return updateDoc(docRef, { status: 1 }).then(() => {
                            props.onGuardado()
                        });
                    });
                })
        }
        if(n_booku != props.juego.nombre){
            let juegoDoc = doc(db, 'juego', props.config.user_id);
            updateDoc(juegoDoc, { nombre: n_booku }).then(() => {
                props.onGuardado()
            });
        }
        if(nombre != props.config.user_name){
            let configCollection = collection(db, 'config');
            let configQuery = query(configCollection, where("user_id", "==", props.config.user_id));
            getDocs(configQuery)
                .then((querySnapshot) => {
                    querySnapshot.docs.map((docSnapshot) => {
                        let docRef = doc(db, 'config', docSnapshot.id);
                        return updateDoc(docRef, { user_name: nombre }).then(() => {
                            props.onGuardado()
                        });
                    });
                })
        }
        if(foto != props.config.foto){
            let configCollection = collection(db, 'config');
            let configQuery = query(configCollection, where("user_id", "==", props.config.user_id));
            getDocs(configQuery)
                .then((querySnapshot) => {
                    querySnapshot.docs.map((docSnapshot) => {
                        let docRef = doc(db, 'config', docSnapshot.id);
                        return updateDoc(docRef, { foto : foto }).then(() => {
                            props.onGuardado()
                        });
                    });
                })
        }

        
    }
    

    return (
        <div className='d-flex flex-column w-50 gap-5'>
            <div className='form-input'>
                <label htmlFor="nombre">Nombre de usuario</label>
                <input className='text-white' type="text" name='nombre' id='nombre' placeholder='Nombre de usuario' value={nombre} onChange={nombreChange}/>
            </div>
            <div className='form-input d-flex gap-3 align-items-center'>
                <label htmlFor="foto">Foto de perfil</label>
                <img className='config--foto' src={foto} alt={'Foto de ' + props.config.nombre} />
                <input type="file" name="foto" id="foto" onChange={fileChange}/>
            </div>
            {props.juego && (
                <div className='form-input'>
                    <label htmlFor="n_booku">Nombre de booku</label>
                    <input className='text-white' type="text" name='n_booku' id='n_booku' placeholder='Nombre de booku' value={n_booku} onChange={n_bookuChange} />
                </div>
            )}
            <button onClick={guardar} className='btn btn-primary'>Guardar</button>
        </div>
    )
}
