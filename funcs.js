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

$(function() {
    var form_elem = $('#prob-form');
    var result_field = $("#result-prob");

    $(form_elem).submit(function(event) {
        event.preventDefault();
        var cards_chosen = $.map($(".card-clicked"), function(elem, idx) {
          return $(elem).find("img").first().attr("src").split('/')[1].split('.')[0];
        });
        var form_data = $(form_elem).serializeArray();
        form_data.push({name: "cards_chosen", value: cards_chosen});
        $.ajax({
            type: 'POST',
            url: $(form_elem).attr('action'),
            data: $.param(form_data)
        }).done(function(response) {
            $(result_field).text(response);
        }).fail(function(data) {
            if (data.responseText !== '') {
                $(result_field).text(data.responseText);
            } else {
                $(result_field).text('Something went wrong..');
            }
        });
    });
});
