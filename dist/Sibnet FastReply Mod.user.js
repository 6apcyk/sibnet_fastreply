// ==UserScript==
// @name         Sibnet FastReply Mod
// @description  Модификация формы быстрого ответа на форуме сибнета (несколько кнопок-тегов и предпросмотр)
// @namespace    -
// @author       vba12
//
// @updateURL    https://raw.githubusercontent.com/6apcyk/sibnet_fastreply/master/dist/sibnet-fastreply.meta.js
// @downloadURL  https://raw.githubusercontent.com/6apcyk/sibnet_fastreply/master/dist/sibnet-fastreply.user.js
//
// @version      0.5.0
// @require    	 https://raw.githubusercontent.com/6apcyk/sibnet_fastreply/master/dist/jscolor_mod.js
// @include      http://forum.sibnet.ru/*
// @match        http://forum.sibnet.ru/*
// @include      https://forum.sibnet.ru/*
// @match        https://forum.sibnet.ru/*
// @grant 		 none
// ==/UserScript==

//настраиваемые параметры:
//Размер значков редактирования текста (1-6)
var BSize = 1,
//Цвет значков редактирования ('#0' - для значения по умолчанию)
//в HEX-формате, со знаком # (напр. #6dee14)
BColor = '#0',
BColor2 = '#0',
//Включить кнопку, всплывающую при каждом выделении текста
//(для "кускового" цитирования)
floatQuoting = true,
//Время (в мс) между автоматическими обновлениями превьюшки (если лень постоянно тыкать копку с глазом)
//значение меньше 500 отключает автоматику (нужно будет тыкать на глаз самостоятельно для обновления)
//слишком маленькие значения (aka "мгновенное обновление") вообще лучше не ставить - лишняя нагрузка на браузер
previewtimeout = 2000,
//Задержка (в мс) между первым и вторым нажатием при даблклике, который используется только для кнопки
//с глазом в случае отключения автоматической превьюшки
dblclkspeed = 200,

//эти параметры лучше оставить в покое:
//Размеры поля быстрого ответа в пикселах
W = getsize('areaW'),
H = getsize('areaH'),
//текущий скин форума
skin = document.querySelector( 'select[name="skinid"]' ),
//Размеры значков у формы и отступы между ними
pad, tab, size,
//САМАЯ ПОЛНАЯ КОЛЛЕКЦИЯ СМАЙЛОВ ФОРУМА, НАЛЕТАЙ!!1
smilecollection = [[':o', '-_-', ':wub:', ':ph34r:', ':excl:', ':blush:', ':bye:', ':cens:', ':victory:', ':bayan:', ':off:', ':dont:', ':stena:',
                    ':stol:', ':zloy:', ':slobber:', ':hah:', ':hung:', '[sm1]', '[sm2]',
                    '[sm6]', '[sm5]', '[sm3]', '[sm4]', ':naezd:', ':dance:', ':yes:', ':cvety:', ':clap:', ':poz:', ':shar:',
                    ':mellow:', '<_<', ':shok:', ':super:', ':grin:', ':app:', ':igogo:', ':banana:', ':kos:', 'o_O', ':cry:',
                    ':shy:', ':russian:', ':ya:', ':flag:', ':green:', ':ban:', ':close:', ':sw:', ':formula1:', ':smoke:', ':flood:',
                    ':rtfm:', ':fear:', ':bur:', ':D', ':unsure:', '^_^', ';)', ':)', ':wacko:', ':lol:',
                    ':rolleyes:', 'B)', ':blink:', ':huh:', ':(', ':load:', ':P', ':ngtongue:', ':snegovik:', ':elka2:',
                    ':dm1:', ':ngwacko:', ':nghappy:', ':nglol:', ':dm3:', ':ngbiggrin:', ':ng1:', ':ngsad:', ':dm:', ':snegur:',
                    ':ngblink:', ':nghuh:', ':ng2:', ':ТРИ:'],

                   ['ohmy.gif', 'sleep.gif', 'wub.gif', 'ph34r.gif', 'excl.gif', 'blush.gif', 'bye.gif', 'cens.gif', 'victory.gif', 'bayan.gif', 'off.gif',
                     '_poster_dont_.gif', 'stena.gif', 'post-92-1195641852.gif', 'zloy.gif', 'slobber.gif', 'hah.gif', 'hung.gif', 'sm1.gif', 'sm2.gif',
                     'sm6.gif', 'sm5.gif', 'sm3.gif', 'sm4.gif', 'naezd.gif', 'dance.gif', 'yes.gif', 'cvety.gif', 'clap.gif', 'poz.gif', 'shar.gif',
                     'mellow.gif', 'dry.gif', 'shok.gif', 'super.gif', 'grin.gif', 'app.gif', 'igogo.gif', 'banana.gif', 'kos.gif', 'ogo.gif', 'cry.gif',
                     'shy.gif', 'russian.gif', 'ya.gif', 'flag.gif', 'green.gif', 'ban.png', 'close.png', 'sw.gif', 'formula1.gif', 'smoke.gif', 'flood.png',
                     'rtfm.gif', 'fear.gif', 'angry.gif', 'biggrin.gif', 'unsure.gif', 'happy.gif', 'wink.gif', 'smile.gif', 'wacko.gif', 'laugh.gif',
                     'rolleyes.gif', 'cool.gif', 'blink.gif', 'huh.gif', 'sad.gif', 'nasos.gif', 'tongue.gif', 'ngtongue.gif', 'snegovik.gif', 'elka2.gif',
                     'dm1.gif', 'ngwacko.gif', 'nghappy.gif', 'nglol.gif', 'dm3.gif', 'ngbiggrin.gif', 'ng1.gif', 'ngsad.gif', 'dm.gif', 'snegur.gif',
                     'ngblink.gif', 'nghuh.gif', 'ng2.gif', '333.gif']],

FReply = document.getElementById('fastreplyarea'),
skinpath = '';


//подгружаем все "красивости"
function LoadStyles(){
	var head = document.getElementsByTagName('head')[0];
	if( !head ){
		return;
	}

	//внедряем стиль и шрифты, элементы которого будут заменять нам кнопки
	var style1 = document.createElement('style');
	style1.type = 'text/css';
	style1.innerHTML = '@import "//maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css";';
	head.appendChild(style1);

	//подстраиваем цвета кнопок под текущий скин форума (если не выставлен свой цвет)
	for (var i = 0; i < skin.children[0].childElementCount; i++) {
		if (skin.children[0].children[i].selected){
			skin = skin.children[0].children[i].innerHTML;
			break;
		}
	}
	if (BColor == '#0'){
		switch (skin) {
			case 'LIGHT': BColor = '#436d90'; BColor2 = '#fafafa'; skinpath = 'style_images/light/'; break;
			case 'Underlight': BColor = '#559CC7'; BColor2 = '#244364'; skinpath = 'style_images/underlight/'; break;
			case 'txt': BColor = '#5C8469'; BColor2 = '#f6f6f6'; skinpath = 'style_images/txt/'; break;
			case 'IBR Style': BColor = '#687b88'; BColor2 = '#f8f8fa'; skinpath = 'style_images/ibrstyle/'; break;
			case 'Vista Theme': BColor = '#404040'; BColor2 = '#e7e6e6'; skinpath = 'style_images/vista/'; break;
			case 'Christmasnow (Import)': BColor = '#4c80a4'; BColor2 = '#fafcfe'; skinpath = 'style_images/neigedenoe/'; break;
			default: BColor = '#5D904E'; BColor2 = '#f8fcef'; skinpath = 'style_images/cozygreen/';
		}
	}
	//выстраиваем кнопки в соответствии с их размерами
	switch (BSize) {
		case 2: pad = 10; tab = 30; break;
		case 3: pad = 12; tab = 36; break;
		case 4: pad = 16; tab = 48; break;
		case 5: pad = 20; tab = 60; break;
		case 6: pad = 24; tab = 72; break;
		default: pad = 8; tab = 24;
	}

	//список стилей под кнопки и всплывающие окна
	style1 = document.createElement('style');
	style1.type = 'text/css';
	style1.innerHTML = '.editor-control {padding: 0.5em;}'+
	'.editor-button {cursor: pointer; color: '+BColor+'; padding-left: '+pad+'px;}'+
	'.editor-button:hover {color: red;}'+
	'.button-tab {margin-left: '+tab+'px}'+
	'.colorbuttons {visibility: hidden; cursor: pointer; border-radius: 4px; background-color: #FFFFFF; margin: 130px 2px 0px 2px;'+
		'border: 1px solid #D3D3D3; box-shadow: 15px -15px 15px 0px rgba(0, 0, 0, 0.3);}'+
	'.colorbuttons:hover { background-color: #DDDDDD; -webkit-transition: all 0.5s ease; transition: all 0.5s ease; }'+
    '.custom-modal-overlay {position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 9998; background-color: #FFF;'+
		'background-color: rgba(255, 255, 255, 0.6); display: none;}'+
	'.custom-modal {position: fixed; top: 20%; left: 50%; z-index: 9999; padding: 1.2em; width: 300px; margin-left: -150px;'+
		'background-color: #FFFFFF; border: 1px solid #333333;}'+
	'.custom-modal-header {margin: -1.2em -1.2em 0; padding: 0.5em 0.7em; background-color: #E5E5E5; color: #333333; font-weight: normal;}'+
	'.custom-modal-content {margin: 1.2em 0}'+
	'.custom-modal input, .custom-modal button {border: 1px solid #333333; padding: 5px;}'+
	'.custom-modal input {color: #A3A3A3; background-color: #F5F5F5; display: block; width: 96%; color: #333333;}'+
	'.custom-modal button {padding-right: 10px; padding-left: 10px; background-color: #E5E5E5; color: #333333; cursor: pointer;'+
		'margin: 0 4px 0 0; -webkit-transition: all 0.5s ease; transition: all 0.5s ease;}'+
	'.custom-modal button:focus, .custom-modal button:hover {background-color: #FFFFFF; -webkit-transition: all 0.5s ease; transition: all 0.5s ease;}'+
    '.tab {margin-left: 40px;}'+
	'.preview {width: 85%; display: none; text-align: left;}'+

	'#upload_img_modal {display: none; font-size: 1.3em;}'+
	'#upload_img_modal .or_text {margin: 10px 0;}'+

	'.VideoSibnetIframe { width:100%; }iframe[src*=\'video.sibnet.ru\'] { width: 640px; }'+
	'embed[src*=\'video.sibnet.ru\'] { width: 640px; }iframe[src*=\'youtube.com\'] { width: 640px; }'+

	'.addquotebutton, .addfullquotebutton {display:none; position:absolute; border: 2px solid ' + BColor + '; color:'+ BColor + '; background:'+ BColor2+';'+
	'box-shadow: 0 0 3px gray; font-weight:bold;}'+
	'.addquotebutton:hover, .addfullquotebutton:hover {background: #d5d5d5;}'+
	'.addquotebutton {width:30px; height:30px; border-radius: 50%; font-size:15px;}'+
	'.addfullquotebutton {width:40px; height:16px; border-radius: 15%; font-size:14px;}';
	head.appendChild(style1);
}

