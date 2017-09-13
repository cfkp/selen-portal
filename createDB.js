rem var mongoose = require('libs/mongoose');

var async = require('async');

async.series([
    open,
    dropDatabase,
    requireModels,
    createComponents
    ], function(err) {
    if (err) throw err;
    console.log(arguments);
    mongoose.disconnect();
});

function open(callback) {
    mongoose.connection.on('open', callback);
}

function dropDatabase(callback) {
    var db = mongoose.connection.db;
rem    db.dropDatabase(callback);
}

function requireModels(callback) {
    require('models/component');

    async.each(Object.keys(mongoose.models), function (modelName, callback) {
        mongoose.models[modelName].ensureIndexes(callback);
    }, callback);
}

function createComponents(callback) {
    var components = [
        {
            name:"form1",
            json:{
                        "initName": {
                            "title": "Наименование инициатора проекта",
                            "type": "string"
                        },
                        "inn": {
                            "description": "ИНН должен состоять из 10-12 цифр",
                            "type": "integer",
                            "title": "ИНН"
                        },
                        "regRf": {
                            "type": "boolean",
                            "title": "Регистрация бизнеса на территории РФ"
                        },
                        "podpis": {
                            "type": "object",
                            "title": "Лицо, уполномоченное на подписание документов",
                            "properties": {
                                "name": {
                                    "type": "string",
                                    "title": "Фамилия"
                                },
                                "gender": {
                                    "type": "string",
                                    "title": "Имя",
                                },
                                "magic": {
                                    "type": "string",
                                    "title": "Отчество",
                                }
                            }
                        },
                        "reasonPodpis": {
                            "title": "Основание для подписания уполномоченным лицом",
                            "type": "string"
                        },
                        "okved": {
                            "title": "ОКВЭД",
                            "type": "string"
                        },
                        "adress": {
                            "title": "Адрес регистрации",
                            "type": "string"
                        },
                        "adressOrg": {
                            "title": "Адрес местонахождения постоянно действующих органов управления, иного органа или лица, которые имеют право действовать от имени клиента",
                            "type": "string"
                        },
                        "okato": {
                            "title": "ОКАТО",
                            "type": "string"
                        } ,
                "okpo": {
                    "title": "ОКПО",
                    "type": "string"
                }


             //       }
            },
                description:"test"}


    ];
    //    {order:0,step:0, name: 'nameInit' , class:'Project', label:'Наименование инициатора проекта', type:'text', required:true },
    //    {order:1,step:0, name: 'inn', label: 'ИНН', type: 'text', isNumber:true, required: true, pattern: '\\d{10,12}',comment:'ИНН должен состоять из 10-12 цифр' },
    //
    //    {order:2,step:0, name: 'rfReg', label:'Регистрация бизнеса на территории РФ', type:'radio', required:true,
    //        options: [{ value: 'Да', checked: false}, { value: 'Нет', checked: false} ]},
    //    {order:3,step:0, name: 'podpis', label: 'Лицо, уполномоченное на подписание документов', type: 'container', contains: [
    //    {order:4,step:0, name: 'surNamePodpis', label: 'Фамилия', type: 'text', required: true },
    //    {order:5,step:0, name: 'namePodpis', label: 'Имя', type: 'text', required: true },
    //    {order:6,step:0, name: 'secondNamePodpis', label: 'Отчество', type: 'text' }    ]},
    //    {order:7,step:0, name: 'reasonPodpis', label:'Основание для подписания уполномоченным лицом', type:'text' },
    //    {order:8,step:0, name: 'okved', label:'ОКВЭД', type:'text' },
    //    {order:9,step:0, name: 'adress', label:'Адрес регистрации', type:'text' },
    //    {order:10,step:0, name: 'adressOrg', label:'Адрес местонахождения постоянно действующих органов управления, иного органа или лица, которые имеют право действовать от имени клиента', type:'text' },
    //    {order:11,step:0, name: 'okato', label:'ОКАТО', type:'AUTO', class :'reference',ref_class :'okato' },
    //    {order:12,step:0, name: 'okpo', label:'ОКПО', type:'text' },
    //
    //    {order:13,step:0, name: 'contact', label: 'Контактное лицо', type: 'container', contains: [
    //        { name: 'surnameContact', label: 'Фамилия', type: 'text', required: true },
    //        { name: 'nameContact', label: 'Имя', type: 'text', required: true },
    //        { name: 'secondNameContact', label: 'Отчество', type: 'text' }    ]},
    //
    //    //{order:14, step:0, name: 'email', label: 'Электронная почта', type: 'email', required: true , pattern:'\\S+@\\S+\\.\\S+'},
    //    //{order:15, step:0, name: 'tel', label: 'Телефон', type: 'tel', required: true, pattern: '\\d{11}' },
    //    //{order:16, step:0, name: 'password', label: 'Пароль', type: 'password', required: true },
    //
    //    {order:16,step:1, name: 'kap', label:'Соответствие требованиям 209 ФЗ по структуре капитала', type:'radio',
    //        options: [{ value: 'Да', checked: false}, { value: 'Нет', checked: false} ]},
    //    {order:17, step:1, name: 'count', label: 'Численность', type: 'number', required: true, pattern: '\\d*'},
    //    {order:18,step:1, name: 'dolg', label:'Отсутствие просроченной задолженности по налогам, сборам', type:'radio',
    //        options: [{ value: 'Да', checked: false}, { value: 'Нет', checked: false} ]},
    //    {order:19,step:1, name: 'bankrot', label:'Не применяются процедуры несостоятельности (банкротства) к компаниям', type:'radio',
    //        options: [{ value: 'Да', checked: false}, { value: 'Нет', checked: false} ]},
    //    {order:20,step:1, name: 'history', label:'Отсутствие отрицательной кредитной истории', type:'radio', required:true,
    //        options: [{ value: 'Да', checked: false}, { value: 'Нет', checked: false} ]},
    //    {order:21,step:1, name: 'info', label:'Готовы раскрывать информацию о текущей деятельности компаний группы', type:'radio',
    //        options: [{ value: 'Да', checked: false}, { value: 'Нет', checked: false} ]},
    //
    //    {order:22,step:2, name: 'groupCompany', label: 'Компания принадлежит к группе компаний', type: 'collection',value:'0',
    //        options: [{ value: 'Да', checked: false , event:1}, { value: 'Нет', checked: false} ],
    //        contains: [
    //        { name: 'nameGroupCompany', label: 'Наименование компании', type: 'text', required: false },
    //        { name: 'innGroupCompany', label: 'ИНН компании', type: 'text', required: false, pattern: '\\d{10,12}' }
    //        ]},
    //    {order:23, step:3, name: 'cashlast', isNumber:true, label: 'Выручка на последнюю годовую дату', type: 'text',  pattern: '\\d*'},
    //    {order:24, step:3, name: 'cashPrelast', isNumber:true, label: 'Выручка на предпоследнюю годовую дату', type: 'text',  pattern: '\\d*'},
    //    {order:25, step:3, name: 'countLast', isNumber:true, label: 'Штатная численность на последнюю годовую дату', type: 'text',  pattern: '\\d*'},
    //    {order:26, step:3, name: 'countPreLast', isNumber:true, label: 'Штатная численность на предпоследнюю годовую дату', type: 'text',  pattern: '\\d*'}
    //];

    async.each(components, function (componentData, callback) {
        var component = new mongoose.models.Component(componentData);
        component.save(callback);
    }, callback)
}


