var SelenLogin = function () {
    var displaySignUpForm = function () {
        $(".registrate").show();
        $(".login").hide();
        $(".reset-pass").hide();
    };

    var displayForgetPasswordForm = function () {
        $(".reset_pass").show();
        $(".login").hide();
        $(".registrate").hide();
    };

    var cancelClick = function () {
        $(".reset_pass").hide();
        $(".login").show();
        $(".registrate").hide();
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
    };

    var handleFormSwitch = function () {
        $('#show_reset_pass').click(function (e) {
            e.preventDefault();

            displayForgetPasswordForm();
        });

        $('#show_registation').click(function (e) {
            e.preventDefault();
            displaySignUpForm();
        });
        $('#login_cancel').click(function (e) {
            e.preventDefault();
            cancelClick();
        });

    };


    var dologin = function (form) {
        //alert('o');
        // var form = $(this);


        $('.error', form).html('');
        $(":submit", form).button("loading");

        $('#loading').show();

        $.ajax({
            url: "/login",
            type: "POST",
            dataType: 'json',

            data: form.serialize(),

            complete: function () {
                $('#loading').hide();
                $(":submit", form).button("reset");
            },
            statusCode: {
                200: function (dataresponse) {
                    if (dataresponse) {
                        SelenUtil.messagedlg(JSON.stringify(dataresponse), "Данные сохранены", "message",
                            function () {
                                //window.location.href = "/";
                            let returnUrl=getURLparam('returnUrl');    
                            if (returnUrl) {
                                window.location.href = returnUrl;
                            }
                            else {    window.location.href = "/";
                            }
    
                            
                            //window.location.href = "/";
/*                                if (sessionStorage.getItem("previousUrl") != null) {
                                    var oldURL = sessionStorage.getItem("previousUrl");
                                    window.history.back();
                                } else {
                                    window.location.href = "/";
                                }*/
                            }
                        );
                    };

                },
                403: function (dataresponse) {
                    SelenUtil.messagedlg(dataresponse.responseText);
                }
            }
        });

    };




    var init = function () {
        handleFormSwitch();
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

        $('#tel').inputmask("+7-999-999-99-99"); //static mask 
    };

    //== Public Functions
    return {
        // public functions
        init: init
    };

}();
//== Class Initialization
jQuery(document).ready(function () {
    SelenLogin.init();
});
