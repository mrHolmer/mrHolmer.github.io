// Get the elements
var personNameElement = document.getElementById('personName');
var photoElement = document.getElementById('photo');

// Make a request to the PHP file
var xhr = new XMLHttpRequest();
xhr.open('GET', 'random_photo.php', true);
xhr.onreadystatechange = function() {
  if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
    // Process the response
    var response = JSON.parse(xhr.responseText);
    personNameElement.textContent = response.personName;
    photoElement.src = response.randomPhoto;
  }
};
xhr.send();