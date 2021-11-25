<?php
ini_set('memory_limit', '1024M');
ini_set('max_execution_time', 0);

// database
require './config/config.php';

$updateAuthority = "7TcHRgDaSVaYEqLZRWmu1udsFiEUcf9Fs6qeFZzvGAv7";
$metabossPath = realpath(dirname(__FILE__).'/../bin') ;
//echo $metabossPath ;
//echo dirname(__FILE__) ;
chdir($metabossPath);
if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
    shell_exec("metaboss -r https://api.mainnet-beta.solana.com snapshot mints --update-authority $updateAuthority");
} else {
    // run 'visudo'
    // add line at the end 'www-data ALL=NOPASSWD: /var/www/html/mint/bin/metaboss'
    exec("sudo ./metaboss -r https://api.mainnet-beta.solana.com snapshot mints --update-authority $updateAuthority --output $metabossPath 2>&1");
}
$mintList = json_decode(file_get_contents("./{$updateAuthority}_mint_accounts.json", True));

$existMintList = [];
$rs = mysqlQuery("SELECT * FROM nft_mint_list");
if ($rs->result->num_rows > 0) {
    $rows = mysqli_fetch_all($rs->result, MYSQLI_ASSOC);
    $existMintList = array_column($rows, 'mintAddress');
}

$newMintList = array_diff($mintList, $existMintList);
echo json_encode($newMintList) . PHP_EOL;
foreach ($newMintList as $newMintAddress) {

    $sqlQuery = sqlUpdateOrInsert('nft_mint_list', array(
        'mintAddress' => $newMintAddress
    ));

    $rs = mysqlQuery($sqlQuery);

    if ($rs->result === true) {
        echo 'db ok' . PHP_EOL;
    } else {
        echo 'db fail' . PHP_EOL;
    }
}

header("Location: fetchMetadata.php");
exit();

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