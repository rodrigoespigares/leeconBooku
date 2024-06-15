import React, { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'

import { Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import hero from '../../assets/hero.png'
import libro from '../../assets/libro.png'
import retos from '../../assets/retos.png'
import estadisticas from '../../assets/estadisticas.jpeg'
import amigos from '../../assets/amigos.jpeg'
import img_retos from '../../assets/img_retos.jpeg'
import cuidados from '../../assets/cuidados.jpeg'
import personalizable from '../../assets/personalizable.jpeg'

export default function Landing() {
    let [books, setBooks] = useState([]);
    let [usuario, setUsuario] = useState(null);

    useEffect(() => {
        fetch("https://www.googleapis.com/books/v1/volumes?q=Cuco")
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setBooks(data.items);
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }, []);

    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setUsuario(true);
            } else {
                setUsuario(false);
            }
        });
    }, []);
    return (
        <>
            <section id="hero" className='d-flex flex-column flex-md-row justify-content-center align-items-center'>
                <div className='content'>
                    <h1 className='display-1'>¡Es hora de volver a leer!</h1>
                    <Link className='fade__title display-2' to={usuario?"/home":"/inicio-sesion"}>Empezar ahora<Icon icon="mingcute:right-line" /></Link>
                </div>
                <div className='picture d-none d-md-block'>
                    <img src={hero} alt="Pila de libros" />
                </div>
            </section>
            <section id='ranking' className='d-flex flex-column align-items-center'>
                <h2 className='display-2 my-5'>Libros más populares</h2>
                <section className="ranking__books d-flex gap-3 flex-column  gap-md-0 flex-md-row justify-content-evenly w-100">
                    {
                        books.slice(0, 4).map((book) => (
                            <div key={book.id} className='ranking__book'>
                                <img className='ranking__book__img' src={book.volumeInfo.imageLinks == undefined ? libro : book.volumeInfo.imageLinks.thumbnail} alt="" />
                                <h3 className='display-6 ranking__book__h3'>{book.volumeInfo.title}</h3>
                                <Link to={"/detalle/libro/"+book.id} className='ranking__book__a'>Ver más <Icon icon="mingcute:right-line" /></Link>
                            </div>
                        ))
                    }
                </section>
            </section>
            <section id='explain' className='py-5 text-center text-md-start'>
                <section className='explain__section d-flex flex-column flex-md-row'>
                    <article className='explain__section--content'>
                        <h3>Empieza un reto</h3>
                        <p>Dentro de esta aplicación tendrá una cantidad de retos para afrontar su vuelta a la lectura donde podrá conocer nuevos libros y adentrarse en una nueva aventura que es el leer. ¿A qué espera para comenzar una nueva aventura? Recuerde que siempre es un buen momento para leer.</p>
                    </article>
                    <article className='explain__section--img'>
                        <img src={retos} alt="Imagen de libros abiertos" />
                    </article>
                </section>
                <section className='explain__section d-flex flex-column flex-md-row-reverse'>
                    <article className='explain__section--content'>
                        <h3>Controla tus estadísticas</h3>
                        <p>Dentro de la aplicación podrás ver cuantos libros has leido y cuantos retos has completado correctamente. Nunca es tarde para empezar uno nuevo y siempre tener en cuenta que sus amigos también podrán ver que ha leido. ¿Dejará que sus amigos lean más que usted? ¡Es el momento de sacarles ventaja con un buen libro!</p>
                    </article>
                    <article className='explain__section--img'>
                        <img src={estadisticas} alt="Imagen explicativa de uso de gráficos" />
                    </article>
                </section>
                <section className='explain__section d-flex flex-column flex-md-row'>
                    <article className='explain__section--content'>
                        <h3>Agrega a tus amigos</h3>
                        <p>Comparte la aplicación con sus amigos más cercanos y compartan una buena lectura afrontando un reto juntos. Puede ser divertido competir por leer y disfrutar después de una agradable conversación sobre ese libro. Por lo que ahora debe llamar a sus amigos para que se unan.</p>
                    </article>
                    <article className='explain__section--img'>
                        <img src={amigos} alt="Imagen explicativa de agregar amigos" />
                    </article>
                </section>
                <section className='explain__section d-flex flex-column flex-md-row-reverse'>
                    <article className='explain__section--content'>
                        <h3>Únete a retos</h3>
                        <p>La competitividad hará que su vuelta a la lectura sea mucho más agradable y divertida, ¡nunca es tarde para afrontar un buen libro! Podrá unirse a nuestros retos o crear uno personal donde sus amigos se unan, ¿quién acabará de leer todos los libros a tiempo? Y si no lo consigue siempre podrá volver a intentarlo.</p>
                    </article>
                    <article className='explain__section--img'>
                        <img src={img_retos} alt="Imagen de una persona uniendose a un reto" />
                    </article>
                </section>
                <section className='explain__section d-flex flex-column flex-md-row'>
                    <article className='explain__section--content w-100 w-md-50'>
                        <h3>Cuida a tu Booku</h3>
                        <p>No dejes que tu Booku pase a mejor vida para ello deberá completar retos y aprobar los examenes de los grupos para así conseguir monedas y alimentar a su nueva máscota. En cada reto tendrás la posibilidad de ganar hasta 1000 bookoins, ¿vas a dejar que tu Booku muera de hambre?</p>
                    </article>
                    <article className='explain__section--img'>
                        <img src={cuidados} alt="Imagen de un hombre cuidando a su booku" />
                    </article>
                </section>
                <section className='explain__section d-flex flex-column flex-md-row-reverse'>
                    <article className='explain__section--content  w-100 w-md-50'>
                        <h3>Personaliza tu Booku</h3>
                        <p>A la hora de crear tu booku siempre podrás darle el nombre que más te guste, y eso hará que su amigo este más contento de estar con usted. Siempre podrás cambiarle el nombre si es que le deja de gustar. Y esto lo podrá hacer en cualquier momento y de forma totalmente gratuita.</p>
                    </article>
                    <article className='explain__section--img'>
                        <img src={personalizable} alt="Imagen que explica como personalizar al booku" />
                    </article>
                </section>
            </section>
        </>
    )
}
