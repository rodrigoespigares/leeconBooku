import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useEffect, useState } from 'react';
import Usuarios from './Usuarios/Usuarios';
import Stats from './Stats/Stats';
import Recompensas from './Recompensas/Recompensas';
import Juego from './Juego/Juego';
import Reto from './Reto/Reto';
import Grupo from './Grupo/Grupo';
import { useParams } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import { Link } from 'react-router-dom';

export default function Admin() {
    let { check, id } = useParams();
    let [usuarios, setUsuarios] = useState(false);
    let [stats, setStats] = useState(false);
    let [recompensas, setRecompensas] = useState(false);
    let [juego, setJuego] = useState(false);
    let [reto, setReto] = useState(false);
    let [grupo, setGrupo] = useState(false);
    let [user, setUser] = useState("");
    let [mensaje, setMensaje] = useState("");

    useEffect(() => {
        if (mensaje != "") {
            const timer = setTimeout(() => {
                setMensaje("");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [mensaje])

    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
    }, [check, id]);

    function ocultar() {
        setUsuarios(false);
        setStats(false);
        setRecompensas(false);
        setJuego(false);
        setReto(false);
        setGrupo(false);
    }

    function handleMensaje(msg) {
        setMensaje(msg);
    }

    return (
        <>
            <Link to="/home" className="btn btn-secondary mt-5 ms-5">Volver</Link>
            {mensaje !== "" && (
                <div className='w-100 d-flex justify-content-center'>
                    <div className="alert alert-success w-50 fade show position-absolute" role='alert'>
                        {mensaje}
                    </div>
                </div>
            )}
            <section className='admin'>
                <button className='admin__btn' onClick={() => { setUsuarios(!usuarios) }}>
                    <Icon className='admin__btn--icon' icon="material-symbols:person" />
                    <h2 className='admin__btn--title'>Gestionar usuarios</h2>
                </button>
                <button className='admin__btn' onClick={() => { setStats(!stats) }}>
                    <Icon className='admin__btn--icon' icon="solar:diagram-up-linear" />
                    <h2 className='admin__btn--title'>Ver estadísticas</h2>
                </button>
                <button className='admin__btn' onClick={() => { setRecompensas(!recompensas) }}>
                    <Icon className='admin__btn--icon' icon="solar:calendar-bold" />
                    <h2 className='admin__btn--title'>Gestionar recompensas</h2>
                </button>
                <button className='admin__btn' onClick={() => { setJuego(!juego) }}>
                    <Icon className='admin__btn--icon' icon="mingcute:game-2-fill" />
                    <h2 className='admin__btn--title'>Gestionar juego</h2>
                </button>
                <button className='admin__btn' onClick={() => { setReto(!reto) }}>
                    <Icon className='admin__btn--icon' icon="material-symbols:work-alert" />
                    <h2 className='admin__btn--title'>Gestionar retos</h2>
                </button>
                <button className='admin__btn' onClick={() => { setGrupo(!grupo) }}>
                    <Icon className='admin__btn--icon' icon="material-symbols:groups-3" />
                    <h2 className='admin__btn--title'>Gestionar grupos</h2>
                </button>
            </section>
            <Usuarios onMensaje={handleMensaje} onOcultar={ocultar} modal={usuarios} usuario={user}></Usuarios>
            <Stats onOcultar={ocultar} modal={stats} usuario={user}></Stats>
            <Recompensas onMensaje={handleMensaje} onOcultar={ocultar} modal={recompensas} usuario={user}></Recompensas>
            <Juego onMensaje={handleMensaje} onOcultar={ocultar} modal={juego} usuario={user}></Juego>
            <Reto onMensaje={handleMensaje} onOcultar={ocultar} modal={reto} usuario={user}></Reto>
            <Grupo onMensaje={handleMensaje} onOcultar={ocultar} modal={grupo} usuario={user}></Grupo>
        </>
    );
}