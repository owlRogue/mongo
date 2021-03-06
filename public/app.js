// // Grab the codes as a json
// $.getJSON("/codes", function(data) {
//   // For each one
//   for (var i = 0; i < data.length; i++) {
//     // Display the apropos information on the page
//     // $("#codes").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].description + "</p>");
//     $("#codes").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + "</p>");
//   }
// });


$(document).ready (

  $.getJSON("/all", function(data) {
    displayResults(data);
  })
);

function displayResults(data) {
  data.forEach((i) => {
    console.log(JSON.stringify(i));
    $("#results tbody").append(
      $(`<tr>
          <td>${i._id}</td>
          <td>${i.title}</td>
          <td>${i.description}</td>
          <td>${i.note}</td>
          </tr>`)
    );
  })
}


$('#call-codes').on("click", function(event){
  event.preventDefault();

  $.getJSON("/scrape", function(data){
      displayResults(data)
    })
    $('tbody').empty();
    $.getJSON("/codes", function(data){
      displayResults(data)
    })
  })

$('#code-title').on("click", function(event){
  event.preventDefault();

  $('tbody').empty();
  $.getJSON("/codes", function(data){
    displayResults(data)
  })

})

$(' #code-sort').on("click", function(event){
  event.preventDefault();

  $('tbody').empty();
  $.getJSON("/codes", function(data){
    displayResults(data)
  })

})

// $('#weight-sort').on("click", function(event){
//   event.preventDefault();

//   $('tbody').empty();
//   $.getJSON("/weight", function(data){
//     displayResults(data)
//   })

// })

// Whenever someone clicks a p tag
$(document).on("click", "tr", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the ICD10
  $.ajax({
    method: "GET",
    url: "/codes/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/codes/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});