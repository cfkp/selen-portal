  $( function() {
    $( "#slider-range" ).slider({
      range: true,
      min: 0,
      max: 1000,
      values: [ 0, 1000 ],
      slide: function( event, ui ) {
        $( "#amount" ).val( " " + ui.values[ 0 ] + " - " + ui.values[ 1 ] );
      }
    });
    $( "#amount" ).val( "" + $( "#slider-range" ).slider( "values", 0 ) +
      " - " + $( "#slider-range" ).slider( "values", 1 ) );
 

 $( "#period-slider-range" ).slider({
      range: true,
      min: 0,
      max: 20,
      values: [ 0, 7 ],
      slide: function( event, ui ) {
        $( "#period" ).val( " " + ui.values[ 0 ] + " - " + ui.values[ 1 ] );
      }
    });
    $( "#period" ).val( "" + $( "#period-slider-range" ).slider( "values", 0 ) +
      " - " + $( "#period-slider-range" ).slider( "values", 1 ) );
  
 	$("#calc").bind('click', function () {
		$("#finding_products").show();
		$("#product_filter").hide();
		$("#search").show();
	});

$("#show_search").bind('click', function () {
	//$("#finding_products").show();
	$("#product_filter").show();
	$("#search").hide();
	});

   

} );
