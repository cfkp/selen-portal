$(document).ready(function(){

$('.upload-btn').on('click', function (){
    $('#upload-input').click();
});

});


function uploadfile(obj){

  var files = $(obj).get(0).files;

  if (files.length > 0){
    // create a FormData object which will be sent as the data payload in the
    // AJAX request
    var formData = new FormData();

    // loop through all the selected files and add them to the formData object
    for (var i = 0; i < files.length; i++) {
      var file = files[i];

      // add the files to formData object for the data payload
      formData.append('uploads[]', file, file.name);
    }
  var main_div= $(obj).parent();

  var  progress = main_div.find('.progress');
  var  progress_bar = progress.find('.progress-bar');
  var inp =main_div.find('.file_name');

   // $('.progress-bar').text('0%');
   // $('.progress-bar').width('0%');
    progress.show();

    progress_bar.text('0%');
    progress_bar.width('0%');

    $.ajax({
      url: 'load/up',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function(data){
          console.log('upload successful!\n' + data);
		var url;
		if (JSON.parse(data).serverfilename){url='load/down/'+JSON.parse(data).serverfilename}
          $(inp).attr("value",JSON.stringify({"name":file.name,"url":url,"type":file.type,"size":file.size}));
		inp.change();
	var fileurl=main_div.find('.fileurl');			
 		 fileurl.text(file.name+' ('+ Math.ceil(file.size/1024)+'kB)');
          fileurl.attr('href',url);
      },
      xhr: function() {
        // create an XMLHttpRequest
        var xhr = new XMLHttpRequest();

        // listen to the 'progress' event
        xhr.upload.addEventListener('progress', function(evt) {

          if (evt.lengthComputable) {
            // calculate the percentage of upload completed
            var percentComplete = evt.loaded / evt.total;
            percentComplete = parseInt(percentComplete * 100);

            // update the Bootstrap progress bar with the new percentage
            $(progress_bar).text(percentComplete + '%');
            $(progress_bar).width(percentComplete + '%');

            // once the upload reaches 100%, set the progress bar text to done
            if (percentComplete === 100) {
              $(progress_bar).html('Done');
            }

          }

        }, false);

        return xhr;
      }
    });

  }
 
};
