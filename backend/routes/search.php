<?php
declare(strict_types=1);

global $ROUTES;
if (!isset($ROUTES)) { $ROUTES = []; }

route('GET', '/search/users', function () {
    $controller = new searchController();
    return $controller->users($_GET);
});

route('GET', '/search/jobs', function () {
    $controller = new searchController();
    return $controller->jobs($_GET);
});

?>

