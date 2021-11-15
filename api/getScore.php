<?php
ini_set('memory_limit', '1024M');

// database
require './config/config.php';

$conn = mysqlConnect();
$walletAddress = getgpc('walletAddress');
$page = getgpc('page') ? intval(getgpc('page')) : 1;

//$returnArray = [];
//
//foreach ($addressArray as $address) {
//    unset($data);
//
//    $address = mysql_escape($address);
//    $rs = mysqlQuery("SELECT * FROM nft_raw_data WHERE mintAddress = '{$address}'");
//
//    if ($rs->result->num_rows > 0) {
//        $row = mysqli_fetch_all($rs->result, MYSQLI_ASSOC)[0];
//
//
//        $returnArray[] = [
//            'id' => $row['id'],
//            'image' => $row['image'],
//            'name' => $row['name'],
//            'mintAddress' => $row['mintAddress'],
//        ];
//    }
//}

try {
    $dbh = mysqlPDOConnect();
    $table = 'contest_leaderboard';
    // Find out how many items are in the table
    $total = $dbh->query('
        SELECT
            COUNT(*)
        FROM
            contest_leaderboard
    ')->fetchColumn();

    // How many items to list per page
    $limit = 1;

    // How many pages will there be
    $pages = ceil($total / $limit);

    // What page are we currently on?
    $page = min($pages, filter_input(INPUT_POST, 'page', FILTER_VALIDATE_INT, array(
        'options' => array(
            'default' => 1,
            'min_range' => 1,
        ),
    )));

    // Calculate the offset for the query
    $offset = ($page - 1) * $limit;

    // Some information to display to the user
    $start = $offset + 1;
    $end = min(($offset + $limit), $total);

    // The "back" link
    $prevlink = ($page > 1) ? '<a href="#" data-page="1" title="First page">&laquo;</a> <a href="#" data-page="' . ($page - 1) . '" title="Previous page">&lsaquo;</a>' : '<span class="disabled">&laquo;</span> <span class="disabled">&lsaquo;</span>';

    // The "forward" link
    $nextlink = ($page < $pages) ? '<a href="#" data-page="' . ($page + 1) . '" title="Next page">&rsaquo;</a> <a href="#" data-page="' . $pages . '" title="Last page">&raquo;</a>' : '<span class="disabled">&rsaquo;</span> <span class="disabled">&raquo;</span>';

    // Display the paging information
    echo '<div id="paging"><p>', $prevlink, ' Page ', $page, ' of ', $pages, ' pages, displaying ', $start, '-', $end, ' of ', $total, ' results ', $nextlink, ' </p></div>';

    // Prepare the paged query
    $stmt = $dbh->prepare('
        SELECT
            *
        FROM
            contest_leaderboard
        ORDER BY
            highestScore DESC
        LIMIT
            :limit
        OFFSET
            :offset
    ');

    // Bind the query params
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    // Do we have any results?
    if ($stmt->rowCount() > 0) {
        // Define how we want to fetch the results
        $stmt->setFetchMode(PDO::FETCH_ASSOC);
        $iterator = new IteratorIterator($stmt);

        // Display the results
        foreach ($iterator as $row) {
            echo '<p>', $row['walletAddress'], ' - ', $row['highestScore'], '</p>';
        }

    } else {
        echo '<p>No results could be displayed.</p>';
    }

} catch (Exception $e) {
    echo '<p>', $e->getMessage(), '</p>';
}

//echo json_encode($returnArray);

function mysqlConnect()
{
    // Create connection
    $conn = new mysqli(mysql_servername, mysql_username, mysql_password, mysql_dbname);
    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    } else {
        return $conn;
    }
}

function mysqlQuery($query)
{
    $_this = new StdClass();
    $_this->conn = mysqlConnect();
    $_this->conn->set_charset("utf8mb4");
    $_this->query = $query;
    $_this->result = $_this->conn->query($_this->query);
    if ($_this->result === true) {
        $_this->insert_id = $_this->conn->insert_id;
    }
    $_this->conn->close();
    return $_this;
}

function sqlUpdateOrInsert($tableName, array $args = array())
{
    $const = 'constant';
    $valuesUpdate = '';

    if (count($args) > 0) {

        $fields = implode(",", array_keys($args));
        foreach (array_values($args) as $value) {
            if ($value === 'NULL' || $value === NULL) {
                $values[] = 'NULL';
            } elseif (is_array($value)) {
                $json = json_encode($value, JSON_NUMERIC_CHECK);
                $values[] = "'{$json}'";
            } else {
                $values[] = "'{$value}'";
            }
        }
        $values = implode(',', $values);
        foreach (array_keys($args) as $key) {
            $valuesUpdate .= "$key = VALUES($key),";
        }
        $valuesUpdate = rtrim($valuesUpdate, ',');
        $sql = <<<SQL
        INSERT INTO {$const('mysql_prefix')}$tableName ({$fields})
        VALUES ({$values})
        ON DUPLICATE KEY 
        UPDATE {$valuesUpdate}
SQL;
        return $sql;
    }

}

function mysqlPDOConnect()
{

    $mysql_servername = mysql_servername;
    $mysql_dbname = mysql_dbname;
    $dbms = 'mysql';
    $dsn = "$dbms:host={$mysql_servername};dbname={$mysql_dbname}";


    try {
        $dbh = new PDO($dsn, mysql_username, mysql_password); //初始化一个PDO对象
        /*你还可以进行一次搜索操作
        foreach ($dbh->query('SELECT * from FOO') as $row) {
            print_r($row); //你可以用 echo($GLOBAL); 来看到这些值
        }
        */
        return $dbh;
    } catch (PDOException $e) {
        die ("Error!: " . $e->getMessage() . "<br/>");
    }
}


function getgpc($k, $type = 'GP')
{
    $type = strtoupper($type);
    switch ($type) {
        case 'G':
            $var = &$_GET;
            break;
        case 'P':
            $var = &$_POST;
            break;
        case 'C':
            $var = &$_COOKIE;
            break;
        default:
            if (isset($_GET[$k])) {
                $var = &$_GET;
            } else {
                $var = &$_POST;
            }
            break;
    }
    return isset($var[$k]) ? mysql_escape($var[$k]) : NULL;
}

function less_getgpc($k, $type = 'GP')
{
    $type = strtoupper($type);
    switch ($type) {
        case 'G':
            $var = &$_GET;
            break;
        case 'P':
            $var = &$_POST;
            break;
        case 'C':
            $var = &$_COOKIE;
            break;
        default:
            if (isset($_GET[$k])) {
                $var = &$_GET;
            } else {
                $var = &$_POST;
            }
            break;
    }
    return isset($var[$k]) ? $var[$k] : NULL;
}

function mysql_escape($string)
{
    return mysqli_real_escape_string(mysqlConnect(), $string);
}

function isJSON(...$args)
{
    json_decode(...$args);
    return (json_last_error() === JSON_ERROR_NONE);
}