var url = window.location.href;
var ids; // CSS IDs of the annotated elements
var paths; // full CSS paths of annotated elements.
var values; // iApi tags for each annotated element.

function prepare_data() {
	ids = new Array();
	paths = new Array();
	values = new Array();
}

function collect_data(id, path, value) {
	ids.push(id);
	paths.push(path);
	values.push(value);
}

function detect_http_errors(http) {
	if(http.readyState == 4 && http.status == 200) {
		alert(http.responseText);
	}
}

function create_form_data() {
	var form_data = new FormData();
	form_data.append("target_url", String(url));
	for(var i = 0; i < paths.length; ++i) {
		form_data.append("id_"+i, String(ids[i]));
		form_data.append("path_"+i, String(paths[i]));
		form_data.append("value_"+i, String(values[i]));
	}
	return form_data;
}

function send_data() {
	
	var packed_data = create_form_data();
	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'http://localhost:8080/iapi_annotator_rep/data_push', true);
	//xhr.open('POST', 'http://test.lifeparticipation.org:5080/iapi_annotator_rep/data_push', true);
	xhr.onload = function () {
	    console.log(this.responseText);
	};
	xhr.send(packed_data);
	
}