<?php
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $num_ops = $_POST["num_ops"];
        $cards_chosen = $_POST["cards_chosen"];
        // TODO: validate number of cards
        echo "data: ";
        echo "num_ops = ";
        echo $num_ops;
        echo ", cards_chosen = ";
        echo $cards_chosen;
    } else {
        http_response_code(403);
        echo "There was a problem with your submission, please try again.";
    }
?>

