import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config';
import { Navigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../config.js';
import Loading from '../../components/Loading/Loading.jsx';

export default function GrupoMiddle({ Component }) {
    const [isAuth, setIsAuth] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    let { check, id } = useParams();

    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            if (!user) {
                setIsAuth(false);
                setIsLoading(false);
                return;
            }

            if (check === "grupo") {
                const configData = query(collection(db, 'config'), where("user_id", "==", user.uid));
                getDocs(configData)
                    .then((querySnapshot) => {
                        let isAuthorized = false;
                        querySnapshot.forEach((documentSnapshot) => {
                            let newActual = documentSnapshot.data().id_grupos;
                            if (newActual.includes(id)) {
                                isAuthorized = true;
                            }
                        });
                        setIsAuth(isAuthorized);
                        setIsLoading(false);
                    })
                    .catch((error) => {
                        console.error("Error checking grupo auth: ", error);
                        setIsAuth(false);
                        setIsLoading(false);
                    });
            } else {
                setIsAuth(!!user);
                setIsLoading(false);
            }
        });
    }, [check, id]);

    if (isLoading) {
        return <Loading />;
    }

    return isAuth ? <Component /> : <Navigate to="/" />;
}