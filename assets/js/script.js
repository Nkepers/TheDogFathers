var dogsApi = 'https://api.thedogapi.com/v1/breeds';
var findYourPet = new petfinder.Client({ apiKey: "kj4lrb83WGM3w4ST4wljxWBjnfZy9hrXSGrcWlmbvSfxcdue0Y", secret: "HqQk8xetIsYSaFtXSPQvBbzoxDA7J2IWOCB2tzEo" });
var pastSearch = [];
var selectedBreed = '';

function getDogsApi() {
    fetch(dogsApi, {

    })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data)
        });
};

// Setup the Controls
var $breed_select = $('select.breed_select');
$breed_select.change(function () {
    var id = $(this).children(":selected").attr("id");
    getDogByBreed(id)
});
// Load all the Breeds
function getBreeds() {
    ajax_get('https://api.thedogapi.com/v1/breeds', function (data) {
        populateBreedsSelect(data)
    });
};

// Put the breeds in the Select control
function populateBreedsSelect(breeds) {
    $breed_select.empty().append(function () {
        var output = '';
        $.each(breeds, function (key, value) {
            output += '<option id="' + value.id + '">' + value.name + '</option>';
        });
        return output;
    });
};

// triggered when the breed select control changes
function getDogByBreed(breed_id) {
    // search for images that contain the breed (breed_id=) and attach the breed object (include_breed=1)
    ajax_get('https://api.thedogapi.com/v1/images/search?include_breed=1&breed_id=' + breed_id, function (data) {

        if (data.length == 0) {
            // if there are no images returned
            clearBreed();
            $("#breed_data_table").append("<tr><td>Sorry, no Image for that breed yet</td></tr>");
        } else {
            //else display the breed image and data
            displayBreed(data[0])
        }
    });
};

// clear the image and table
function clearBreed() {
    $('#breed_image').attr('src', "");
    $("#breed_data_table tr").remove();
}
// display the breed image and data
function displayBreed(image) {
    $('#breed_image').attr('src', image.url);
    $("#breed_data_table tr").remove();

    var breed_data = image.breeds[0]
    $.each(breed_data, function (key, value) {
        // as 'weight' and 'height' are objects that contain 'metric' and 'imperial' properties, just use the metric string
        if (key == 'weight' || key == 'height') value = value.metric
        // add a row to the table
        $("#breed_data_table").append("<tr><td>" + key + "</td><td>" + value + "</td></tr>");
    });
};

// make an Ajax request
function ajax_get(url, callback) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            // console.log('responseText:' + xmlhttp.responseText);
            try {
                var data = JSON.parse(xmlhttp.responseText);
            } catch (err) {
                console.log(err.message + " in " + xmlhttp.responseText);
                return;
            }
            callback(data);
        }
    };

    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}
// call the getBreeds function which will load all the Dog breeds into the select control
getBreeds();


//Find your pet section
document.getElementById('bestie-form').addEventListener('submit', function (event) {
    event.preventDefault();
    selectedBreed = document.getElementById('userInput').value;

    //Find your pet section
    findYourPet.animal.search({
        type: "Dog",
        breed: selectedBreed,
        page: 1,
        limit: 10,
    })
        .then(function (response) {
            console.log(response.data.animals)
            console.log(selectedBreed)
            // Do something with `response.data.animals`
            // Deletes past search and displays new search
            document.getElementById('display').remove()
            var shelterSearch = document.createElement('div')
            shelterSearch.setAttribute('id', 'display')
            document.getElementById('shelterSearch').append(shelterSearch)

            for (i = 0; i < response.data.animals.length; i++) {
                var searchResult = document.createElement('div');
                searchResult.classList.add('card');
                var urlResult = document.createElement('a');
                var picResult = document.createElement('img');
                var statusResult = document.createElement('p')


                // This is the links to go to petfinder.com if interested in a specific doggo
                urlResult.setAttribute('href', response.data.animals[i].url);
                urlResult.setAttribute('target', '_blank');
                urlResult.textContent = response.data.animals[i].name;
                searchResult.appendChild(urlResult);

                // This displays the adoption status of the doggos (whether its available or not)
                statusResult.textContent = response.data.animals[i].status;
                searchResult.appendChild(statusResult);

                // This displays a picture of the doggos
                if (response.data.animals[i].primary_photo_cropped) {
                    picResult.setAttribute('src', response.data.animals[i].primary_photo_cropped.small);
                    picResult.classList.add('dogPic')
                    searchResult.appendChild(picResult);
                }

                document.getElementById('display').append(searchResult);
            }
        })
});

document.getElementById('saveBtn').addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();
    if (selectedBreed === '') {
        //If this statement is left blank, no text will be saved to local storage.
    }
    else {
        pastSearch.push(selectedBreed)
        localStorage.setItem('pastSearch', JSON.stringify(pastSearch))
    }
});