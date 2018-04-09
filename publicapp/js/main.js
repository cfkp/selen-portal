 var bf;
 var BrutusinForms;
 var selen_obj = {};
 var selen_meth = {};
 var selen_view = {};
 var main_menu = {};
 var enjoyhint_instance = null;

 var enjoyhint_script_data = [
     {
         description: 'Для оформления заявки необходимо создать заявку',
         event: 'next',
         selector: '#menu_person_request',
         // shape:'circle',
         nextButton: {
             className: "myNext",
             text: "Конечно!"
         },
         skipButton: {
             className: "mySkip",
             text: "Обойдусь"
         },
         showSkip: true,

         showNext: true
},

     {
         description: 'Заполнить данные',

         selector: '#sln_cntrequest_detail_menu',
         // shape:'circle',
         showNext: true,
         event: 'next',
         'nextButton': {
             className: "myNext",
             text: "Конечно!"
         },
         'skipButton': {
             className: "mySkip",
             text: "Обойдусь"
         },
         timeout: 100
        }

      ];


 $(document).ready(function () {


     window.addEventListener('error', function (e) {

         var error = e.error;
         $('#loading').hide();

         if ((error && error.name && error.name === 'SelenError' || error instanceof SelenError) &&
             (error.errobj.error !== 'not_authorized')) {
             SelenUtil.messagedlg(error.errobj);

         } else if (error && error.name && error.name === 'SelenError' && error.errobj.error == 'not_authorized') {
             let returnUrl = window.location.pathname;

             if (window.location.search.length > 0) {
                 returnUrl += window.location.search;
             }

             returnUrl = encodeURIComponent(returnUrl);

             window.location.href = '/login?returnUrl=' + returnUrl;

             ///   window.location = '/login';
         } else {
             SelenUtil.messagedlg(undefined, error.stack);
         };
     });



     BrutusinForms = brutusin["json-forms"];
     BrutusinForms.bootstrap.addFormatDecorator("file", "file", "glyphicon-search",
         function (element) {
             var main_div = $(element).parent();
             main_div.find('.file_control').click();

         });
     BrutusinForms.bootstrap.addFormatDecorator("color", "color");
     BrutusinForms.bootstrap.addFormatDecorator("date", "date");

     
     if (window.opener) {
         selen_meth = new SelenMethod(undefined, window.opener.method_call.meta_class, window.opener.method_call.meta_meth, null, window.opener.method_call.def_data);

     }
     /*history.pushState(null, null,window.location.origin+window.location.pathname+'?inn=87878787');*/
     if (window.location.pathname !== '/login' && window.location.pathname !== '/cfkp_calculate.html' && window.location.pathname !== '/main.html' && !window.opener) {
         main_menu = new SelenMenu(undefined, 'main_menu');
     }
     if (window.location.pathname == '/main.html') {

         var action = getURLparam('action');
         var meta_class = getURLparam('meta_class');
         var meta_name = getURLparam('meta_name');
         var filter = getURLparam('filter');
         var def_data = getURLparam('def_data');
         if (action == 'view') {
             selen_view = new SelenView($('body'), meta_class, meta_name, filter);
         } else if (action == 'method') {
             selen_meth = new SelenMethod(undefined, meta_class, met_name, null, window.opener.method_call.def_data);

         } else {
             main_menu = new SelenMenu(undefined, 'main_menu');
         };

     }

     enjoyhint_instance = new EnjoyHint({});
     enjoyhint_instance.setScript(enjoyhint_script_data);


 });

 function starthelp() {
     enjoyhint_instance.runScript();
 };
