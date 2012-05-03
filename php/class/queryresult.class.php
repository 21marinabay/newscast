<?php
/**
*  Mysql.class.php
*  @author Charles Reace (www.charles-reace.com)
*  @version 1.0
*  @license http://opensource.org/licenses/gpl-license.php GNU Public License
*/

/**
*  Query result from Mysql class
*  @package Database
*/
class QueryResult
{
   private $result = NULL;
   private $connx = NULL;
   private $numRows = 0;
   
   /**
   *  Constructor
   *  @param resource $result
   *  @param resource $connx
   *  @return void
   */
   public function __construct($result, $connx)
   {
      $this->result = $result;
      $this->connx = $connx;
      $this->numRows = mysql_num_rows($result);
   }
   
   /**
   *  Get specified result row as assoc. array
   *  @param integer $row
   *  @return array
   */
   public function getRow($row = NULL)
   {
      if($row !== NULL and is_numeric($row))
      {
         if(mysql_data_seek($this->result, abs((int)$row)))
         {
            return(mysql_fetch_assoc($this->result));
         }
      }
      else
      {
         return(false);
      }
   }  // end getRow()
   
   /**
   *  Get query results as HTML table.
   *  If $headers evaluates a TRUE, a header row will be included.
   *  If $headers is TRUE and the $labels is an array, the values in $labels
   *  will be used as the column heading labels.
   *  @param boolean $headers
   *  @param array $labels
   *  @return string
   */
   public function getTable($headers = FALSE, $labels = NULL)
   {
      if(!mysql_data_seek($this->result, 0))
      {
         return(false);
      }
      $table = "<table class='dbresult'>\n";
      if($headers)
      {
         $table .= "<tr>";
         if(is_array($labels))
         {
            foreach($labels as $label)
            {
               $table .= "<th>$label</th>";
            }
         }
         else
         {
            $num = mysql_num_fields($this->result);
            for($ix = 0; $ix < $num; $ix++)
            {
               $table .= "<th>".mysql_field_name($this->result,$ix)."</th>";
            }
         }
         $table .= "</tr>\n";
      }
      while($row = mysql_fetch_row($this->result))
      {
         $table .= "<tr>";
         foreach($row as $val)
         {
            $table .= "<td>$val</td>";
         }
         $table .= "</tr>\n";
      }
      $table .= "</table>\n";
      return($table);
   }
   
   /**
   *  Get query results as an array
   *  @return array
   */
   public function getArray()
   {
      mysql_data_seek($this->result, 0);
      $data = array();
      while($row = mysql_fetch_assoc($this->result))
      {
         $data[] = $row;
      }
      return($data);
   }  // end getArray()
   
   /**
   *  Get query results as an XML string
   *  @return string
   */
   public function getXml()
   {
      mysql_data_seek($this->result, 0);
      $xml = "<?xml version='1.0' encoding='ISO-8859-1'?>\n<data>\n";
      $count = 1;
      while($row = mysql_fetch_assoc($this->result))
      {
         $xml .= "  <record row='$count'>\n";
         foreach($row as $key => $val)
         {
            $xml .= "    <$key>$val</$key>\n";
         }
         $xml .= "  </record>\n";
         $count++;
      }
      $xml .= "</data>";
      return($xml);
   }  // end getXml()
   
   /**
   *  Free this MySQL result
   *  @return boolean
   */
   public function free()
   {
      return(mysql_free_result($this->result));
   }  // end free()
   
   /**
   *  Getter for query result resource ID
   *  @return resource
   */
   public function getResultId()
   {
      return($this->result);
   }
   
   /**
   *  Getter for number of result rows
   *  @return integer
   */
   public function getNumRows()
   {
      return($this->numRows);
   }
} 
?>