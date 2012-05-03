<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
//require_once 'Mysql.class.php';

Class Test
{
  private $name="Amol C";
   
   public function __construct()
   {
    $this->userName = $name;
   }
   
   public function listCustomers()
   {
      
      return $userName ;
   }
}

$test = new Test();
echo $test->listCustomers(); 


?>