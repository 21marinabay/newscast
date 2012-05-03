<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
//require_once 'news.class.php';

class robot
{
   private $db;
   
   public function __construct()
   {
      $this->db = Mysql::singleton();
   }
   
   public function listCustomers()
   {
      $result = $this->db->select('SELECT * FROM customers');
      return $result->getTable(true);
   }
}

$test = new Test();
echo $test->listCustomers(); 

?>