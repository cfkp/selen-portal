/**
 * Created by lexusrules on 18.03.17.
 */


var loadForm = function(datajson) {
//    var schema =JSON.parse(datajson.responseText)[1].schema.json;
    var schema =JSON.parse(datajson.responseText)[1].schema;
    var value = JSON.parse(datajson.responseText)[0].value;
    $('form').jsonForm({
        "schema":schema,
        "value":value,
        onSubmit:function(errors,values){
            if (errors){
                alert("Ошибка");
            }
            else {
                var data ={};
               // data =JSON.stringify(values);
                data = values;
                $.ajax({
                    url: "/generateForm/save",
                    method: "POST",
                    dataType:'application/json',
                    data: values,
                    statusCode: {
                        200: function() {
                        },
                        403: function(jqXHR) {
//			 $("#modal_result").html('error : ' + JSON.stringify(response)).dialog('open');
                        }
                    }
                });
            }
        },
        "validate": false
    });
    $('.form-actions').hide();
};

var loadError = function(jqXHR) {
    var  error = "";
    var split = jqXHR.responseText.split(':');
    if (split.length>0)
        error = split[split.length-1];
    //   var text =JSON.stringify(jqXHR.responseText);
    // var error = JSON.parse(jqXHR.responseText);
    $('.error', form).html(error);
    $('.error', form).parent().addClass("has-error")
};
