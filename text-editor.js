var Editor = function(source) {
  var base = this;
  base.area = typeof source != "undefined" ? source : document.getElementsById('fastreplyarea');

  /* Collect data from selected text inside a textarea */
  base.selection = function() {
    var start = base.area.selectionStart,
      end = base.area.selectionEnd,
      value = base.area.value.substring(start, end),
      before = base.area.value.substring(0, start),
      after = base.area.value.substring(end),
      data = {
        start: start,
        end: end,
        value: value,
        before: before,
        after: after
      };
    return data;
  };

  /* Select portion of text inside a textarea */
  base.select = function(start, end, callback) {
    base.area.focus();
    base.area.setSelectionRange(start, end);
    if (typeof callback == "function") callback();
  };

  /* Replace selected text inside a textarea with something */
  base.insert = function(insertion, callback) {
    var sel = base.selection(),
      start = sel.start,
      end = sel.end;
    base.area.value = sel.before + insertion + sel.after;
    base.select(start + insertion.length, start + insertion.length);
    if (typeof callback == "function") {
      callback();
    }
  };

  /* Wrap selected text inside a textarea with something */
  base.wrap = function(open, close, callback) {
    var sel = base.selection(),
      selections = sel.value,
      before = sel.before,
      after = sel.after;
    base.area.value = before + open + selections + close + after;
    base.select(before.length + open.length, before.length + open.length + selections.length);
    if (typeof callback == "function") {
      callback();
    }
  };

};


