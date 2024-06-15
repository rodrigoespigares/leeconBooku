import { Icon } from '@iconify/react';
import { collection, getDocs } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { db } from '../../../config';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

export default function Usuarios(props) {
    let [verModal, setVerModal] = useState(false);
    let [usuarios, setUsuarios] = useState([]);
    let [grupos, setGrupos] = useState([]);
    let [reto, setReto] = useState(0);
    let [examenes, setExamenes] = useState([]);
    let [chartData, setChartData] = useState([]);
    let [visibility, setVisibility] = useState({
        retos: true,
        examenes: true,
        usuarios: true,
        profesores: true,
        grupos: true
    });

    useEffect(() => {
        setVerModal(props.modal);

        async function fetchData() {
            try {
                const usuariosSnapshot = await getDocs(collection(db, 'config'));
                let documentos = [];
                usuariosSnapshot.forEach(doc => {
                    documentos.push(doc.data());
                });
                setUsuarios(documentos);

                const gruposSnapshot = await getDocs(collection(db, 'grupos'));
                let contadorGrupo = [];
                gruposSnapshot.forEach(doc => {
                    contadorGrupo.push(doc.data());
                });
                setGrupos(contadorGrupo);

                const examenesSnapshot = await getDocs(collection(db, 'examen'));
                let contadorExamenes = [];
                examenesSnapshot.forEach(doc => {
                    contadorExamenes.push(doc.data());
                });
                setExamenes(contadorExamenes);
                const response = await fetch("https://api-booku.vercel.app/reto/", {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + props.usuario.accessToken
                    }
                });
                const data = await response.json();
                setReto(data.data.length);

            } catch (error) {
                console.error("Error fetching data: ", error);
            }
        }

        fetchData();
    }, [props.modal]);

    useEffect(() => {
        const newChartData = [
            { name: 'Usuarios', value: usuarios.length, key: 'usuarios' },
            { name: 'Profesores', value: usuarios.filter((usuario) => usuario.permisos === 2).length, key: 'profesores' },
            { name: 'Retos', value: reto, key: 'retos' },
            { name: 'Exámenes', value: examenes.length, key: 'examenes' },
            { name: 'Grupos', value: grupos.length, key: 'grupos' }
        ];

        // Set visibility based on the length of each category
        let newVisibility = {
            retos: newChartData.find(item => item.key === 'retos').value > 0,
            examenes: newChartData.find(item => item.key === 'examenes').value > 0,
            usuarios: newChartData.find(item => item.key === 'usuarios').value > 0,
            profesores: newChartData.find(item => item.key === 'profesores').value > 0,
            grupos: newChartData.find(item => item.key === 'grupos').value > 0
        };

        setVisibility(newVisibility);
        setChartData(newChartData);
    }, [reto, examenes, usuarios, grupos]);

    function ocultar() {
        setVerModal(!verModal);
        props.onOcultar();
    }

    function toggleVisibility(key) {
        setVisibility(prevVisibility => ({
            ...prevVisibility,
            [key]: !prevVisibility[key]
        }));
    }

    // Define the colors associated with each category
    const colors = {
        retos: "#B05252",        // Corresponds to text-menu3
        examenes: "#76B052",     // Corresponds to text-menu4
        usuarios: "#526DB0",     // Corresponds to text-menu1
        profesores: "#B052A7",   // Corresponds to text-menu2
        grupos: "#52B07E"        // Corresponds to text-menu5
    };

    // Filter chart data based on visibility
    const filteredChartData = chartData.filter(item => visibility[item.key]);

    // Calculate the dynamic width
    const chartWidth = filteredChartData.length * 10;

    return (
        <div
            className={`modal fade justify-content-center align-items-baseline align-items-md-center ${verModal ? 'show' : ''}`}
            style={{ display: verModal ? 'flex' : 'none' }}
            onClick={ocultar}
        >
            <div className="grupos modal-content w-75 h-70 overflow-auto" onClick={e => e.stopPropagation()}>
                <div className="modal-body">
                    <div>
                        <button onClick={ocultar} type="button" className="btn position-absolute z-3 top-0 end-0">
                            <Icon className='display-1' icon="material-symbols:close-rounded" />
                        </button>
                    </div>
                    <div className='d-flex flex-column align-items-center py-5 admin__usuarios position-relative h-100'>
                        <h2 className='text-uppercase'>Estadísticas</h2>
                        {/* MENU DE ESTADISTICAS */}
                        <div className='menu-estadisticas'>
                            <button onClick={() => toggleVisibility('usuarios')} className={'btn fs-3 ' + (visibility.usuarios ? "text-menu1" : "text-tertiary-dark")}>Número de usuarios</button>
                            <button onClick={() => toggleVisibility('profesores')} className={'btn fs-3 ' + (visibility.profesores ? "text-menu2" : "text-tertiary-dark")}>Número de profesores</button>
                            <button onClick={() => toggleVisibility('retos')} className={'btn fs-3 ' + (visibility.retos ? "text-menu3" : "text-tertiary-dark")}>Número de retos</button>
                            <button onClick={() => toggleVisibility('examenes')} className={'btn fs-3 ' + (visibility.examenes ? "text-menu4" : "text-tertiary-dark")}>Número de examenes</button>
                            <button onClick={() => toggleVisibility('grupos')} className={'btn fs-3 ' + (visibility.grupos ? "text-menu5" : "text-tertiary-dark")}>Número de grupos</button>
                        </div>

                        <div className='d-flex align-items-center h-100 mt-5 w-md-50' >
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart
                                    data={filteredChartData}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value">
                                        {filteredChartData.map((item, index) => (
                                            <Cell key={`cell-${index}`} fill={colors[item.key]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}