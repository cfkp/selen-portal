var showReg = function (obj) {
    $(".registrate").show();
    $(obj).parents(".registrate").hide();
};

var showReset = function (obj) {
    $(".reset_pass").show();
    $(obj).parents(".registrate").hide();
};

var checkPassword = function (obj) {
    var pass = $('[name="password"]', $(obj).parents("form")).val();
    var passRep = $(obj).val();
    if (pass == passRep) {
        $(obj).siblings(".help-block").show();
        $(obj).siblings(".help-block").text("Пароли совпадают");
        $(obj).parent().addClass("has-success");
        $(obj).parent().removeClass("has-error");
    } else {
        $(obj).siblings(".help-block").show();
        $(obj).siblings(".help-block").text("Внимание! Пароли не совпадают");
        $(obj).parent().removeClass("has-success");
        $(obj).parent().addClass("has-error");
    }
}

var dologin = function (form) {
    //alert('o');
    // var form = $(this);


    $('.error', form).html('');
    $(":submit", form).button("loading");


    $.ajax({
        url: "/login",
        type: "POST",
        dataType: 'json',

        data: form.serialize(),

        complete: function () {
            $(":submit", form).button("reset");
        },
        statusCode: {
            200: function (dataresponse) {
                if (dataresponse) {
                    messagedlg(JSON.stringify(dataresponse), "Данные сохранены", "message",
                        function () {
                            window.location.href = "/";
                        }
                    );
                };

            },
            403: function (dataresponse) {
                messagedlg(dataresponse.responseText);
            }
        }
    });

};

$(document).ready(function () {

    $(document.forms['login-form']).on('submit', function () {
        dologin($(document.forms['login-form']));
        return false;
    });
    $(document.forms['reg-form']).on('submit', function () {
        dologin($(document.forms['reg-form']));
        return false;
    });
    $(document.forms['resetpass-form']).on('submit', function () {
        dologin($(document.forms['resetpass-form']));
        return false;
    });

    $('#agree_rules').change(function () {
        $('#reg_submit').prop('disabled', !this.checked);
    });

    $('#agree').change(function () {
        $('#resetpass_submit').prop('disabled', !this.checked);
    });
});

//$(document.forms['reg-form']).on('submit',postData, true );
