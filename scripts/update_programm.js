//connect to the madMen database
var db = connect('127.0.0.1:27017/first'),
    programs = null;

print('Find programm');


//search for the document whose name property is: "Don Draper"
db.cfkp_product.find().forEach( function(thisDoc) {
  /*if(thisDoc.name === 'Don Draper'){
    //update the record that contains "Donald Draper" and change it to "Dick Whitman"
    db.names.update( { "_id" : thisDoc._id }, { "name": "Dick Whitman" } );
  };*/
print(thisDoc._id);
print(thisDoc.data.program.institute);
print(thisDoc.data.program.max_year_limit);
var new_institute,new_year;
if (thisDoc.data.program.institute=='КМСП') {new_institute='Корпорация МСП'}
else if (thisDoc.data.program.institute=='МСПБ') {new_institute='МСП Банк'}
else {new_institute=thisDoc.data.program.institute};	 
print('new inst '+new_institute);
   
new_year= thisDoc.data.program.max_year_limit*12;
print('new year '+new_year);
db.cfkp_product.update( { "_id" : thisDoc._id }, { $set:{ "data.program.institute": new_institute, "data.program.max_month_limit":new_year}} );

});

 