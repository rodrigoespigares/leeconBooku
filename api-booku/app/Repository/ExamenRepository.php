<?php

namespace App\Repository;

use MrShan0\PHPFirestore\Fields\FirestoreArray;
use MrShan0\PHPFirestore\Fields\FirestoreObject;
use MrShan0\PHPFirestore\Fields\FirestoreTimestamp;
use MrShan0\PHPFirestore\FirestoreClient;
use ReflectionClass;

class ExamenRepository{
    private $firestoreClient;
    private $collection = "examen";

    public function __construct() {
        $this->firestoreClient = new FirestoreClient('lee-con-booku', 'AIzaSyBWHTD8IFWgsg6WgO-pwLl8PXEGjmzEpYc', ['database' => '(default)']);
    }

    public function getExamen($id){
        $documento = $this->firestoreClient->getDocument($this->collection.'/'.$id);
        $name = explode("/", $documento->getName());
        $respuesta['id'] = $name[count($name)-1];
        $respuesta['contrasena'] = $documento->get('contrasena');
        
        $respuesta['fecha'] = $documento->get('fecha')->parseValue();
        $respuesta['id_grupo'] = $documento->get('id_grupo');
        $respuesta['uid'] = $documento->get('uid');
        $respuesta['tiempo'] = $documento->get('tiempo')->parseValue();

        $firestoreObject = $documento->get("examen");

        $reflectionClass = new ReflectionClass($firestoreObject);
        $property = $reflectionClass->getProperty('data');
        $property->setAccessible(true);

        $data = $property->getValue($firestoreObject);

        

        $respuesta['examen']['solucion'] = $data[0]['solucion'];
        
        $respuesta['examen']['preguntas'] = $data[0]['preguntas'];




        for ($i=0; $i < count($data[0]['respuestas']); $i++) { 
            $firestoreObject2 = $data[0]['respuestas'][$i];

            $reflectionClass = new ReflectionClass($firestoreObject2);
            $property2 = $reflectionClass->getProperty('data');
            $property2->setAccessible(true);

            $data2 = $property2->getValue($firestoreObject2);

            

            $respuesta['examen']['respuestas'][] = $data2[0]['respuestas'];
        }

        
        return $respuesta;
    }

    public function crear($data) {

        foreach ($data['examen']['respuestas'] as $key => $value) {
            $respuestas[] = new FirestoreObject([ 'respuestas' => new FirestoreArray($value)]);
        }

        $accion = $this->firestoreClient->addDocument($this->collection,[
            'uid' => $data['uid'],
            'id_grupo' => $data['id_grupo'],
            'fecha' => new FirestoreTimestamp($data['fecha']),
            'tiempo' => new FirestoreTimestamp($data['tiempo']),
            'contrasena' => $data['contrasena'],
            'examen' => new FirestoreObject(['preguntas' => new FirestoreArray($data['examen']['preguntas']),'respuestas'=>$respuestas,'solucion' => new FirestoreArray($data['examen']['solucion'])]),
        ]);
        $partir = explode('/', $accion->getName());
        return end($partir);
    }

    public function editExamen($id,$data) {
        foreach ($data['examen']['respuestas'] as $key => $value) {
            $respuestas[] = new FirestoreObject([ 'respuestas' => new FirestoreArray($value)]);
        }
        $this->firestoreClient->updateDocument($this->collection.'/'.$id,[
            'uid' => $data['uid'],
            'id_grupo' => $data['id_grupo'],
            'fecha' => new FirestoreTimestamp($data['fecha']),
            'tiempo' => new FirestoreTimestamp($data['tiempo']),
            'contrasena' => $data['contrasena'],
            'examen' => new FirestoreObject(['preguntas' => new FirestoreArray($data['examen']['preguntas']),'respuestas'=>$respuestas,'solucion' => new FirestoreArray($data['examen']['solucion'])]),
        
        ],true);
    }
    public function removeExamen($id){
        $this->firestoreClient->deleteDocument($id);
    }
}