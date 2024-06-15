import React from 'react'
import equipo from '../../assets/equipo.jpeg'
import { Link } from 'react-router-dom'

export default function About() {
  return (
    <>
      <Link to="/home" className="mt-5 ms-5 btn btn-secondary">Volver</Link>
      <div className='d-flex flex-column flex-md-row align-items-center justify-content-center w-100 h-100 px-md-5'>
          <div className='w-50'>
              <img className='w-100' src={equipo} alt="Foto de un equipo trabajando representando a la comunidad de Booku" />
          </div>
          <div className='complementarias'>
              <h2>Sobre nosotros</h2>
              <p>Somos un grupo reducido de personas apasionados por la lectura, que nos decidimos a desarrollar este proyecto para encontrar a más gente que compartira nuestra pasión por la lectura, fue por eso que en 2024 nos lancemos al desarrollo de esta aplicación que nos ha hecho encontrar a un gran grupo de pesonas</p>
              <p>La comunidad de Booku es una comunidad creativa y respetuosa por lo que siempre serás bienvenido/a en cualquier momento.</p>
              <p><strong>¡Te esperamos!</strong></p>
          </div>
      </div>
    </>
  )
}
