import React from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import equipo from '../../assets/equipo.jpeg'
import { Link } from 'react-router-dom'

export default function Contact() {
    return (
        <>
            <Link to="/home" className="mt-5 ms-5 btn btn-secondary">Volver</Link>
            <div className='d-flex flex-column flex-md-row align-items-center justify-content-center w-100 h-100 px-md-5'>
                <div className='w-50'>
                    <img className='w-100' src={equipo} alt="Foto de un equipo trabajando representando a la comunidad de Booku" />
                </div>
                <div className='complementarias'>
                    <h2>Contacto</h2>
                    <p>Para contactar con nosotros puedes hacerlo mediante nuestras redes sociales: </p>
                    <article className='d-flex'>
                        <a href="https://www.facebook.com"><Icon className='display-1 text-secondary' icon="mdi:facebook" /></a>
                        <a href="https://www.instragram.es"><Icon className='display-1 text-secondary' icon="mdi:instagram" /></a>
                        <a href="https://www.twitter.es"><Icon className='display-1 text-secondary' icon="mdi:twitter" /></a>
                    </article>
                    <p>O mediante nuestro correo electrónico:</p>
                    <p className='text-secondary'>booku-soporte@gmail.com</p>
                </div>
            </div>
        </>
    )
}
