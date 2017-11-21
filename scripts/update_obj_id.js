//connect to the madMen database
var db = connect('127.0.0.1:27017/first'),
    programs = null;

print('Find programm');

var collections = db.getCollectionNames();
for(var i = 0; i< collections.length; i++) {    
   print('Collection: ' + collections[i]); // print the name of each collection
if (collections[i]!=='system.indexes'){
//if (collections[i]=='users'){

   db.getCollection(collections[i]).find().forEach(
		function(thisDoc) {
		 print(thisDoc._id);
		print(typeof thisDoc._id);
		if (typeof thisDoc._id=='object'){
		 var new_id=thisDoc._id.valueOf();
		print('update '+ new_id);
		thisDoc.this_meta_class=collections[i];

		thisDoc._id= new_id;
		db.getCollection(collections[i]).deleteOne( { "_id" : ObjectId(thisDoc._id )});

		db.getCollection(collections[i]).save(thisDoc);

		}
		else {db.getCollection(collections[i]).update({},{$set:{this_meta_class:collections[i]}});}
	}
	); //and then print     the json of each of its elements
}
}

//search for the document whose name property is: "Don Draper"
/*db.messages.find().forEach( function(thisDoc) {
 print(thisDoc._id);
print(typeof thisDoc._id);
if (typeof thisDoc._id=='object'){
 var new_id=thisDoc._id.valueOf();
print('update '+ new_id);
thisDoc._id= new_id;
db.messages.save(thisDoc);
db.messages.deleteOne( { "_id" : ObjectId(thisDoc._id )});

}
}); */

    