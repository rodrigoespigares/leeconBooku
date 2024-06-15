import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../config.js';
import Loading from '../../components/Loading/Loading.jsx';


export default function PermissionMiddle({Component}) {
    const [isAuth, setIsAuth] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
  
        onAuthStateChanged(auth, (user) => {
            const configData = query(collection(db, 'config'), where("user_id", "==", user.uid));
            getDocs(configData)
                    .then((querySnapshot) => {
                        let valor = false
                        querySnapshot.forEach((documentSnapshot) => {
                            
                            let newActual = documentSnapshot.data().permisos
                            newActual == 5 ? valor = true : valor = false
                            
                        });
                        setIsAuth(valor)
                        setIsLoading(false);
                    });
            
        });
    }, []);
    if (isLoading) {
      return <Loading></Loading>
    }
  
    return isAuth ? <Component /> : <Navigate to="/" />;
}