//рисуем кнопки
function LoadButtons(){
	if( !FReply ){
		return;
	}

    FReply.className = 'resizable';

	if (W !== '' && H !== ''){
		FReply.setAttribute("style", "width: "+W+"; height: "+H+";");
	}

	switch (BSize) {
		case 2: size = 'fa-lg'; break;
		case 3: size = 'fa-2x'; break;
		case 4: size = 'fa-3x'; break;
		case 5: size = 'fa-4x'; break;
		case 6: size = 'fa-5x'; break;
		default: size = '';
	}

	//кнопки с полем быстрого ответа
	var newform= document.createElement("div");
	newform.innerHTML = '<div class="editor-control" id="editor-control">'+
	'<span class="editor-button" id="b-bold" title="Жирный"><i class="fa fa-bold '+size+'"></i></span>'+
	'<span class="editor-button" id="b-italic" title="Курсив"><i class="fa fa-italic '+size+'"></i></span>'+
	'<span class="editor-button" id="b-underline" title="Подчеркнутый"><i class="fa fa-underline '+size+'"></i></span>'+
	'<span class="editor-button" id="b-strikeout" title="Зачеркнутый"><i class="fa fa-strikethrough '+size+'"></i></span>'+
	'<span class="editor-button" id="b-color" title="Цвет текста"><i class="fa fa-tint '+size+'"></i>'+
		'<input id="i-color" class="jscolor {position:\'top\', onFineChange:\'setTextColor(this)\'}" style="visibility:hidden; width:0";></span>'+

	'<span class="button-tab"></span>'+
	'<span class="editor-button" id="b-quote" title="Цитата"><i class="fa fa-quote-right '+size+'"></i></span>'+
	'<span class="editor-button" id="b-spoiler" title="Спойлер"><i class="fa fa-eject fa-flip-vertical '+size+'"></i></span>'+
	'<span class="editor-button" id="b-code" title="Код"><i class="fa fa-code '+size+'"></i></span>'+

	'<span class="button-tab"></span>'+
	'<span class="editor-button" id="b-link" title="Ссылка"><i class="fa fa-chain '+size+'"></i></span>'+
	'<span class="editor-button" id="b-video" title="Видео"><i class="fa fa-youtube-play '+size+'"></i></span>'+
	'<span class="editor-button" id="b-image" title="Фото"><i class="fa fa-image '+size+'"></i></span>'+

	'<span class="button-tab"></span>'+
	'<span class="editor-button" id="b-preview" title="Предпросмотр"><i class="fa fa-eye '+size+'"></i></span>'+
	'</div>'+

	//--сюда будет перенесено поле быстрого ответа из основного тела страницы--

	'<div class="msg">'+
	'<div class="preview" id="preview_result">'+
	'</div></div>'+
	'<div class="custom-modal-overlay"></div>';
	var TReply = FReply.parentNode;
    newform.childNodes[1].insertBefore(FReply, newform.childNodes[1].firstChild);
	TReply.insertBefore(newform, TReply.firstChild);

	//кнопки цитирования
	var quotebuttons = document.createElement('div');
	quotebuttons.innerHTML = '<span class="addquotebutton" id="b_addquote" title="Цитировать">'+
        '<i class="fa fa-quote-right" style="display: table-cell; vertical-align: middle"></i></span>'+
		'<span class="addfullquotebutton" id="b_addfullquote" style="text-align: center" title="Цитировать сообщение">'+
        '<i class="fa fa-quote-right" style="display: table-cell; vertical-align: middle"></i></span>';
	document.body.appendChild(quotebuttons);
}


//ловим из куков размер поля быстрого ответа (если есть)
function getsize(cname) {
	var name = cname + "=";
	var cookie_array = document.cookie.split(';');
	for(var i=0; i<cookie_array.length; i++) {
		var c = cookie_array[i].trim();
		if (c.indexOf(name) === 0) {
			return c.substring(name.length);
		}
	}
	return "";
}

