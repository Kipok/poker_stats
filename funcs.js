$("document").ready(function(){
    $(".card").click(
    function() {
        var num_clicked = $(".card-clicked").length;
        if (num_clicked < 2 && $(this).hasClass("card")) {
            $(this).removeClass("card").addClass("card-clicked");
        } else {
            if ($(this).hasClass("card-clicked")) {
                $(this).removeClass("card-clicked").addClass("card");
            }
        }
       // }
    });
});