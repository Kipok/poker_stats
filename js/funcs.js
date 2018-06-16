card2idx = {
  "2C": 1, "2D": 2, "2H": 3, "2S": 4,
  "3C": 5, "3D": 6, "3H": 7, "3S": 8,
  "4C": 9, "4D": 10, "4H": 11, "4S": 12,
  "5C": 13, "5D": 14, "5H": 15, "5S": 16,
  "6C": 17, "6D": 18, "6H": 19, "6S": 20,
  "7C": 21, "7D": 22, "7H": 23, "7S": 24,
  "8C": 25, "8D": 26, "8H": 27, "8S": 28,
  "9C": 29, "9D": 30, "9H": 31, "9S": 32,
  "10C": 33, "10D": 34, "10H": 35, "10S": 36,
  "JC": 37,  "JD": 38, "JH": 39, "JS": 40,
  "QC": 41,  "QD": 42, "QH": 43, "QS": 44,
  "KC": 45,  "KD": 46, "KH": 47, "KS": 48,
  "AC": 49,  "AD": 50, "AH": 51, "AS": 52
}

idx2card = {}
for (var key in card2idx) {
    if (card2idx.hasOwnProperty(key)) {           
        idx2card[card2idx[key]] = key;
    }
}


function calc_prob(game_info) {
    console.log(game_info);
    var hand = game_info["cards_you"];
    var table = game_info["cards_table"];
    var ids_used = [];
    for (var key in game_info) {
        if (!game_info.hasOwnProperty(key)) {
            continue;
        }
        if (key === "num_ops")  {
            continue;
        }
        for (var i = 0; i < game_info[key].length; i++) {
            ids_used.push(card2idx[game_info[key][i]]);
        }
    }
    ids_used.sort(function(a, b){return a - b});
    var ids_left = [];
    var j = 0;
    for (var i = 1; i <= 52; i++) {
        if (i === ids_used[j]) {
            ++j;
            continue;
        }
        ids_left.push(i);
    }
    return ids_left;
}


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
        var game_info = {};
        for (var i = 0; i < form_data.length; i++){
          game_info[form_data[i]['name']] = form_data[i]['value'];
        }

        console.log(calc_prob(game_info));
//        $(result_field).text(card2idx(game_info["cards_you"][0]));
//        $.ajax({
//            type: 'POST',
//            url: $(form_elem).attr('action'),
//            data: $.param(form_data)
//        }).done(function(response) {
//            $(result_field).text(response);
//        }).fail(function(data) {
//            if (data.responseText !== '') {
//                $(result_field).text(data.responseText);
//            } else {
//                $(result_field).text('Something went wrong..');
//            }
//        });
    });
});


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
