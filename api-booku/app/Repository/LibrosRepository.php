<?php

namespace App\Repository;

use MrShan0\PHPFirestore\FirestoreClient;

class LibrosRepository{
    private $firestoreClient;
    private $collection = "libro";

    public function __construct() {
        $this->firestoreClient = new FirestoreClient('lee-con-booku', 'AIzaSyBWHTD8IFWgsg6WgO-pwLl8PXEGjmzEpYc', ['database' => '(default)']);
    }

    public function creaLibro(array $data) {
        $this->firestoreClient->addDocument($this->collection,[
            'isbn'=> $data['isbn'],
            'foto'=> $data['foto'],
            'titulo' => $data['titulo'],
            'autor' => $data['autor'],
            'descripcion' => $data['descripcion']
        ]);
    }
    
    public function allBooks() {
        $documents = $this->firestoreClient->listDocuments($this->collection);
        
        foreach ($documents as $key => $value) {
            foreach ($value as $key => $document) {
                $name = explode("/", $document->getName());
                $result[$key]['id']= $name[count($name)-1];
                $result[$key]['autor']= $document->get("autor");
                $result[$key]['descripcion']= $document->get("descripcion");
                $result[$key]['foto']= $document->get("foto");
                $result[$key]['isbn']= $document->get("isbn");
                $result[$key]['titulo']= $document->get("titulo");
                
            }
        }
        
        return $result;
    }

    public function removeBook(string $id){
        $this->firestoreClient->deleteDocument($id);
    }
    public function editBook($id, $data) {
        $this->firestoreClient->updateDocument($this->collection.'/'.$id,[
            'autor'=> $data['autor'],
            'descripcion'=> $data['descripcion'],
            'foto'=> $data['foto'],
            'isbn'=> $data['isbn'],
            'titulo'=> $data['titulo'],
        
        ],true);
    }
    public function getBook($id) {
        $documento = $this->firestoreClient->getDocument($this->collection.'/'.$id);
        $name = explode("/", $documento->getName());
        $respuesta['id'] = $name[count($name)-1];
        $respuesta['autor'] = $documento->get('autor');
        $respuesta['descripcion'] = $documento->get('descripcion');
        $respuesta['foto'] = $documento->get('foto');
        $respuesta['isbn'] = $documento->get('isbn');
        $respuesta['titulo'] = $documento->get('titulo');
        
        return $respuesta;
    }
}