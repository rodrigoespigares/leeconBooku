import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config';
import { Navigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../config.js';
import Loading from '../../components/Loading/Loading.jsx';

export default function AdminExamenMiddle({ Component }) {
    let [isAuth, setIsAuth] = useState(false);
    let [isLoading, setIsLoading] = useState(true);
    let { check, id } = useParams();

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
                                setIsAuth(examData.uid == user.uid);
                                setIsLoading(false)

                            });
                    }
                });
            
        });
    }, [check, id]);

    if (isLoading) {
        return <Loading />;
    }

    return isAuth ? <Component /> : <Navigate to="/" />;
}