window.editor_handle = function() {
  String.prototype.capitalize = function(lower) {
    return (lower ? this.toLowerCase() : this).replace(/(?:^|\s)\S/g, function(a) {
      return a.toUpperCase();
    });
  };

  var myTextArea = document.getElementById('fastreplyarea'),
      //myButton   = document.getElementById('editor-control').getElementsByTagName('a'),
      myEditor   = new Editor(myTextArea);
	  
    $("#b-bold").on('click', function() {
      myEditor.wrap('[b]', '[/b]');
    });
    $("#b-italic").on('click', function() {
      myEditor.wrap('[i]', '[/i]');
    });
    $("#b-underline").on('click', function() {
      myEditor.wrap('[u]', '[/u]');
    });
    $("#b-strikethrough").on('click', function() {
      myEditor.wrap('[s]', '[/s]');
    });
    $("#b-color").on('click', function() {
		var CPicker = document.querySelector('#colorpicker')
		if (CPicker == undefined) {
		  myEditor.wrap('[colour=#000000]', '[/colour]');
		  document.querySelector('#i-color').jscolor.show();
		  if (document.querySelector('#button_colorOK').parentNode){
		    var CPicker = document.querySelector('#colorpicker');
		    var buttonOK = document.querySelector('#button_colorOK');
		    CPicker.firstChild.appendChild(buttonOK);
		    buttonOK.style.visibility = 'visible';
		    var buttonCancel = document.querySelector('#button_colorCancel');
		    CPicker.firstChild.appendChild(buttonCancel);
		    buttonCancel.style.visibility = 'visible';
			CPicker.firstChild.style.boxShadow = "15px 15px 15px 0px rgba(0, 0, 0, 0.3)";
			}
		} else {
			return;
		}
		  
    });	

	
	
	$("#b-chain").on('click', function() {
      var sel = myEditor.selection(), title = null, url = null;
      if (sel.value.length > 0) {
        fakePrompt('Адрес ссылки (URL):', 'http://', true, function(r) {
          url = r; myEditor.insert('[url=' + r + ']' + sel.value + '[/url]');
        });
      } else {
        fakePrompt('Название ссылки:', 'Ваш текст ссылки...', false, function(r) {
          title = r;
          fakePrompt('Адрес ссылки (URL):', 'http://', true, function(r) { url = r; myEditor.insert('[url=' + r + ']' + title + '[/url]'); });
        });
      }
    });
    $("#b-right").on('click', function() {
      var tmp_selection = myEditor.selection();
      if (tmp_selection.start == tmp_selection.end) {
        myEditor.insert('[quote]Вставьте цитату сюда[/quote]');
      } else {
        myEditor.wrap('[quote]', '[/quote]');
      }
    });
	


    $("#b-video").on('click', function() {
      var sel = myEditor.selection();
      fakePrompt('Адрес ссылки (URL):', 'http:// (video.sibnet)', false, function(url) {
//        var youtube_id = youtube_parser(url);
//        if (youtube_id) {
//          myEditor.insert('[youtube]' + youtube_id + '[/youtube]');
//        } else {
		var sibnet_video_id = sibnet_video_parser(url);
		if (sibnet_video_id.slice(0,3) == "err") {
			var err_code = sibnet_video_id.slice(4,7);
			if (err_code == "dom") {
				alert ('Для тега [video] разрешены ссылки только с video.sibnet.ru');
			}
			if (err_code == "ext") {
				alert ('Неверная ссылка');
			}
        } else {
			myEditor.insert('[video] ' + sibnet_video_id + ' [/video]');
		}
//    }
      });
    });


	$("#b-image").on('click', function() {
      var sel = myEditor.selection();
      fakePrompt('Адрес изображения (URL):', 'http:// (с домена sibnet)', false, function(url) {
        var sibnet_image_id = image_parser(url);
        if (sibnet_image_id.slice(0,3) == "err") {
			var err_code = sibnet_image_id.slice(4,7);
			if (err_code == "dom") {
				alert ('Для тега [img] разрешены изображения только с домена sibnet.ru');
			}
			if (err_code == "ext") {
				alert ('Неверная ссылка. Это должна быть картинка');
			}
        } else {
			myEditor.insert('[img]' + sibnet_image_id + '[/img]');
		}
      });
    });
	
	$("#b-code").on('click', function() {
      myEditor.wrap('[code]', '[/code]');
    });

	$("#b-spoiler").on('click', function() {
      myEditor.wrap('[spoiler]', '[/spoiler]');
    });


  var controls = {
    'select':        function() { myEditor.select(0, myTextArea.value.length); },
    'return':        function() { myEditor.insert('\n'); },
    'link':          function() {
      var sel = myEditor.selection(), title = null, url = null;
      if (sel.value.length > 0) {
        fakePrompt('Адрес ссылки (URL):', 'http://', true, function(r) {
          url = r; myEditor.insert('[url=' + r + ']' + sel.value + '[/url]');
        });
      } else {
        fakePrompt('Название ссылки:', 'Ваш текст ссылки...', false, function(r) {
          title = r;
          fakePrompt('Адрес ссылки (URL):', 'http://', true, function(r) { url = r; myEditor.insert('[url=' + r + ']' + title + '[/url]'); });
        });
      }
    },


  };

  function image_parser(url) {
	var ret_code = "";
	var re1 = new RegExp("^.*(\.sibnet\.ru\/).*", "i");
    var match1 = url.match(re1);
	var re2 = new RegExp("^.*((\.jpg$)|(\.gif$)|(\.png$)|(\.bmp$)|(\.ico$)|(\.tga$)|(\.psd$)|(\.svg$))", "i");
	var match2 = url.match(re2);
	if (!match1) {ret_code = "err_dom"}
	if (!match2) {ret_code = "err_ext"}
    return (match1&&match2) ? url : ret_code;
  }


  function sibnet_video_parser(url) {
    var ret_code = "";
	var re1 = new RegExp("^.*(video\.sibnet\.ru\/).*", "i");
    var match1 = url.match(re1);
	var re2 = new RegExp("^.*\/video([0-9]+)-.*", "i");
	var match2 = url.match(re2);
    if (!match1) {ret_code = "err_dom"}
	if (match2&&match2[1].length>4&&match2[1].length<12) {
		var isvideo = true;
	} else {
		var isvideo = false;
		ret_code = "err_ext"
	}
	return (match1&&isvideo) ? match2[1] : ret_code;
  }

  function fakePrompt(label, value, isRequired, callback) {
    $(".custom-modal-overlay").show();
    var modal = document.createElement('div');
    modal.className = 'custom-modal custom-modal-prompt';
    modal.innerHTML = '<div class="custom-modal-header">' + label + '</div><div class="custom-modal-content"></div><div class="custom-modal-action"></div>';
    var onSuccess = function(value) {
      $(".custom-modal-overlay").hide();
      modal.parentNode.removeChild(modal);
      if (typeof callback == "function") callback(value);
    };
    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'modal-input';
	input.placeholder = value;
	input.addEventListener("keypress", keyhandler, false);
    var buttonOK = document.createElement('button');
    buttonOK.innerHTML = 'OK';
    buttonOK.onclick = 	function () {
//      console.log(modal)
	  if (isRequired) {
        if (input.value !== "" && input.value !== value) {
          onSuccess(input.value);
        }
      } else if (input.value == "") {
		  $(".custom-modal-overlay").hide();
		  modal.parentNode.removeChild(modal);
	  } else {
        onSuccess(input.value == value ? "" : input.value);
      }
    };
    var buttonCANCEL = document.createElement('button');
    buttonCANCEL.innerHTML = 'Отмена';
    buttonCANCEL.onclick = function() {
      $(".custom-modal-overlay").hide();
      modal.parentNode.removeChild(modal);
    };
    document.body.appendChild(modal);
    modal.children[1].appendChild(input);
    modal.children[2].appendChild(buttonOK);
    modal.children[2].appendChild(buttonCANCEL);
	input.focus();

	
	function keyhandler(e){
      console.log(e)
  	  var keyCode = e.keyCode;
	  var modal = document.querySelector('div[class = "custom-modal custom-modal-prompt"]');
      if(keyCode == 27){

	  $(".custom-modal-overlay").hide();
        modal.parentNode.removeChild(modal);
      }
	  if(keyCode == 13){
	    input.removeEventListener("keypress",keyhandler);
		buttonOK.onclick();
      }
	}
  }
  
  // the eye
  $('#preview_comment_eye').click(function() {
	  GM_setValue("areaW", 800);
	  GM_setValue("areaH", 400);
	  
    var i = document.querySelector('#fastreplyarea');
	var code = i.value.replace(/(\r\n|\n|\r)/gm, "<br>");
//обрабатываем тег [code]
	if (i.value.search('\\[code\\]') != -1){
	  var str1 = '\\[code\\]';
	  var str2 = '\\[/code\\]';
	  var tempcontent1 = i.value.replace(/(\r\n|\n|\r)/gm, "<br>");
	  var codeslices=[];
	  var opentag = 0;
//	  var code = '';
		opentag += 1;
		var count = 0;
//		code = tempcontent1.slice(0, tempcontent1.search(str1)+6);
		tempcontent1 = tempcontent1.slice(tempcontent1.search(str1)+6);
		var tempcontent2 = '';
		var tag1 = '';
		var tag2 = '';
		do{
			tag1 = tempcontent1.search(str1);
			tag2 = tempcontent1.search(str2);
			if (opentag == 0){
//				code += tempcontent1.slice(0, tag1+6);
				tempcontent1 = tempcontent1.slice(tag1+6);
				opentag += 1;
			} else if ((tag1 < tag2)&&(tag1 != -1)){
				tempcontent2 += tempcontent1.slice(0, tag1+6);
				tempcontent1 = tempcontent1.slice(tag1+6);
				opentag += 1;
			} else if (tag2 > -1){
				if (opentag > 1){
					tempcontent2 += tempcontent1.slice(0, tag2+7);
					tempcontent1 = tempcontent1.slice(tag2+7);
				} else {
//					code += tempcontent1.slice(tag2, tag2+7);
					tempcontent2 += tempcontent1.slice(0, tag2);
					tempcontent1 = tempcontent1.slice(tag2+7);
				}
				opentag -= 1;
			}
			if (opentag == 0){
				codeslices[count] = tempcontent2;
				tempcontent2 = "";
				count += 1;
			}
		}while(opentag>0 && (tempcontent1.search(str1) > -1) || (tempcontent1.search(str2) > -1) );
	  for (j = 0; j < codeslices.length; j++) {
		code=code.replace(codeslices[j], '');
		console.log(codeslices[0]);
	  }
	}
	
	code = code.replace(/\[b\]/g, '<b>')
      .replace(/\[\/b\]/g, '</b>')
      .replace(/\[i\]/g, '<i>')
      .replace(/\[\/i\]/g, '</i>')
      .replace(/\[u\]/g, '<u>')
      .replace(/\[\/u\]/g, '</u>')
      .replace(/\[s\]/g, '<strike>')
      .replace(/\[\/s\]/g, '</strike>')
      .replace(/\[quote\]/g, '<div class="quotetop">Цитата</div><div class="quotemain">')
      .replace(/\[\/quote\]/g, '</div>');
	  
  
	  var matches = code.match(/(\[color=#[0-9abcdef]{6}\])([\s\S]*?)(\[\/color\])/g);
	  if(matches) {
        matches.forEach(function(item, i, matches) {
          var item_matches = item.match(/(\[color=#)([0-9abcdef]{6})\]([\s\S]*?)(\[\/color\])/);
		  if (item_matches && item_matches[1] == '[color=#' && item_matches[4] == '[/color]') {
            var str = ('[color=#'+item_matches[2]+']'+item_matches[3]+'[/color]');
			code = code.replace(str, '<span style="color:#'+item_matches[2]+'">'+item_matches[3]+'</span>');
          }
        });
      }
	  
//костыль, если пользователь забыл убрать палитру с экрана
	  var matches = code.match(/(\[colour=#[0-9abcdef]{6}\])([\s\S]*?)(\[\/colour\])/g);
      if(matches) {
        matches.forEach(function(item, i, matches) {
          var item_matches = item.match(/(\[colour=#)([0-9abcdef]{6})\]([\s\S]*?)(\[\/colour\])/);
          if (item_matches && item_matches[1] == '[colour=#' && item_matches[4] == '[/colour]') {
            var str = ('[colour=#'+item_matches[2]+']'+item_matches[3]+'[/colour]');
            code = code.replace(str, '<span style="color:#'+item_matches[2]+'">'+item_matches[3]+'</span>');
          }
        });
      }
	  


	  
      var matches = code.match(/(\[img\])([^\[]*)(\[\/img\])/g);
      if(matches) {
        matches.forEach(function(item, i, matches) {
          var item_matches = item.match(/(\[img\])([^\[]*)(\[\/img\])/);
          if (item_matches && item_matches[1] == '[img]' && item_matches[3] == '[/img]') {
            var str = ('[img]'+item_matches[2]+'[/img]');
            code = code.replace(str, '<img src="' + item_matches[2] + '" style="max-width:100%;"/>');
          }
        });
      }

      var matches = code.match(/(\[video\] )([^\[]*)( \[\/video\])/g);
      if(matches) {
        matches.forEach(function(item, i, matches) {
          var item_matches = item.match(/(\[video\] )([^\[]*)( \[\/video\])/);
          if (item_matches && item_matches[1] == '[video] ' && item_matches[3] == ' [/video]') {
            var str = ('[video] '+item_matches[2]+' [/video]');
            code = code.replace(str, '<iframe height="384" src="//video.sibnet.ru/shell.php?videoid='+item_matches[2]+'" frameborder="0" scrolling="no" allowfullscreen></iframe>');
          }
        });
      }

      var matches = code.match(/(\[url=([^\]]*)\])([^\[]*)(\[\/url\])/g);
      if(matches) {
        matches.forEach(function(item, i, matches) {
          var item_matches = item.match(/(\[url=([^\]]*)\])([^\[]*)(\[\/url\])/);
          if (item_matches) {
            code = code.replace(item_matches[0], '<a href="'+item_matches[2]+'">'+item_matches[3]+'</a>');
          }
        });
      }
	  
	do{
	  var matches = code.match(/(\[spoiler\])(.*)(\[\/spoiler\])/g);
      if(matches) {
        matches.forEach(function(item, i, matches) {
          var item_matches = item.match(/(\[spoiler\])(.*)(\[\/spoiler\])/);
          if (item_matches && item_matches[1] == '[spoiler]' && item_matches[3] == '[/spoiler]') {
			var str = ('[spoiler]'+item_matches[2]+'[/spoiler]');
			var curID = Math.floor(Math.random()*9999);
			code = code.replace(str, '<div class="spoilertop" onclick="openClose(\'' +curID+'\')" style="font-weight: bold">'+
			'<u>» Спойлер (нажмите, чтобы прочесть)  «</u></div><div class="spoilermain" id="'+curID+'" style="display: none;">'+
			item_matches[2] + '</div>');
          }
        });
      }
    }
	while(matches);
	
	
	var matches = code.match(/(\[code\])(\[\/code\])/g);
      if(matches) {
		matches.forEach(function(item, i, matches) {
          var item_matches = item.match(/(\[code\])(\[\/code\])/);
          if (item_matches) {
            var str = ('[code][/code]');
				code = code.replace(str, '<div class="codetop">Код</div><div class="codemain">'+codeslices[i]+'</div>');
		  }
		});
      }

    $('#preview_result').html(code);
    $('#preview_result').toggle('slow');
  });

};
