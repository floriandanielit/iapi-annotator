
//Extract Data from the markeup based on the iapi annotation
function extractIAPI(iapiid, urlsource, id, idPage, call) {
    var idObject = {};
    var datas = new Array();

    //array contains objects representing the extracted data
    $.get(urlsource, function (data) {
        var template = injectExternalIAPIParsing(urlsource, data);
		
		template = template.find('#' + iapiid);
		// ANNOTATOR INJECTION
		if(template.length < 1) {
			console.log('not found');
		} else {
			console.log('found');
		}
        var dataItem = template.find("[class*='dataitem:']");

        $.each(dataItem, function (j, rowValue) {
            var dataAttri = $(this).find("[class*='dataattribute:']");
            var dataatribute = {};

            $.each(dataAttri, function (i, rowValue) {
                dataatribute[$(this).attr("class").substr(14)] = $(this).html();
            });

            var dataitem = {};
            dataitem[$(this).attr("class").substr(9)] = dataatribute;
            datas.push(dataitem);
        });

        var pass_data = {
            'id': id,
            'value': datas
        };

        call(JSON.stringify(pass_data));
    });
}

function injectExternalIAPIParsing(path, response) {	
	var url = "http://localhost:8080/iapi_annotator_rep/data_get";	
	//var url = "http://test.lifeparticipation.org:5080/iapi_annotator_rep/data_get";	
	var text = $("<div>" + response + "</div>");	
	var form_data = new FormData();
	form_data.append("target_url", path);
	
	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, false); 
	
	xhr.onreadystatechange = function() {  
		if (xhr.readyState === 4) {  
			if (xhr.status === 200) {  				
				var parser = new DOMParser();
				xmlDoc = xhr.responseXML;
				console.log("XML of external annotations found");
				if(xmlDoc) {				
					var annotation = xmlDoc.getElementsByTagName("annotation");
					for (var i=0; i < annotation.length; i++) {
						var CSSid = annotation[i].childNodes[0].textContent;
						var CSSpath = annotation[i].childNodes[1].textContent;
						var iAPIvalue = annotation[i].childNodes[2].textContent;
						
						if (CSSpath.substring(0, 4) == "body") {
							CSSpath = CSSpath.substring(5, CSSpath.length);
						}
						
						var element = $(CSSpath, text).addClass(iAPIvalue);
						var replacer = $(CSSpath, text).replaceWith(element);

						if (iAPIvalue.substring(0, 4) == "iapi") {
							element = $(CSSpath, text).attr("id",CSSid);
							replacer = $(CSSpath, text).replaceWith(element);
						}
							
					}
					return text;
				}
			}
		}  
	};  
	xhr.send(form_data);	
	return text;
}