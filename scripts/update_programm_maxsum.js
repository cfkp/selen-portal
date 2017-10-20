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
print(thisDoc.data.program.product);
print(thisDoc.data.program_criteria.max_sum);
var new_institute,new_year;
var new_max_sum;
if (!thisDoc.data.program_criteria.max_sum||thisDoc.data.program_criteria.max_sum==0) {new_max_sum=5000;
print('set 5000');
    
db.cfkp_product.update( { "_id" : thisDoc._id }, { $set:{ "data.program_criteria.max_sum": new_max_sum}} );
};
if (!thisDoc.data.program_criteria.min_sum||thisDoc.data.program_criteria.min_sum==0) {
print('set min 5000');
    
db.cfkp_product.update( { "_id" : thisDoc._id }, { $set:{ "data.program_criteria.min_sum": 0}} );
};
});

 