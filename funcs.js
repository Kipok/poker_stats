$("document").ready(function(){
    $(".card").click(function() {
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
    });
    $("#opps-input").change(function() {
        $('#selector').children().remove();
        $('#selector').append('<option value="yours">you</option>');
        $('#selector').append('<option value="table">table</option>');
        for (i = 1; i <= $(this).val(); i++) {
            var value = "op" + i.toString();
            $('#selector').append($("<option></option>").attr("value", value).text(value));
        }
    })
});

$(function() {
    var form_elem = $('#prob-form');
    var result_field = $("#result-prob");

    $(form_elem).submit(function(event) {
        event.preventDefault();
        var form_data = $(form_elem).serializeArray();
        var cards_you = $.map($(".card-clicked"), function(elem, idx) {
            if ($($(elem).find(".card-posess")[0]).text() === "yours") {
                return $(elem).find("img").first().attr("src").split('/')[1].split('.')[0];
            }
        });
        form_data.push({name: "cards_you", value: cards_you});
        var cards_table = $.map($(".card-clicked"), function(elem, idx) {
            if ($($(elem).find(".card-posess")[0]).text() === "table") {
                return $(elem).find("img").first().attr("src").split('/')[1].split('.')[0];
            }
        });
        form_data.push({name: "cards_table", value: cards_table});        
        for (i = 1; i <= $("#opps-input").val(); i++) {
            var name = "op" + i.toString();
            var cards_op = $.map($(".card-clicked"), function(elem, idx) {
                if ($($(elem).find(".card-posess")[0]).text() === name) {
                    return $(elem).find("img").first().attr("src").split('/')[1].split('.')[0];
                }
            });
            form_data.push({name: "cards_" + name, value: cards_op});
        }
        console.log(form_data);
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
