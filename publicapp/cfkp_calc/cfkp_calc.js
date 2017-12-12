  $( function() {
  /*  $( "#slider-range" ).slider({
      range: false,
      min: 0,
      max: 1000,
      values: [ 300 ],
      slide: function( event, ui ) {
        $( "#amount" ).val( " " + ui.values[ 0 ] );
      }
    });
    $( "#amount" ).val( $( "#slider-range" ).slider( "values", 0 )"" + $( "#slider-range" ).slider( "values", 0 ) );
 

 $( "#period-slider-range" ).slide({
      range: true,
      min: 0,
      max: 30,
      values: [ 5, 10 ],
      slide: function( event, ui ) {
        $( "#period" ).val(  ui.values[0]+'-'+  ui.values[1]);
      }
    });

    $( "#period" ).val(  $( "#period-slider-range" ).slider( "values", 0)+'-'+$( "#period-slider-range" ).slider( "values", 1) );
*/  
 $("#calc").bind('click', function () {

         var  Form = $('#product_filter').serializeArray();
	 var  Formparams = {};
      $.each(Form,
    function(i, v) {
        Formparams[v.name] = v.value;
    });
	var f= get_filter(Formparams);
	
	get_htmldata('view/cfkp_product/undefined',{'filter':f},$("#finding_products"));
		$("#finding_products").show();
		$("#product_filter").hide();
		$("#search").show();
	});

$("#show_search").bind('click', function () {
	//$("#finding_products").show();
	$("#product_filter").show();
	$("#search").hide(); 
	$("#finding_products").hide();
        $("#finding_products").empty();
	});

   

} );

var serializeObject = function(form)
{
   var o = {};
   var a = form.serializeArray();
   $.each(a, function() {
       if (o[this.name]) {
           if (!o[this.name].push) {
               o[this.name] = [o[this.name]];
           }
           o[this.name].push(this.value || '');
       } else {
           o[this.name] = this.value || '';
       }
   });
   return o;
};

    function insertTemplate(container,data) {

        getTemplate('../template/programm_cardlist.ejs', function renderTemplate(err, tpl) {
        if (err) {
            throw err;
        }
	if (!data||!data.rows||data.rows.length==0){
        messagedlg(undefined, "Не найдено вариантов. Попробуйте изменить условия поиска", "error",function(){$("#show_search").click()}) 
	}
	else {
        var formparam = $("form").serialize();
        data['formparam']=formparam ;
        var html = ejs.render(tpl, data);
        $(container).html(html); }
         });
    }
    function getTemplate(file, callback) {
        $.ajax(file, {
            type: 'GET',
            success: function(data, textStatus, xhr) {
            return callback(null, data);
            },
            error: function(xhr, textStatus, error) {
            return callback(error);
            }
        });
    }

function get_htmldata(url,inpdata,container){

	selen_call(url, inpdata, function(val){ 
insertTemplate(container,val)});

};

function get_filter(p ){ 
 // console.log(JSON.stringify(p));
/*{"product":"Кредит",
"msp_nal":"on",
"cost_project":"34",
"percent_owner":"344",
"fin_sum":"333",
"years":"43",
"goal":"Инвестиции в развитие"}
*/
if (p.msp_nal=='on'){p.msp_nal=true} else {p.msp_nal=false};
var prod1,prod2,goal1,goal2;
if (p.product =='Кредит/Займ') {prod1='Кредит';prod2='Займ';} else {prod1=p.product;prod2=p.product;};
if (p.goal =='Капитальные вложения и пополнение оборотных средств') 
	{goal1='Пополнение оборотных средств';goal2='Капитальные вложения';} else {goal1=p.goal;goal2=p.goal;};

var fin_amont=string2money(p.fin_amount)/1000000;
var f =
{ 'and' : [
        { 'and' : [ { 'data.program_criteria.min_sum': { 'lte': fin_amont } }, { 'data.program_criteria.max_sum': { 'gte': fin_amont} } ]  }
       ,{ 'and' : [ { 'data.program.max_month_limit': { 'gte': Number(p.fin_period)} }    ] }
       ,{ 'or' : [ { 'data.program.product': { 'eq': prod1 } },{ 'data.program.product': { 'eq': prod2 } }] }
       ,{ 'or' : [ { 'data.program.goal': { 'eq': goal1 } },{ 'data.program.goal': { 'eq': goal2 } }] }
     ]         
}
//f={};  
return f;
};

function string2money(val)
{
var str = val;
str = str.replace(/[^\d\.\-]/g, ""); // You might also include + if you want them to be able to type it
var num = Number(str);
return num
};
