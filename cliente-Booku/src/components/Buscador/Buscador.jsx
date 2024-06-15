import { Icon } from '@iconify/react/dist/iconify.js'
import React, { useState } from 'react'
import { Link } from 'react-router-dom';

import booku from '../../assets/libro.png';

export default function Buscador() {
    let [buscando, setBuscando] = useState("");
    let [index, setIndex] = useState(0);
    let [resultado, setResultado] = useState([]);

    function buscar() {
        fetch("https://www.googleapis.com/books/v1/volumes?q=" + buscando + "&startIndex=0&maxResults=12")
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            setResultado(data.items);
            setIndex(12); // Reset index after new search
        });
    }

    function vermas() {
        fetch(`https://www.googleapis.com/books/v1/volumes?q=${buscando}&startIndex=${index}&maxResults=12`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            setResultado(prevResultado => [...prevResultado, ...data.items]);
            setIndex(prevIndex => prevIndex + 12); // Increment index for next fetch
        });
    }

    return (
        <>
            <Link to="/home" className="mt-5 ms-5 btn btn-secondary">Volver</Link>
            <section className='buscador' id='buscador'>
                <div className={'d-flex ' + (buscando.length <= 3 ? 'flex-column align-items-center' : 'flex-row align-items-center gap-5 mt-3')}>
                    <h2 className='display-1 fw-bold text-primary'>BUSCADOR</h2>
                    <div className='buscador--input'>
                        <input type="text" placeholder='Busca aquí tu primer libro!' value={buscando} onChange={(e) => {
                            setBuscando(e.target.value);
                            if ((buscando.length + 1) % 3 === 0) {
                                buscar();
                            }
                        }} />
                        <button className='btn' onClick={buscar}>Buscar!</button>
                    </div>
                </div>
                <div className={(buscando.length <= 3 ? 'd-none' : 'd-flex flex-column align-items-center w-75')}>
                    <div className='d-flex align-items-center justify-content-between w-100 flex-wrap gap-5'>
                        {resultado && resultado.map((libro) => {
                            const imageLinks = libro.volumeInfo.imageLinks;
                            return (
                                <Link to={'/detalle/libro/'+libro.id} key={libro.id} className='buscador__resultado__book text-decoration-none'>
                                    <div className='buscador__resultado__book__caratula'>
                                        {imageLinks && imageLinks.thumbnail ? (
                                            <img className='w-100 h-100' src={imageLinks.thumbnail} alt={"Portada de " + libro.volumeInfo.title} />
                                        ) : (
                                            <img className='w-100 h-100' src={booku} alt={"Portada de repuesto de booku"} />
                                        )}
                                    </div>
                                    <h2 className='buscador__resultado__book__title'>{libro.volumeInfo.title}</h2>
                                </Link>
                            );
                        })}
                    </div>
                    <button onClick={vermas} className='btn fs-3 text-secondary'>Ver más <Icon icon="uiw:down" /></button>
                </div>
            </section>
        </>
    );
}