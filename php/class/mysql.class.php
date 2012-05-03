<?php
/**
*  Mysql.class.php
*  @author Charles Reace (www.charles-reace.com)
*  @version 1.0
*  @license http://opensource.org/licenses/gpl-license.php GNU Public License
*/

/**
*  class used for db query results
*/
require_once 'QueryResult.class.php';

/**
*  "Singleton" pattern MySQL database class
*  @package Database
*/
class Mysql
{
   // USER MODIFIABLE DATABASE SETTINGS //
   
   private $dbHost = 'localhost';
   private $dbUser = 'dbuser';
   private $dbPwd = 'password123';
   private $database = 'database_name';
   private $connx = NULL;
   private $error = '';
   
   // DO NOT MODIFY BELOW THIS LINE //
   
   private static $instance;
   
   /**
   *  Private constructor: prevents direct creation of object
   */
   private function __construct()
   {
      $this->connect();
   }
   
   /**
   *  Singleton method (only allow one instance of this class)
   *  @return object
   */
   public static function singleton()
   {
      if (!isset(self::$instance))
      {
         $c = __CLASS__;
         self::$instance = new $c;
      }
   
      return self::$instance;
   }  // end singleton()
      
   /**
   *  Prevent users from cloning this instance
   *  @return void
   */
   public function __clone()
   {
      trigger_error('Clone is not allowed.', E_USER_ERROR);
   }
   
   /**
   *  Connect to MySQL and select database
   *  @return boolean
   */
   private function connect()
   {
      $connx = @mysql_connect($this->dbHost, $this->dbUser, $this->dbPwd);
      if($connx != FALSE)
      {
         $this->connx = $connx;
         $db = mysql_select_db($this->database, $this->connx);
         if($db == FALSE)
         {
            $this->error = "Unable to select DB: " . mysql_error();
            user_error($this->error, E_USER_WARNING);
            return(FALSE);
         }
         return(TRUE);
      }
      $this->error = "Unable to connect to DBMS: " . mysql_error();
      user_error($this->error, E_USER_WARNING);
      return(FALSE);
   }  // end connect()
   
   /**
   *  Get database connection resource ID
   *  @return resource
   */
   public function getConnection()
   {
      return($this->connx);
   }
   
   /**
   *  Sanitize input for use in SQL
   *  @param string|integer|float $input
   *  @return string|integer|float
   */
   public function sanitize($input)
   {
      $input = trim($input);
      if(!is_numeric($input))
      {
         if(get_magic_quotes_gpc())
         {
            $input = stripslashes($input);
         }
         $input = "'" . mysql_real_escape_string($input) . "'";
      }
      return($input);
   }
   
   /**
   *  Execute SELECT query (or any query that returns result rows)
   *  @param string $sql
   *  @return object
   */
   public function select($sql)
   {
      if(!$this->connx)
      {
         $this->error = "Cannot process query, no DB connection.";
         user_error($this->error, E_USER_WARNING);
         return(FALSE);
      }
      $result = mysql_query($sql, $this->connx);
      if($result)
      {
         if(mysql_num_rows($result))
         {
            return(new QueryResult($result, $this->connx));
         }
         else
         {
            return(0);
         }
      }
      else
      {
         $this->error = "Query failed ($sql): " . mysql_error();
         user_error($this->error, E_USER_WARNING);
         return(FALSE);
      }
   }
   
   /**
   *  Execute query that does not return result rows (e.g.: INSERT)
   *  @param string $sql
   *  @return integer
   */
   public function modify($sql)
   {
      if(!$this->connx)
      {
         $this->error = "Cannot process query, no DB connection.";
         user_error($this->error, E_USER_WARNING);
         return(FALSE);
      }
      $result = mysql_query($sql, $this->connx);
      if($result)
      {
         return(mysql_affected_rows($this->connx));
      }
      else
      {
         $this->error = "Query failed ($sql): " . mysql_error();
         user_error($this->error);
         return(FALSE);
      }
   }
} 
?>