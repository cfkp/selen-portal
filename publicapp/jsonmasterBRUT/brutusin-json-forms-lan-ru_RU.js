if ("undefined" === typeof brutusin || "undefined" === typeof brutusin["json-forms"]) {
    throw new Error("brutusin-json-forms-bootstrap.js requires brutusin-json-forms.js");
}
(function () {
    var BrutusinForms = brutusin["json-forms"];

    BrutusinForms.messages = {
        "validationError": "Ошибка проверки",
        "required": "Укажите **обязательное** поле",
        "invalidValue": "Ошибка значения",
        "addpropNameExistent": "Это свойство уже присутствует в форме",
        "addpropNameRequired": "A name is required",
        "minItems": "Возможно не менее `{0}` позиций",
        "maxItems": "Возможно не более `{0}` позиций",
        "pattern": "Не верное значение по шаблону: `{0}`",
        "minLength": "Минимальное  количество сиволов  `{0}`",
        "maxLength": "Максимальное количество символов  `{0}`",
        "multipleOf": "Значение должно делиться на  `{0}`",
        "minimum": "Значение должно быть **больше или равно** `{0}`",
        "exclusiveMinimum": "Значение должно быть **больше** `{0}`",
        "maximum": "Значение должно быть **меньше или равно** `{0}`",
        "exclusiveMaximum": "Значение должно быть **меньше** `{0}`",
        "minProperties": "At least `{0}` properties are required",
        "maxProperties": "At most `{0}` properties are allowed",
        "uniqueItems": "Значение должно быть уникально",
        "addItem": "Добавить",
        "true": "Да",
        "false": "Нет"
    };
}());
