$("document").ready(function(){
    $(".card").click(
    function() {
        var posession = $("#selector").val();
        var num_clicked = 0;
        $(".card-clicked").each(function(idx)  {
            if ($($(this).find(".card-posess")[0]).text() === posession) {
                num_clicked += 1;
            }
        });
        var limit = 2;
        if (posession === "table") {
            limit = 5;
        }
        if (num_clicked < limit && $(this).hasClass("card")) {
            $(this).removeClass("card").addClass("card-clicked");
            $($(this).find(".card-posess")[0]).text(posession);
        } else {
            if ($(this).hasClass("card-clicked")) {
                $(this).removeClass("card-clicked").addClass("card");
                $($(this).find(".card-posess")[0]).text("");
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