//меняем цвет кнопок у формы при выборе цвета из палитры
//а заодно меняем значение соответствующего тега в поле ввода
window.setTextColor = function(picker) {
    var recolor = document.getElementsByClassName('editor-button');
	for (var i = 0; i < recolor.length; i++) {
		recolor[i].style.color = '#' + picker.toString();
	}
	var match = FReply.value.match(/(\[colour=#[0-9abcdef]{6}\])([\s\S]*?)(\[\/colour\])/);
	if (match && match[3] == '[/colour]') {
		FReply.value = FReply.value.replace(match[1], '[colour=#' +picker.toString()+']');
	  }
};

//втыкаем кнопки 'ОК' и 'Отмена' в селектор палитры с соответствующим функционалом
//увы, jscolor поставляется без них, угу
var buttonOK = document.createElement('button');
buttonOK.id = 'button_colorOK';
buttonOK.innerHTML = 'OK';
buttonOK.className = 'colorbuttons';
buttonOK.style.visibility = 'hidden';
//сбрасываем значение цвета значков на дефолтное
//и применяем выбранный в палитре цвет к тексту в поле ответа
buttonOK.onclick = function() {
	var recolor = document.getElementsByClassName('editor-button');
    for (var i = 0; i < recolor.length; i++) {
		recolor[i].style.color = BColor;
	}
	var match = FReply.value.match(/(\[colour=#)([0-9abcdef]{6})\]([\s\S]*?)(\[\/colour\])/);
	if (match && match[1] == '[colour=#' && match[4] == '[/colour]') {
		FReply.value = FReply.value.replace('[colour=#', '[color=#');
		FReply.value = FReply.value.replace('[/colour]', '[/color]');
	  }
	document.querySelector('#i-color').jscolor.hide();
};
document.body.appendChild(buttonOK);

var buttonCancel = document.createElement('button');
buttonCancel.id = 'button_colorCancel';
buttonCancel.innerHTML = 'Отмена';
buttonCancel.className = 'colorbuttons';
buttonCancel.style.visibility = 'hidden';
//сбрасываем значение цвета значков на дефолтное
//и отменяем выбор цвета
buttonCancel.onclick = function() {
    var recolor = document.getElementsByClassName('editor-button');
	for (var i = 0; i < recolor.length; i++) {
		recolor[i].style.color = BColor;
	}
	var match = FReply.value.match(/(\[colour=#[0-9abcdef]{6}\])([\s\S]*?)(\[\/colour\])/);
	if (match && match[3] == '[/colour]') {
		FReply.value = FReply.value.replace(match[1], '');
		FReply.value = FReply.value.replace(match[3], '');
	  }
document.querySelector('#i-color').jscolor.hide();
};
document.body.appendChild(buttonCancel);

LoadStyles();
LoadButtons();

/*костыль, делающий текстовое поле изменяемым в размерах в *меньшую* сторону в хроме,
в котором эта бага уже с начала 2012 года минимум (и до сих пор не исправлена, в июне 2017)
можно было бы подумать, что это фича, раз столько лет прошло, но, блин, нахрена
ограничивать пользователя в праве выставить размер поля меньший, чем предусмотрено уеб-дизигнером?*/
function resizableStart (e){
    this.originalW = this.clientWidth;
    this.originalH = this.clientHeight;
    this.onmousemove = resizableCheck;
    this.onmouseup = this.onmouseout = resizableEnd;
}
function resizableCheck (e){
    if(this.clientWidth !== this.originalW || this.clientHeight !== this.originalH) {
        this.originalX = e.clientX;
        this.originalY = e.clientY;
        this.onmousemove = resizableMove;
    }
}
function resizableMove (e){
    var newW = this.originalW + e.clientX - this.originalX,
        newH = this.originalH + e.clientY - this.originalY;
    if(newW < this.originalW){
        this.style.width = newW + 'px';
    }
    if(newH < this.originalH){
        this.style.height = newH + 'px';
    }
}
function resizableEnd (){
    this.onmousemove = this.onmouseout = this.onmouseup = null;
}
var els = document.querySelector( '.resizable' );
els.addEventListener("mouseover", resizableStart, false);



var Editor = function(source) {
	var base = this;
    if (typeof source != "undefined") {
        base.area = source;
    } else {
         document.getElementsById('fastreplyarea');
    }

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

	base.add = function(insertion, callback) {
		if (base.area.value === '') {
			base.area.value = insertion;
		} else {
			base.area.value += '\n' + insertion;
		}
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

window.editor_handler = function() {
	var myTextArea = document.getElementById('fastreplyarea'),
        myEditor   = new Editor(myTextArea),
        b_bold = document.getElementById('b-bold'),
        b_italic = document.getElementById('b-italic'),
        b_underline = document.getElementById('b-underline'),
        b_strikeout = document.getElementById('b-strikeout'),
        b_color = document.getElementById('b-color'),
        b_link = document.getElementById('b-link'),
        b_quote = document.getElementById('b-quote'),
        b_video = document.getElementById('b-video'),
        b_image = document.getElementById('b-image'),
        b_code = document.getElementById('b-code'),
        b_spoiler = document.getElementById('b-spoiler'),
        b_preview = document.getElementById('b-preview');

    b_bold.onclick = function(){
        myEditor.wrap('[b]', '[/b]');
    };
    b_italic.onclick = function(){
		myEditor.wrap('[i]', '[/i]');
    };
    b_underline.onclick = function(){
		myEditor.wrap('[u]', '[/u]');
    };
    b_strikeout.onclick = function(){
		myEditor.wrap('[s]', '[/s]');
    };
    b_color.onclick = function(){
		var CPicker = document.querySelector('#colorpicker');
		if (!CPicker) {
			myEditor.wrap('[colour=#000000]', '[/colour]');
			document.querySelector('#i-color').jscolor.show();
			if (document.querySelector('#button_colorOK').parentNode){
				CPicker = document.querySelector('#colorpicker');
				var buttonOK = document.querySelector('#button_colorOK');
				CPicker.firstChild.appendChild(buttonOK);
				buttonOK.style.visibility = 'visible';
				var buttonCancel = document.querySelector('#button_colorCancel');
				CPicker.firstChild.appendChild(buttonCancel);
				buttonCancel.style.visibility = 'visible';
				CPicker.firstChild.style.boxShadow = "15px -15px 15px 0px rgba(0, 0, 0, 0.3)";
				CPicker.style.left = CPicker.style.left.slice(0,CPicker.style.left.length - 2) - 110 + "px";
				CPicker.style.top = CPicker.style.top.slice(0,CPicker.style.top.length - 2) - 30 + "px";
			}
		} else {
			return;
		}
    };

	b_link.onclick = function(){
		var sel = myEditor.selection(), title = null, url = null;
		if (sel.value.length > 0) {
			fakePrompt('Адрес ссылки (URL):', 'http://', 2, function(r) {
				url = r; myEditor.insert('[url=' + r + ']' + sel.value + '[/url]');
			});
		} else {
			fakePrompt('Название ссылки:', 'Ваш текст ссылки...', 0, function(r) {
				title = r;
				fakePrompt('Адрес ссылки (URL):', 'http://', 2, function(r) { url = r; myEditor.insert('[url=' + r + ']' + title + '[/url]'); });
			});
		}
    };

   b_quote.onclick = function(){
		var tmp_selection = myEditor.selection();
		if (tmp_selection.start == tmp_selection.end) {
			myEditor.insert('[quote]Вставьте цитату сюда[/quote]');
		} else {
			myEditor.wrap('[quote]', '[/quote]');
		}
    };

    b_video.onclick = function(){
		var sel = myEditor.selection();
		fakePrompt('Адрес ссылки (URL):', 'http:// (video.sibnet или youtube)', 0, function(url) {
			var youtube_id = youtube_parser(url);
			if (youtube_id) {
				myEditor.insert('[youtube]' + youtube_id + '[/youtube]');
			} else {
				var sibnet_video_id = sibnet_video_parser(url);
				if (!sibnet_video_id) {
					alert ('Неверная ссылка');
				} else {
					myEditor.insert('[video] ' + sibnet_video_id + ' [/video]');
				}
			}
		});
    };

	b_image.onclick = function(){
		var sel = myEditor.selection();
		fakePrompt('Адрес изображения (URL):', 'http:// (с домена sibnet)', 0, function(url) {
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
    };

	b_code.onclick = function(){
		myEditor.wrap('[code]', '[/code]');
    };

	/*b_spoiler.onclick = function(){
		myEditor.wrap('[spoiler]', '[/spoiler]');
    }*/

    b_spoiler.onclick = function(){
		var sel = myEditor.selection(), title = null, url = null;
		if (sel.value.length > 0) {
			fakePrompt('Заголовок спойлера:', 'Название сворачиваемого блока', 1, function(title) {
                if (title !== '') {
                    myEditor.insert('[cut=' + title + ']' + sel.value + '[/cut]');
                } else {
                    myEditor.insert('[spoiler]' +sel.value+ '[/spoiler]');
                }
			});
		} else {
			myEditor.wrap('[spoiler]', '[/spoiler]');
		}
    };

	function image_parser(url) {
		var ret_code = "";
		var re1 = new RegExp("^.*(\.sibnet\.ru\/).*", "i");
		var match1 = url.match(re1);
		var re2 = new RegExp("^.*((\.jpg$)|(\.gif$)|(\.png$)|(\.bmp$)|(\.ico$)|(\.tga$)|(\.psd$)|(\.svg$))", "i");
		var match2 = url.match(re2);
		if (!match1) {ret_code = "err_dom";}
		if (!match2) {ret_code = "err_ext";}
		return (match1&&match2) ? url : ret_code;
	}

	function youtube_parser(url) {
		var re1 = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/i;
		var match = url.match(re1);
		return (match&&match[7].length==11) ? match[7] : false;
	}

	function sibnet_video_parser(url) {
		var re1 = new RegExp("^.*\/video([0-9]+)-.*", "i");
		var match = url.match(re2);
		return (match&&match[1].length>4&&match[1].length<12)? match[1] : false;
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
		input.addEventListener("keydown", keyhandler, false);
		var buttonOK = document.createElement('button');
		buttonOK.innerHTML = 'OK';
		buttonOK.onclick = 	function () {
            if (isRequired == 2) {
				if (input.value !== "" && input.value !== value) {
					onSuccess(input.value);
				}
			} else
            if ((isRequired === 0) && (input.value === "")) {
                $(".custom-modal-overlay").hide();
                modal.parentNode.removeChild(modal);
            } else {
                if (input.value == value) {
                    onSuccess('');
                } else {
                    onSuccess(input.value);
                }
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

		function keyhandler(e) {
			var keyCode = e.keyCode;
			var modal = document.querySelector('div[class = "custom-modal custom-modal-prompt"]');
			if(keyCode == 27){
				input.removeEventListener("keypress",keyhandler);
				buttonCANCEL.onclick();
			}
			if(keyCode == 13){
				input.removeEventListener("keypress",keyhandler);
				buttonOK.onclick();
			}
		}
	}

	function setsize(cname, cvalue, exdays) {
		var d = new Date();
		d.setTime(d.getTime() + (exdays*24*60*60*1000));
		var expires = "expires="+d.toUTCString();
		document.cookie = cname + "=" + cvalue + "; " + expires;
	}

	// the eye
    var autopreview,
        lastpreview;
    function setPreview(previoustext){
        var preview_result = $('#preview_result');
        if ((lastpreview) &&(preview_result[0].style.display == 'block')){
            if (FReply.value == lastpreview){
                if (previewtimeout>500) {
                    autopreview = setTimeout(setPreview, previewtimeout);
                }
                return;
            }
        }
		setsize("areaW", FReply.style.width, 60);
		setsize("areaH", FReply.style.height, 60);
		var code = FReply.value.replace(/(\r\n|\n|\r)/gm, "<br>");
		if (FReply.value.search('\\[code\\]') != -1){
			var str1 = '\\[code\\]',
				str2 = '\\[/code\\]',
				tempcontent1 = FReply.value.replace(/(\r\n|\n|\r)/gm, "<br>"),
				codeslices=[],
				opentag = 1,
				count = 0;
			tempcontent1 = tempcontent1.slice(tempcontent1.search(str1)+6);
			var tempcontent2 = '',
				tag1 = '',
				tag2 = '';
			do{
				tag1 = tempcontent1.search(str1);
				tag2 = tempcontent1.search(str2);
				if (opentag === 0){
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
						tempcontent2 += tempcontent1.slice(0, tag2);
						tempcontent1 = tempcontent1.slice(tag2+7);
					}
					opentag -= 1;
				}
				if (opentag === 0){
					codeslices[count] = tempcontent2;
					tempcontent2 = "";
					count += 1;
				}
			}while(opentag>0 && (tempcontent1.search(str1) > -1) || (tempcontent1.search(str2) > -1) );
			for (var j = 0; j < codeslices.length; j++) {
				code=code.replace(codeslices[j], '');
			}
		}

        var matches = code.match(/\S+/g) || [];
        for (var i=0; i<matches.length; i++){
            for (var j=0; j<smilecollection[0].length; j++){
                if (matches[i] == smilecollection[0][j]){
                    code = code.replace(matches[i], '<img src="style_emoticons/default/'+smilecollection[1][j]+'" style="vertical-align:middle">');
                    break;
                }
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
            .replace(/\[indent\]/g, '<blockquote>')
			.replace(/\[\/indent\]/g, '</blockquote>')
			.replace(/\[quote\]/g, '<div class="quotetop">Цитата</div><div class="quotemain">')
			.replace(/\[\/quote\]/g, '</div>')
            .replace(/\[\/spoiler\]/g, '</div>')
            .replace(/\[left\]/g, '<div align="left">')
            .replace(/\[\/left\]/g, '</div>')
            .replace(/\[center\]/g, '<div align="center">')
            .replace(/\[\/center\]/g, '</div>')
            .replace(/\[right\]/g, '<div align="right">')
            .replace(/\[\/right\]/g, '</div>');

        var matches = code.match(/(\[quote name.*?\])/g);
		if(matches) {
			matches.forEach(function(item, i, matches) {
				var name_match = item.match(/name=\'(.*?)\'/),
					date_match = item.match(/date=\'(.*?)\'/),
					post_match = item.match(/post=\'(.*?)\'/);
				if (name_match && date_match && post_match) {
					if (skinpath.indexOf('txt') != -1){
                        code = code.replace(matches[i], '<div class="quotetop">Цитата('+name_match[1]+' @ '+date_match[1]+')<a href="index.php?act=findpost&amp;pid='+
                                            post_match[1]+'"><span style="color:#990037;font-size:16px;font-weight: bold;">‹</span></a></div><div class="quotemain">');
                    } else {
                        code = code.replace(matches[i],'<div class="quotetop">Цитата('+name_match[1]+' @ '+date_match[1]+') <a href="index.php?act=findpost&amp;pid='+
                                            post_match[1]+'"><img src="'+skinpath+'post_snapback.gif" alt="*" border="0"></a></div><div class="quotemain">');
                    }
				}
			});
		}

        var matches = code.match(/(\[snapback\])([0-9]*?)(\[\/snapback\])/g);
		if(matches) {
			for (var i=0; i<matches.length; i++){
				var item_matches = matches[i].match(/(\[snapback\])([0-9]*?)(\[\/snapback\])/);
				if (item_matches && item_matches[1] == '[snapback]' && item_matches[3] == '[/snapback]') {
					if (skinpath.indexOf('txt') != -1){
                        code = code.replace(matches[i], '<a href="index.php?act=findpost&amp;pid='+
                                            item_matches[2]+'"><span style="color:#990037;font-size:16px;font-weight: bold;">‹</span></a>');
                    } else {
                        code = code.replace(matches[i],'<a rel="nofollow" href="index.php?act=findpost&amp;pid='+item_matches[2]+'"><img src="'+
                                            skinpath+'post_snapback.gif" alt="*" border="0"></a>');
                    }
				}
			}
		}

        var matches = code.match(/(\[topic=)([0-9]*?)\](.*?)(\[\/topic\])/g);
		if(matches) {
			for (var i=0; i<matches.length; i++){
                var fntsize='10';
				var item_matches = matches[i].match(/(\[topic=)([0-9]*?)\](.*?)(\[\/topic\])/);
				if (item_matches && item_matches[1] == '[topic=' && item_matches[4] == '[/topic]') {
                    code = code.replace(matches[i], '<a href="index.php?showtopic='+item_matches[2]+
						'">'+item_matches[3]+'</a>');
				}
			}
		}

        var matches = code.match(/(\[post=)([0-9]*?)\](.*?)(\[\/post\])/g);
		if(matches) {
			for (var i=0; i<matches.length; i++){
                var fntsize='10';
				var item_matches = matches[i].match(/(\[post=)([0-9]*?)\](.*?)(\[\/post\])/);
				if (item_matches && item_matches[1] == '[post=' && item_matches[4] == '[/post]') {
                    code = code.replace(matches[i], '<a href="index.php?act=findpost&amp;pid='+item_matches[2]+
						'">'+item_matches[3]+'</a>');
				}
			}
		}

        var matches = code.match(/(\[font=)(.*?)\](.*?)(\[\/font\])/g);
		if(matches) {
			for (var i=0; i<matches.length; i++){
				var item_matches = matches[i].match(/(\[font=)(.*?)\](.*?)(\[\/font\])/);
				if (item_matches && item_matches[1] == '[font=' && item_matches[4] == '[/font]') {
                    code = code.replace(matches[i], '<span style="font-family:'+item_matches[2]+
						'">'+item_matches[3]+'</span>');
				}
			}
		}

        var matches = code.match(/(\[list)(.*?)\](.*?)(\[\/list\])/g);
		if(matches) {
			for (var i=0; i<matches.length; i++){
				var item_matches = matches[i].match(/(\[list)(.*?)\](.*?)(\[\/list\])/);
                if (item_matches) {
                    var items = item_matches[3].split('[*]'),
                        inner = '';
                    for (var j = 0; j<items.length; j++){
                        items[j] = items[j].substring(0, items[j].lastIndexOf('<br>'));
                        if (items[j]){
                            inner += '<li>'+items[j]+'</li>';
                        }
                    }
                    if (item_matches[2]){
                        if (item_matches[1] == '[list' && item_matches[4] == '[/list]') {
                            code = code.replace(matches[i], '<ol type="'+item_matches[2][1]+
                                                    '">'+inner+'</ol>');
                        }
                    } else {
                        if (item_matches[1] == '[list' && item_matches[4] == '[/list]') {
                            code = code.replace(matches[i], '<ul>'+inner+'</ul>');
                        }
                    }
                }
			}
		}

        var matches = code.match(/(\[size=)([0-9])\](.*?)(\[\/size\])/g);
		if(matches) {
			for (var i=0; i<matches.length; i++){
                var fntsize='10';
				var item_matches = matches[i].match(/(\[size=)([0-9])\](.*?)(\[\/size\])/);
				if (item_matches && item_matches[1] == '[size=' && item_matches[4] == '[/size]') {
                    switch (item_matches[2]) {
                        case '1': fntsize = '8'; break;
                        case '3': fntsize = '12'; break;
                        case '4': fntsize = '14'; break;
                        case '5': fntsize = '18'; break;
                        case '6': fntsize = '24'; break;
                        case '7': fntsize = '36'; break;
                        default: fntsize = '10';
                    }
					code = code.replace(matches[i], '<span style="font-size:'+fntsize+
						'pt;line-height:100%">'+item_matches[3]+'</span>');
				}
			}
		}

        var matches = code.match(/(\[Film\])([^\[]*)(\[\/Film\])/g);
		if(matches) {
			for (var i=0; i<matches.length; i++){
				var item_matches = matches[i].match(/(\[Film\])([^\[]*)(\[\/Film\])/);
				if (item_matches && item_matches[1] == '[Film]' && item_matches[3] == '[/Film]') {
					code = code.replace(matches[i], '<a href="http://mix.sibnet.ru/movie/search/?keyword='+item_matches[2]+
						'" target="_blank" title="Найти фильм на mix.sibnet.ru!"><img src="http://forum.sibnet.ru/uploads/1260117172/gallery_98790_3633_814.jpg" alt="Найти фильм на mix.sibnet.ru!"><b><font color="#000099">'+
                        item_matches[2]+'</font></b></a>');
				}
			}
		}

        var matches = code.match(/(\[music\])([^\[]*)(\[\/music\])/g);
		if(matches) {
			for (var i=0; i<matches.length; i++){
				var item_matches = matches[i].match(/(\[music\])([^\[]*)(\[\/music\])/);
				if (item_matches && item_matches[1] == '[music]' && item_matches[3] == '[/music]') {
					code = code.replace(matches[i], '<a href="http://mix.sibnet.ru/music/search/?keyword='+item_matches[2]+
						'"><img src="http://forum.sibnet.ru/uploads/1260117172/gallery_98790_3633_814.jpg" alt="Найти музыку на mix.sibnet.ru!"><b><font color="#336666">'+
                        item_matches[2]+'</font></b></a>');
				}
			}
		}

        var matches = code.match(/(\[demotiv\])([^\[]*)(\[\/demotiv\])/g);
		if(matches) {
			for (var i=0; i<matches.length; i++){
				var item_matches = matches[i].match(/(\[demotiv\])([^\[]*)(\[\/demotiv\])/);
				if (item_matches && item_matches[1] == '[demotiv]' && item_matches[3] == '[/demotiv]') {
					code = code.replace(matches[i], '<a href="http://joke.sibnet.ru/joke,'+item_matches[2]+
						'/" title="Демотиваторы на Joke.sibnet.ru"><img src="http://joke.sibnet.ru/preview/preview-'+
                        item_matches[2]+'..jpg" title="Демотиваторы на Joke.sibnet.ru"></a>');
				}
			}
		}

		var matches = code.match(/(\[color=#[0-9abcdef]{6}\])([\s\S]*?)(\[\/color\])/g);
		if(matches) {
			for (var i=0; i<matches.length; i++){
				var item_matches = matches[i].match(/(\[color=#)([0-9abcdef]{6})\]([\s\S]*?)(\[\/color\])/);
				if (item_matches && item_matches[1] == '[color=#' && item_matches[4] == '[/color]') {
					var str = ('[color=#'+item_matches[2]+']'+item_matches[3]+'[/color]');
					code = code.replace(str, '<span style="color:#'+item_matches[2]+'">'+item_matches[3]+'</span>');
				}
			}
		}

		//костыль, если пользователь забыл убрать палитру с экрана
		var matches = code.match(/(\[colour=#[0-9abcdef]{6}\])([\s\S]*?)(\[\/colour\])/g);
		if(matches) {
			for (var i=0; i<matches.length; i++){
				var item_matches = matches[i].match(/(\[colour=#)([0-9abcdef]{6})\]([\s\S]*?)(\[\/colour\])/);
				if (item_matches && item_matches[1] == '[colour=#' && item_matches[4] == '[/colour]') {
					var str = ('[colour=#'+item_matches[2]+']'+item_matches[3]+'[/colour]');
					code = code.replace(str, '<span style="color:#'+item_matches[2]+'">'+item_matches[3]+'</span>');
				}
			}
		}

		var matches = code.match(/(\[img\])([^\[]*)(\[\/img\])/g);
		if(matches) {
			for (var i=0; i<matches.length; i++){
				var item_matches = matches[i].match(/(\[img\])([^\[]*)(\[\/img\])/);
				if (item_matches && item_matches[1] == '[img]' && item_matches[3] == '[/img]') {
					var str = ('[img]'+item_matches[2]+'[/img]');
					code = code.replace(str, '<img src="' + item_matches[2] + '" style="max-width:100%;"/>');
				}
			}
		}

		var matches = code.match(/(\[video\] )([^\[]*)( \[\/video\])/g);
		if(matches) {
			for (var i=0; i<matches.length; i++){
				var item_matches = matches[i].match(/(\[video\] )([^\[]*)( \[\/video\])/);
				if (item_matches && item_matches[1] == '[video] ' && item_matches[3] == ' [/video]') {
					var str = ('[video] '+item_matches[2]+' [/video]');
					code = code.replace(str, '<iframe height="384" src="//video.sibnet.ru/shell.php?videoid='+item_matches[2]+
						'" frameborder="0" scrolling="no" allowfullscreen></iframe>');
				}
			}
		}

        var matches = FReply.value.match(/(\[youtube\])([^\[]*)(\[\/youtube\])/g);
		if(matches) {
			for (var i=0; i<matches.length; i++){
				var item_matches = matches[i].match(/(\[youtube\])([^\[]*)(\[\/youtube\])/);
				if (item_matches && item_matches[1] == '[youtube]' && item_matches[3] == '[/youtube]') {
					code = code.replace(matches[i], '<iframe height="315" src="https://www.youtube.com/embed/'+item_matches[2]+'" frameborder="0" allowfullscreen></iframe>');
				}
			}
		}

		var matches = code.match(/(\[url=([^\]]*)\])([^\[]*)(\[\/url\])/g);
		if(matches) {
			for (var i=0; i<matches.length; i++){
				var item_matches = matches[i].match(/(\[url=([^\]]*)\])([^\[]*)(\[\/url\])/);
				if (item_matches) {
					code = code.replace(item_matches[0], '<a href="'+item_matches[2]+'">'+item_matches[3]+'</a>');
				}
			}
		}

        var matches = code.match(/(\[email=([^\]]*)\])([^\[]*)(\[\/email\])/g);
		if(matches) {
			for (var i=0; i<matches.length; i++){
				var item_matches = matches[i].match(/(\[email=([^\]]*)\])([^\[]*)(\[\/email\])/);
				if (item_matches) {
					code = code.replace(item_matches[0], '<a href="mailto:'+item_matches[2]+'">'+item_matches[3]+'</a>');
				}
			}
		}

        var matches = code.match(/(\[spoiler\])/g);
        if(matches) {
            for (var i=0; i<matches.length; i++){
                var curID = Math.floor(Math.random()*9999);
                code = code.replace(matches[i], '<div class="spoilertop" onclick="openClose(\'' +curID+'\')" style="font-weight: bold">'+
                                    '<u>» Спойлер (нажмите, чтобы прочесть)  «</u></div><div class="spoilermain" id="'+curID+'" style="display: none;">');
            }
        }

        var matches = code.match(/(\[cut=(.*?)\])(.*?)(\[\/cut\])/g);
		if(matches) {
			for (var i=0; i<matches.length; i++){
                var curID = Math.floor(Math.random()*9999),
                    item_matches = matches[i].match(/(\[cut=(.*?)\])(.*?)(\[\/cut\])/);
				if (item_matches) {
					code = code.replace(matches[i], '<div class="spoilertop cuttop" onclick="openClose(\'' +curID+'\')">'+item_matches[2]+
                                        '</div><div class="spoilermain cutdown" id="'+curID+'" style="display: none;">'+item_matches[3]+'</div>');
				}
			}
		}

		var matches = code.match(/(\[code\])(\[\/code\])/g);
		if(matches) {
			for (var i=0; i<matches.length; i++){
				var item_matches = matches[i].match(/(\[code\])(\[\/code\])/);
				if (item_matches) {
					var str = ('[code][/code]');
					code = code.replace(str, '<div class="codetop">Код</div><div class="codemain">'+codeslices[i]+'</div>');
				}
			}
		}
		preview_result.html(code);
        if (preview_result[0].style.display != 'block') {
            preview_result.toggle('slow');
        }
        if (previewtimeout>500) {
            lastpreview = FReply.value;
            autopreview = setTimeout(setPreview, previewtimeout);
        }
    }

    b_preview.onclick = function(){
		var preview_result = $('#preview_result');
        if (preview_result[0].style.display != 'block') {
            setPreview();
        } else {
            if (b_preview.getAttribute("data-dblclick") == null) {
                b_preview.setAttribute("data-dblclick", 1);
                setTimeout(function () {
                    if (b_preview.getAttribute("data-dblclick") == 1) {
                        if (previewtimeout>500) {
                            clearTimeout(autopreview);
                            preview_result.toggle('fast');
                        } else {
                            setPreview();
                        }
                    }
                    b_preview.removeAttribute("data-dblclick");
                }, dblclkspeed);
            } else {
                b_preview.removeAttribute("data-dblclick");
                if (previewtimeout<500) {
                    preview_result.toggle('slow');
                }
            }
        }
    };
};

window.quoting_handler = function() {
    var myTextArea = document.getElementById('fastreplyarea'),
        myEditor   = new Editor(myTextArea),
        sel,
		selparent = null,
		allselparents = [],
		range,
		start_cont, sr_offset,
		end_cont, er_offset,
		buttonQuote = document.querySelector('#b_addquote'),
		fullQuotebutton = document.querySelector('#b_addfullquote');
	if (floatQuoting) {
        document.addEventListener("mouseup", handleSelectionClick);
    }
	fullQuotebutton.addEventListener('mouseout',hideFQbutton);

	var qbuttons = document.getElementsByTagName('a');
		for (var i = 0; i < qbuttons.length; i++){
		if ((qbuttons[i].getAttribute('title')) && (qbuttons[i].getAttribute('title').toLowerCase() == 'добавить к многочисленным цитатам')) {
			qbuttons[i].addEventListener('mouseover',showFQbutton);
			qbuttons[i].addEventListener('mouseout',hideFQbutton);
		}
	}

	function handleSelectionClick() {
		var elements = document.querySelectorAll( ":hover" );
		var clicked = false;
		for (var i = elements.length-1; i > 0 ; i--) {
			if ((elements[i].id) && (elements[i].id == 'b_addquote')){
				if(elements[i].children[0].className == 'fa fa-check'){
					return;
				} else{
					quoteClick();
					clicked = true;
					break;
				}
			}
		}
		for (var i = elements.length-1; i > 0 ; i--) {
			if ((elements[i].id) && (elements[i].id == 'b_addfullquote')){
				if(elements[i].children[0].className == 'fa fa-check'){
					return;
				} else{
					fullQuoteClick(elements[i]);
					clicked = true;
					break;
				}
			}
		}
		if (!clicked){
			if (checkSelection()){
				sel = window.getSelection();
				range = sel.getRangeAt(0);
				start_cont = range.startContainer;
				sr_offset = range.startOffset;
				end_cont = range.endContainer;
				er_offset = range.endOffset;
				drawQuoteButton();
			} else {
				hideQuoteButton();
			}
		}
	}

	function showFQbutton(event) {
		var bodyRect = document.body.getBoundingClientRect(),
			elemRect = this.getBoundingClientRect(),
            elemcenter = elemRect.width / 2,
            btnstyle = getComputedStyle(fullQuotebutton),
            btnwidth = parseInt(btnstyle.width.substring(0,btnstyle.width.lastIndexOf('px'))),
			offsetT  = elemRect.bottom - bodyRect.top + 2,
			offsetL  = elemRect.left - bodyRect.left + elemcenter;
		this.parentElement.appendChild(fullQuotebutton);
		fullQuotebutton.style.top = offsetT + 'px';
		fullQuotebutton.style.left = (offsetL -(btnwidth / 2)) + 'px';
		fullQuotebutton.children[0].className = 'fa fa-quote-right';
		fullQuotebutton.style.visibility = 'visible';
		fullQuotebutton.style.display = 'table';
	}

	function hideFQbutton(event) {
		var nextelement = event.relatedTarget;
		var isVisible = false;
		if (((nextelement.id) && (nextelement.id == 'b_addfullquote')) ||
			((nextelement.className) && ((nextelement.className == 'fa fa-quote-right') || (nextelement.className == 'fa fa-check')))){
			isVisible = true;
		}
		if (!isVisible){
			fullQuotebutton.style.visibility = 'hidden';
			fullQuotebutton.style.display = 'none';
		}
	}

	function checkSelection() {
		var selectable = false;
		if (window.getSelection) {
			sel = window.getSelection();
			selparent = getDirectParent(sel);
			allselparents = getAllParents(selparent);
		}
		for (var i = allselparents.length-1; i >= 0; i--) {
			if ((allselparents[i].tagName.toLowerCase() == "div") && (allselparents[i].id.split("-")[0].toLowerCase() == "post")) {
				if (sel.toString() !== ""){
					selectable = true;
					break;
				}
			}
		}
		if (selectable) {
			for (var i = allselparents.length-1; i >= 0; i--) {
				var ptag = allselparents[i].tagName;
				var pclass = allselparents[i].className;
				if ((ptag) && (pclass)) {
					if (ptag.toLowerCase() == 'div'){
						if ((pclass.toLowerCase() == 'spoilertop') ||
							(pclass.toLowerCase() == 'quotetop') ||
							(pclass.toLowerCase() == 'codetop')	||
							(pclass.toLowerCase() == 'spoilertop cuttop') ||
							(pclass.toLowerCase() == 'sqltop') ||
							(pclass.toLowerCase() == 'htmltop')){
								selectable = false;
								break;
						}
					} else if ((ptag.toLowerCase() == 'span') && (pclass.toLowerCase() == 'edit')){
						selectable = false;
						break;
					}
				}
			}
		}
		return (selectable);
	}

	function drawQuoteButton() {
		buttonQuote.removeEventListener('mouseout',hideQuoteButton);
		var tmpMarker, tmprange;
		tmprange = range.cloneRange();
		tmprange.collapse(false);
		tmpMarker = document.createElement("span");
		tmpMarker.appendChild( document.createTextNode("0") );
		tmprange.insertNode(tmpMarker);
		var obj = tmpMarker;
		var left = 0, top = 0;
		do {
			left += obj.offsetLeft;
			top += obj.offsetTop;
		} while (obj = obj.offsetParent); //в скобках нет косяка, всё так и задумано
		buttonQuote.style.left = left - 5 + "px";
		buttonQuote.style.top = top + 14 + "px";
		buttonQuote.children[0].className = 'fa fa-quote-right';
		buttonQuote.style.visibility = "visible";
		buttonQuote.style.display = "table";
		tmpMarker.parentNode.removeChild(tmpMarker);
	}

	function hideQuoteButton(event){
        var nextelement = null;
        if (event) {
            nextelement = event.relatedTarget;
        }
		var isVisible = false;
        if (nextelement) {
			if (((nextelement.id) && (nextelement.id == 'b_addquote')) ||
				((nextelement.className) && ((nextelement.className == 'fa fa-quote-right') || (nextelement.className == 'fa fa-check')))){
				isVisible = true;
			}
		}
		if (!isVisible){
			buttonQuote.style.visibility = 'hidden';
			buttonQuote.style.display = 'none';
		}
	}

	function getDirectParent(selectionFragment){
		if (selectionFragment.rangeCount) {
			var parentEl = selectionFragment.getRangeAt(0).commonAncestorContainer;
			if (parentEl.nodeType != 1) {
				parentEl = parentEl.parentNode;
			}
		}
		return (parentEl);
	}

	function getAllParents(element){
		if (element !== null) {
			var el = element;
			var allparents = [];
			while (el) {
				allparents.unshift(el);
				if ((el.tagName) && (el.tagName.toLowerCase() == 'tbody')) {
					break;
				}
			el = el.parentNode;
			}
		}
		return (allparents);
	}

	function fullQuoteClick(FQbutton) {
		allselparents = getAllParents(FQbutton);
		var pdet = getPostDetails(),
			userName = pdet[0],
			postId = pdet[1],
			userDate = pdet[2],
			quoteText = handleChildren(allselparents[0].children[1].children[1].children[0]);
		if (quoteText.trim() !== ''){
			var fullQuote = '[quote name=\'' + userName + '\' post=\'' + postId + '\' date=\'' + userDate + '\']\n' + quoteText + '[/quote]';
			myEditor.add(fullQuote);
		}
		FQbutton.children[0].className = 'fa fa-check';
	}

	function quoteClick(){
		mixCheck();
		var quoteText = getElementCollection();
		var pdet = getPostDetails();
		var userName = pdet[0],
			postId = pdet[1],
			userDate = pdet[2];
		quoteText = handleChildren(quoteText);
		if (quoteText.trim() !== ''){
			var fullQuote = '[quote name=\'' + userName + '\' date=\'' + userDate + '\' post=\'' + postId + '\']\n' + quoteText + '[/quote]';
			myEditor.add(fullQuote);
		}
		sel.collapseToEnd();
		buttonQuote.children[0].className = 'fa fa-check';
		buttonQuote.addEventListener('mouseout',hideQuoteButton);
	}

	function mixCheck() {
		var allparents = getAllParents(start_cont);
		for (var i = allparents.length-1; i >= 0; i--) {
			if ((allparents[i].tagName) && (allparents[i].tagName.toLowerCase() == 'font') &&
				(allparents[i].color) &&
				(allparents[i].parentElement.tagName.toLowerCase() == 'b') &&
				(allparents[i].parentElement.previousSibling.tagName.toLowerCase() == 'img') &&
				(allparents[i].parentElement.parentElement.tagName.toLowerCase() == 'a')) {
				start_cont = allparents[i].parentElement.parentElement;
				sr_offset = 0;
			}
		}
		allparents = getAllParents(end_cont);
		for (var i = allparents.length-1; i >= 0; i--) {
			if ((allparents[i].tagName) && (allparents[i].tagName.toLowerCase() == 'font') &&
				(allparents[i].color) &&
				(allparents[i].parentElement.tagName.toLowerCase() == 'b') &&
				(allparents[i].parentElement.previousSibling.tagName.toLowerCase() == 'img') &&
				(allparents[i].parentElement.parentElement.tagName.toLowerCase() == 'a')) {
				end_cont = allparents[i];
				while (true){
					if (end_cont.hasChildNodes()){
						end_cont = end_cont.lastChild;
					} else {
						break;
					}
				}
				er_offset = end_cont.length;
			}
		}
		sel.removeAllRanges();
		range = document.createRange();
		range.setStart(start_cont, sr_offset);
		range.setEnd(end_cont, er_offset);
		sel.addRange(range);
	}

	function getElementCollection() {
		var quotetop = null;
		var quoteText = range.cloneContents();
		var el = quoteText;
		var bottomquote = [];
		while(true){
			if (el.hasChildNodes()){
				if ((el.firstChild.className) && ((el.firstChild.className.toLowerCase() == 'quotemain') ||
					(el.firstChild.className.toLowerCase() == 'spoilermain cutdown'))){
						bottomquote.unshift(el);
					  el = el.firstChild;
				} else {
					break;
				}
			} else {
				break;
			}
		}
		var rangeparents = getAllParents(start_cont);
		var j=rangeparents.length-1;
		for (var i = 0; i <bottomquote.length; i++){
			while (j>=0) {
				if ((rangeparents[j].className) && ((rangeparents[j].className.toLowerCase() == 'quotemain') ||
					(rangeparents[j].className.toLowerCase() == 'spoilermain cutdown'))){
					quotetop = rangeparents[j];
					while (true){
						if ((quotetop.className) && ((quotetop.className.toLowerCase() == 'quotetop') ||
						(quotetop.className.toLowerCase() == 'spoilertop cuttop'))){
							break;
						} else {
							quotetop = quotetop.previousSibling;
						}
					}
					quotetop = quotetop.cloneNode(true);
					bottomquote[i].insertBefore(quotetop,bottomquote[i].firstChild);
					j -= 1;
					break;
				}
				j -= 1;
			}
		}
		quotetop = null;
		for (var i = allselparents.length-1; i > 2 ; i--) {
			var tmpClone = allselparents[i].cloneNode();
			tmpClone.appendChild(quoteText);
			if (quotetop){
				tmpClone.insertBefore(quotetop,tmpClone.firstChild);
				quotetop = null;
			}
			quoteText = tmpClone.cloneNode(true);
			if ((allselparents[i].className) && ((allselparents[i].className.toLowerCase() == 'quotemain') ||
				(allselparents[i].className.toLowerCase() == 'spoilermain cutdown'))){
				quotetop = allselparents[i];
					while (true){
						if ((quotetop.className) && ((quotetop.className.toLowerCase() == 'quotetop') ||
							(quotetop.className.toLowerCase() == 'spoilertop cuttop'))){
							break;
						} else {
							quotetop = quotetop.previousSibling;
						}
					}
				quotetop = quotetop.cloneNode(true);
			}
		}
		return (quoteText);
	}

	//выдираем инфу о пользователе, дате поста и id сообщения
	function getPostDetails(){
		var userDate = '',
            userName = allselparents[0].children[0].children[0].innerText,
            tmpDate = allselparents[0].children[0].children[1].children[0].innerText.trim(),
			postId = allselparents[0].children[1].children[1].children[0].id.split('-')[1],

			today = new Date(),
			dd = today.getDate(),
			mm = today.getMonth()+1, //Январь равен 0
			yyyy = today.getFullYear();

		if (tmpDate.toLowerCase().indexOf('сегодня') != -1){
			userDate = dd + '.' + mm + '.' + yyyy + ',' + tmpDate.split(',')[1];
		} else if (tmpDate.toLowerCase().indexOf('вчера') != -1){
			userDate = (dd-1) + '.' + mm + '.' + yyyy + ',' + tmpDate.split(',')[1];
		} else {
			var firstDigit = tmpDate.match(/\d/);
			var start = tmpDate.indexOf(firstDigit);
			userDate = tmpDate.substring(start);
		}
		return [userName, postId, userDate];
	}

	function handleChildren(mainelement, lvlup){
		var allchildren = mainelement.childNodes,
			outstring = '',
			tmpstring = '',
			quoteauthor = '';
		if (!lvlup){
			lvlup = '';
		}
		for (var i = 0; i < allchildren.length; i++) {
			if (allchildren[i].hasChildNodes()){
				tmpstring += handleChildren(allchildren[i],allchildren[i].outerHTML);
			} else if (allchildren[i].nodeType == 3){
				outstring += allchildren[i].textContent;
				continue;
			} else if (allchildren[i].nodeType == 8){
				continue;
			} else {
                if ((i>0) && (allchildren[i-1].nodeType) && (allchildren[i-1].nodeType != 8) && (allchildren[i-1].data != '/sizec')){
                    tmpstring = allchildren[i].innerText;
                }
			}

			if (allchildren[i].tagName.toLowerCase() == 'br'){
				outstring += '\n';
			} else
			if (allchildren[i].tagName.toLowerCase() == 'b'){
				outstring += '[b]' + tmpstring + '[/b]';
				tmpstring = '';
			} else
			if (allchildren[i].tagName.toLowerCase() == 'i'){
				outstring += '[i]' + tmpstring + '[/i]';
				tmpstring = '';
			} else
			if (allchildren[i].tagName.toLowerCase() == 'u'){
				outstring += '[u]' + tmpstring + '[/u]';
				tmpstring = '';
			} else
			if (allchildren[i].tagName.toLowerCase() == 'strike'){
				outstring += '[s]' + tmpstring + '[/s]';
				tmpstring = '';
			} else
			if (allchildren[i].tagName.toLowerCase() == 'blockquote'){
				outstring += '[indent]' + tmpstring + '[/indent]';
				tmpstring = '';
			} else
			if (allchildren[i].tagName.toLowerCase() == 'li'){
				outstring += '[*]' + tmpstring + '\n';
				tmpstring = '';
			} else
			if (allchildren[i].tagName.toLowerCase() == 'ol'){
				outstring += '[list=' + allchildren[i].getAttribute('type') + ']\n' + tmpstring + '[/list]';
				tmpstring = '';
			} else
			if (allchildren[i].tagName.toLowerCase() == 'ul'){
				outstring += '[list]\n' + tmpstring + '[/list]';
				tmpstring = '';
			} else
			if (allchildren[i].tagName.toLowerCase() == 'a'){
				var tmphref = allchildren[i].getAttribute('href');
				if (tmphref.indexOf('mailto:') === 0) {
					outstring += '[email=' + tmphref.split('mailto:')[1] + ']' + tmpstring + '[/email]';
					tmpstring = '';
				} else if (tmphref.indexOf('index.php') === 0){
					if (tmphref.toLowerCase().indexOf('showtopic=') != -1){
						outstring += '[topic=' + tmphref.split('showtopic=')[1] + ']' + tmpstring + '[/topic]';
						tmpstring = '';
					} else if (tmpstring.indexOf('[snapback]') === 0){
						outstring += '[snapback]' + tmphref.split('pid=')[1].split('[')[0] + '[/snapback]';
						tmpstring = '';
					} else if (tmphref.indexOf('act=findpost') != -1){
						if (lvlup.indexOf('class="quotetop') == -1){
							outstring += '[post=' + tmphref.split('pid=')[1] + ']' + tmpstring + '[/post]';
							tmpstring = '';
						} else {
							outstring += '[url=' + tmphref + ']' + '[/url]';
						}
					}
				} else if ((tmphref.indexOf('mix.sibnet.ru') != -1) && (tmpstring.indexOf('gallery_98790_3633_814.jpg') != -1)){
					if (tmphref.indexOf('movie/search') != -1){
						outstring += '[Film]' + tmphref.split('?keyword=')[1].split('{')[0] + '[/Film]';
					} else if (tmphref.indexOf('music/search') != -1){
						outstring += '[music]' + tmphref.split('?keyword=')[1].split('{')[0] + '[/music]';
					}
				} else if ((tmphref.indexOf('joke.sibnet.ru') != -1) && (allchildren[i].getAttribute('title').toLowerCase().indexOf('демотиваторы на joke.sibnet.ru') != -1)){
					outstring += '[demotiv]' + tmphref.split('joke,')[1].split('/')[0] + '[/demotiv]';
				} else {
					outstring += '[url=' + tmphref + ']' + tmpstring + '[/url]';
					tmpstring = '';
				}
			} else
			if (allchildren[i].tagName.toLowerCase() == 'span'){
				if (allchildren[i].getAttribute('style')){
					var tmpstyle = allchildren[i].getAttribute('style');
					if ((allchildren[i].attributes.length == 1) && tmpstyle){
						if ((tmpstyle.indexOf('font-size') != -1) && (tmpstyle.indexOf('color:') == -1)){
							var f_sizept = tmpstyle.split('font-size:')[1].split('pt')[0],
								f_sizenum;
							switch (f_sizept) {
								case '8':  f_sizenum = 1; break;
								case '10': f_sizenum = 2; break;
								case '12': f_sizenum = 3; break;
								case '14': f_sizenum = 4; break;
								case '18': f_sizenum = 5; break;
								case '24': f_sizenum = 6; break;
								case '36': f_sizenum = 7; break;
								default: f_sizenum = 2;
							}
							outstring += '[size=' + f_sizenum + ']' + tmpstring + '[/size]';
							tmpstring = '';
						} else if (tmpstyle.indexOf('font-family') != -1){
							outstring += '[' + tmpstyle.replace('-family:','=') + ']' + tmpstring + '[/font]';
							tmpstring = '';
						} else if ((tmpstyle.indexOf('font-size') == -1) && (tmpstyle.indexOf('color:') != -1)){
							outstring += '[' + tmpstyle.replace(':','=').toLowerCase() + ']' + tmpstring + '[/color]';
							tmpstring = '';
						} else if ((tmpstyle.indexOf('font-size') != -1) && (tmpstyle.indexOf('color:') != -1)){
							outstring += '[snapback]' + tmpstring + '[/snapback]';
							tmpstring = '';
						}
					} else
					if ((allchildren[i].attributes.length == 1) && (allchildren[i].getAttribute('class').toLowerCase() == 'edit')){
						tmpstring = '';
						continue;
					}
				}
			} else
			if (allchildren[i].tagName.toLowerCase() == 'img'){
				var handled = false;
				for (var j=0; j<allchildren[i].attributes.length; j++){
					if (allchildren[i].attributes[j].name.toLowerCase() == 'emoid'){
						outstring += ' ' + allchildren[i].attributes[j].value + ' ';
						handled = true;
						break;
					}
				}
				if (!handled){
                    if (allchildren[i].src.toLowerCase().indexOf('post_snapback.gif') != -1){
						outstring += '[snapback]' + tmpstring + '[/snapback]';
						tmpstring = '';
					} else {
                        outstring += '[img]' + allchildren[i].src + '[/img]';
                    }
				}
			} else
			if (allchildren[i].tagName.toLowerCase() == 'iframe'){
				tmpstring = allchildren[i].src.replace('%20',' ');
				if (tmpstring.toLowerCase().indexOf('video.sibnet') != -1) {
					outstring += '[video] ' + tmpstring.toLowerCase().split('videoid=')[1].trim() + ' [/video]';
					tmpstring = '';
				}
				if (tmpstring.toLowerCase().indexOf('youtube') != -1) {
					outstring += '[youtube]' + tmpstring.match( /^.*(embed\/)([^#\&\?]*).*/i)[2] + '[/youtube]';
					tmpstring = '';
				}
			} else
			if (allchildren[i].tagName.toLowerCase() == 'div'){
				if ((allchildren[i].attributes.length == 1) && (allchildren[i].getAttribute('align'))) {
					if (allchildren[i].getAttribute('align').toLowerCase() == 'left'){
						outstring += '[left]' + tmpstring + '[/left]';
						tmpstring = '';
					} else
					if (allchildren[i].getAttribute('align').toLowerCase() == 'center'){
						outstring += '[center]' + tmpstring + '[/center]';
						tmpstring = '';
					} else
					if (allchildren[i].getAttribute('align').toLowerCase() == 'right'){
						outstring += '[right]' + tmpstring + '[/right]';
						tmpstring = '';
					}
				} else

				if (allchildren[i].getAttribute('class')) {
					if (allchildren[i].getAttribute('class').toLowerCase() == 'spoilertop'){
						tmpstring = '';
						continue;
					} else
					if (allchildren[i].getAttribute('class').toLowerCase() == 'spoilermain'){
						outstring += '[spoiler]' + tmpstring + '[/spoiler]';
						tmpstring = '';
					} else
					if (allchildren[i].getAttribute('class').toLowerCase() == 'spoilertop cuttop'){
						quoteauthor = '[head_cut]' + tmpstring + '[/head_cut]';
						tmpstring = '';
					} else
					if (allchildren[i].getAttribute('class').toLowerCase() == 'spoilermain cutdown'){
						outstring += quoteauthor + '[body_cut]' + tmpstring + '[/body_cut]';
						quoteauthor = '';
						tmpstring = '';
					} else

					if (allchildren[i].getAttribute('class').toLowerCase() == 'quotetop'){
						if (tmpstring.indexOf('[snapback]') != -1){
							var val1 = tmpstring.split('(')[1].split('@')[0].trim(); //автор
							var val2 = tmpstring.split('@')[1].split(')')[0].trim(); //дата
							var val3 = tmpstring.split('[snapback]')[1].split('[/snapback]')[0].trim(); //номер поста
							quoteauthor = '[quote name=\'' + val1 + '\' date=\'' + val2 + '\' post=\'' + val3 + '\']';
							tmpstring = '';
						} else if (tmpstring.toLowerCase().indexOf('приватный') != -1){
							quoteauthor = 'private';
							i += 1;
						} else {
							quoteauthor = 'blank';
                            tmpstring = '';
						}
					} else
					if (allchildren[i].getAttribute('class').toLowerCase() == 'quotemain'){
						var blankquote = true;
						for (var j=0; j<allchildren[i].childNodes.length; j++){
							var tmpnode = allchildren[i].childNodes[j];
							if ((tmpnode.nodeType == 8) ||
                                ((tmpnode.className) &&
                                 ((tmpnode.className.toLowerCase() == 'quotetop') || (tmpnode.className.toLowerCase() == 'quotemain'))) ||
                                ((tmpnode.tagName) && (tmpnode.tagName.toLowerCase() == 'br'))){
								continue;
							} else {
								blankquote = false;
								break;
							}
						}
						if (!blankquote) {
							//удаляем из цитирования приватный текст
							if ((quoteauthor === '') || (quoteauthor == 'private')){
								tmpstring = '';
								continue;
							} else
							if (quoteauthor == 'blank'){
								outstring += '[quote]' + tmpstring + '[/quote]';
								quoteauthor = '';
								tmpstring = '';
							}
							else {
								outstring += quoteauthor + tmpstring + '[/quote]';
								quoteauthor = '';
								tmpstring = '';
							}
						} else {
							outstring += tmpstring;
							quoteauthor = '';
							tmpstring = '';
						}
					} else

					if (allchildren[i].getAttribute('class').toLowerCase() == 'codetop'){
						tmpstring = '';
						continue;
					} else
					if (allchildren[i].getAttribute('class').toLowerCase() == 'codemain'){
						if (allchildren[i].attributes.length > 1) {
							outstring += '[codebox]' + tmpstring + '[/codebox]';
							tmpstring = '';
						} else {
							outstring += '[code]' + tmpstring + '[/code]';
							tmpstring = '';
						}
					} else

					if (allchildren[i].getAttribute('class').toLowerCase() == 'sqltop'){
						tmpstring = '';
						continue;
					} else
					if (allchildren[i].getAttribute('class').toLowerCase() == 'sqlmain'){
						outstring += '[sql]' + tmpstring.trim() + '[/sql]';
						tmpstring = '';
					} else

					if (allchildren[i].getAttribute('class').toLowerCase() == 'htmltop'){
						tmpstring = '';
						continue;
					} else
					if (allchildren[i].getAttribute('class').toLowerCase() == 'htmlmain'){
						outstring += '[html]' + tmpstring + '[/html]';
						tmpstring = '';
					}
				}
			} else
			if (allchildren[i].tagName.toLowerCase() == 'label'){
				var s_head = tmpstring.split('[head_cut]')[1].split('[/head_cut]')[0].trim(),
					s_body = tmpstring.split('[body_cut]')[1].split('[/body_cut]')[0].trim();
				outstring += '[cut=' + s_head + ']' + s_body + '[/cut]';
				tmpstring = '';
			} else
			if (allchildren[i].tagName.toLowerCase() == 'style'){
				if (allchildren[i].getAttribute('type') == 'text/css') {
					tmpstring = '';
					i += 1;
					continue;
				}
			} else {
				outstring += allchildren[i].outerHTML.replace(allchildren[i].innerHTML, tmpstring);
				tmpstring = '';
			}
		}
		return (outstring);
	}
};

editor_handler();
quoting_handler();
