  $( function() {
    $( "#slider-range" ).slider({
      range: false,
      min: 0,
      max: 1000,
      values: [ 300 ],
      slide: function( event, ui ) {
        $( "#amount" ).val( " " + ui.values[ 0 ] );
      }
    });
    $( "#amount" ).val( $( "#slider-range" ).slider( "values", 0 )/*"" + $( "#slider-range" ).slider( "values", 0 )*/ );
 

 $( "#period-slider-range" ).slider({
      range: true,
      min: 0,
      max: 30,
      values: [ 5, 10 ],
      slide: function( event, ui ) {
        $( "#period" ).val(  ui.values[0]+'-'+  ui.values[1]);
      }
    });

    $( "#period" ).val(  $( "#period-slider-range" ).slider( "values", 0)+'-'+$( "#period-slider-range" ).slider( "values", 1) );
  
 $("#calc").bind('click', function () {

	
	var f= get_filter($( "#amount" ).val(),$( "#period" ).val().split('-'),$( "#group_invest" ).val());
	
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



    function insertTemplate(container,data) {
        getTemplate('../template/programm_cardlist.ejs', function renderTemplate(err, tpl) {
        if (err) {
            throw err;
        }
        var html = ejs.render(tpl, data);
        $(container).html(html);
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
	selen_call(url, inpdata, function(val){insertTemplate(container,val)});

};

function get_filter(amount,years,group_program){ 
amount=Number(amount);                                                                                      
years[0]=Number(years[0]);
years[1]=Number(years[1]);

var f =
{
     'and' : [
        { 'and' : [ { 'data.program_criteria.min_sum': { 'lte': amount } }, { 'data.program_criteria.max_sum': { 'gte': amount } } ]  }
       , { 'and' : [ { 'data.program.max_year_limit': { 'gte': years[0] } }, { 'data.program.max_year_limit': { 'lte': years[1] } } ] }
       , { 'and' : [ { 'data.program.group_program': { 'eq': group_program } }] }
    ]         
}

return f;
};
