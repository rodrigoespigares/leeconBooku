<?php

namespace App\Repository;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use MrShan0\PHPFirestore\Fields\FirestoreArray;
use MrShan0\PHPFirestore\Fields\FirestoreObject;
use MrShan0\PHPFirestore\Fields\FirestoreTimestamp;
use MrShan0\PHPFirestore\FirestoreClient;
use MrShan0\PHPFirestore\Query\FirestoreQuery;
use ReflectionClass;

class RetosRepository{
    private $firestoreClient;
    private $collection = "reto";

    public function __construct() {
        $this->firestoreClient = new FirestoreClient('lee-con-booku', 'AIzaSyBWHTD8IFWgsg6WgO-pwLl8PXEGjmzEpYc', ['database' => '(default)']);
    }

    public function creaReto(array $data) {
        $accion = $this->firestoreClient->addDocument($this->collection,[
            'uid'=> $data['uid'],
            'nombre'=> $data['nombre'],
            'id_libros' => new FirestoreArray($data['id_libros']),
            'duracion' => new FirestoreObject(["duracion"=>$data['duracion'][0],"tipo"=>$data['duracion'][1]])
        ]);
        $partir = explode('/', $accion->getName());
        return end($partir);
        

    }
    public function buscaReto(){
        $documents = $this->firestoreClient->listDocuments($this->collection);
        
        foreach ($documents as $key => $value) {
           
            foreach ($value as $key => $document) {
                $name = explode("/", $document->getName());
                
                $result[$key]['id']= $name[count($name)-1];
                try {
                    $result[$key]['uid'] = $document->get('uid');
                } catch (\MrShan0\PHPFirestore\Exceptions\Client\FieldNotFound $e) {
                    $result[$key]['uid']= "";
                }

                $firestoreObject = $document->get("duracion");

                $reflectionClass = new ReflectionClass($firestoreObject);
                $property = $reflectionClass->getProperty('data');
                $property->setAccessible(true);

                $data = $property->getValue($firestoreObject);
                $result[$key]['nombre']= $document->get("nombre");
                $result[$key]['id_libros']= $document->get("id_libros");
                $result[$key]['duracion']= $data;

                
            }
        }
        
        return $result;
    }
    public function removeReto($id){
        $this->firestoreClient->deleteDocument($id);
    }
    public function editReto($id, $data) {
        $this->firestoreClient->updateDocument($this->collection.'/'.$id,[
            'uid'=> $data['uid'],
            'nombre'=> $data['nombre'],
            'id_libros'=> new FirestoreArray($data['id_libros']),
            'duracion'=> new FirestoreObject(["duracion"=>$data['duracion'][0],"tipo"=>$data['duracion'][1]])
        
        ],true);
    }
    public function getReto($id) {
        $documento = $this->firestoreClient->getDocument($this->collection.'/'.$id);
        $name = explode("/", $documento->getName());
        $respuesta['id'] = $name[count($name)-1];
        try {
            $respuesta['uid'] = $documento->get('uid');
        } catch (\MrShan0\PHPFirestore\Exceptions\Client\FieldNotFound $e) {
            $respuesta['uid']= "";
        }
        $respuesta['nombre'] = $documento->get('nombre');
        $respuesta['id_libros'] = $documento->get('id_libros');

        $data = [
            [
                "tipo" => "2",
                "duracion" => "3"
            ]
        ];
        $firestoreObject = $documento->get("duracion");

        $reflectionClass = new ReflectionClass($firestoreObject);
        $property = $reflectionClass->getProperty('data');
        $property->setAccessible(true);

        $data = $property->getValue($firestoreObject);

        $respuesta['duracion']['tipo'] = $data[0]['tipo'];
        $respuesta['duracion']['duracion'] = $data[0]['duracion'];
        
        return $respuesta;
    }
}