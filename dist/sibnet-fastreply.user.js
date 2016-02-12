// ==UserScript==
// @name         Sibnet FastReply Mod
// @description  Модификация формы быстрого ответа на форуме сибнета (несколько кнопок-тегов и предпросмотр)
// @namespace    -
// @author       vba12
//
// @updateURL    https://raw.githubusercontent.com/6apcyk/sibnet_fastreply/master/dist/sibnet-fastreply.meta.js
// @downloadURL  https://raw.githubusercontent.com/6apcyk/sibnet_fastreply/master/dist/sibnet-fastreply.user.js
//
// @version      0.4.2
// @require    	 https://raw.githubusercontent.com/6apcyk/sibnet_fastreply/master/dist/text-editor.js
// @require    	 https://raw.githubusercontent.com/6apcyk/sibnet_fastreply/master/dist/jscolor_mod.js
// @include      http://forum.sibnet.ru/*
// @match        http://forum.sibnet.ru/*
// @include      https://forum.sibnet.ru/*
// @match        https://forum.sibnet.ru/*
// @grant 		 none
// ==/UserScript==

//запускаем jquery, который встроен в форум
(function(document, fn) {
    var script = document.createElement('script')
    script.setAttribute("type", "text/javascript")
    script.textContent = '(' + fn + ')(window, window.document, jQuery)'
    document.body.appendChild(script) // run the script
    document.body.removeChild(script) // clean up
})

//Размеры поля быстрого ответа в пикселах
	W = getsize('areaW');
	H = getsize('areaH');
//Размер значков редактирования текста (1-6)
	BSize = 1;
//Цвет значков редактирования ('#0' - для значения по умолчанию)
//в HEX-формате, со знаком # (напр. #6dee14)
	BColor = '#0';

		

	function LoadStyles(){
		head = document.getElementsByTagName('head')[0];

		if( !head ){
			return;
		}

//внедряем стиль и шрифты, элементы которого будут заменять нам кнопки
		style1 = document.createElement('style');
		style1.type = 'text/css';
		style1.innerHTML = '@import "//maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css";';
		head.appendChild(style1);

//подстраиваем цвета кнопок под текущий скин форума (если не выставлен свой цвет)
		skin = document.querySelector( 'select[name="skinid"]' );
		for (var i = 0; i < skin.children[0].childElementCount; i++) {
			if (skin.children[0].children[i].selected){
				skin = skin.children[0].children[i].innerHTML;
				break
			}
		}
		if (BColor == '#0'){
		switch (skin) {
			case 'LIGHT': BColor = '#618EB3'; break;
			case 'Underlight': BColor = '#559CC7';	break;
			case 'txt': BColor = '#5C8469'; break;
			case 'IBR Style': BColor = '#7C8C98'; break;
			case 'Vista Theme': BColor = '#404040'; break;
			case 'Christmasnow (Import)': BColor = '#9CA8BF'; break;
			default: BColor = '#5D904E';
		}}
		
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
			'background-color: rgba(255, 255, 255, 0.2); display: none;}'+
		'.custom-modal {position: fixed; top: 20%; left: 50%; z-index: 9999; padding: 1.2em; width: 300px; margin-left: -150px;'+
			'background-color: #FFFFFF; border: 1px solid #CACACA;}'+
		'.custom-modal-header {margin: -1.2em -1.2em 0; padding: 0.5em 0.7em; background-color: #F0F0F0; color: #B9B9B9; font-weight: normal;}'+
		'.custom-modal-content {margin: 1.2em 0}'+
		'.custom-modal input, .custom-modal button {background-color: #F5F5F5; color: #A3A3A3; border: 1px solid #D3D3D3; padding: 5px;}'+
		'.custom-modal input {display: block; width: 96%;}'+
		'.custom-modal button {padding-right: 10px; padding-left: 10px; border-color: #DADADA; color: #9B9B9B; cursor: pointer;'+
			'margin: 0 4px 0 0; -webkit-transition: all 0.5s ease; transition: all 0.5s ease;}'+
		'.custom-modal button:focus, .custom-modal button:hover {background-color: #FFFFFF; -webkit-transition: all 0.5s ease; transition: all 0.5s ease;}'+
		'.tab {margin-left: 40px;}'+
		'.preview {width: 80%; display: none; text-align: left;}'+

		
		'#upload_img_modal {display: none; font-size: 1.3em;}'+
		'#upload_img_modal .or_text {margin: 10px 0;}'+
		
		'.VideoSibnetIframe { width:100%; }iframe[src*=\'video.sibnet.ru\'] { width: 640px; }'+
		'embed[src*=\'video.sibnet.ru\'] { width: 640px; }';
		head.appendChild(style1);


	}

//рисуем кнопки
	function LoadButtons(){
		FReply = document.querySelector( '#fastreplyarea' );
		FReply.className = 'resizable';
//		FReply = document.querySelector( 'textarea[id="fastreplyarea"]' );
	if (W != '' && H != ''){
		FReply.setAttribute("style", "width: "+W+"; height: "+H+";");
	}

		
		if( !FReply ){
			return;
		}
		
		switch (BSize) {
			case 2: size = 'fa-lg'; break;
			case 3: size = 'fa-2x'; break;
			case 4: size = 'fa-3x'; break;
			case 5: size = 'fa-4x'; break;
			case 6: size = 'fa-5x'; break;
			default: size = '';
		}
			
		newform= document.createElement("div");
		newform.innerHTML = '<div class="editor-control" id="editor-control">'+
		'<span class="editor-button" id="b-bold" title="Жирный"><i class="fa fa-bold '+size+'"></i></span>'+
		'<span class="editor-button" id="b-italic" title="Курсив"><i class="fa fa-italic '+size+'"></i></span>'+
		'<span class="editor-button" id="b-underline" title="Подчеркнутый"><i class="fa fa-underline '+size+'"></i></span>'+
		'<span class="editor-button" id="b-strikethrough" title="Зачеркнутый"><i class="fa fa-strikethrough '+size+'"></i></span>'+
		'<span class="editor-button" id="b-color" title="Цвет текста"><i class="fa fa-tint '+size+'"></i>'+
			'<input id="i-color" class="jscolor {position:\'top\', onFineChange:\'setTextColor(this)\'}" style="visibility:hidden; width:0";></span>'+
	
		'<span class="button-tab"></span>'+
		'<span class="editor-button" id="b-right" title="Цитата"><i class="fa fa-quote-right '+size+'"></i></span>'+
		'<span class="editor-button" id="b-spoiler" title="Спойлер"><i class="fa fa-eject fa-flip-vertical '+size+'"></i></span>'+
		'<span class="editor-button" id="b-code" title="Код"><i class="fa fa-code '+size+'"></i></span>'+
	
		'<span class="button-tab"></span>'+
		'<span class="editor-button" id="b-chain" title="Ссылка"><i class="fa fa-chain '+size+'"></i></span>'+
		'<span class="editor-button" id="b-video" title="Видео"><i class="fa fa-youtube-play '+size+'"></i></span>'+
		'<span class="editor-button" id="b-image" title="Фото"><i class="fa fa-image '+size+'"></i></span>'+
	
		'<span class="button-tab"></span>'+
		'<span class="editor-button" id="preview_comment_eye" title="Предпросмотр"><i class="fa fa-eye '+size+'"></i></span>'+
		'</div>'+
		
		//--сюда будет перенесено поле быстрого ответа из основного тела страницы--
		
		'<div class="msg">'+
		'<div class="preview" id="preview_result">'+
		'</div></div>'+
		'<div class="custom-modal-overlay"></div>';
	
		TReply = FReply.parentNode;
		newform.childNodes[1].insertBefore(FReply, newform.childNodes[1].firstChild);
		TReply.insertBefore(newform, TReply.firstChild);
	}


//меняем размер поля быстрого ответа	
	function getsize(cname) {
		var name = cname + "=";
		var ca = document.cookie.split(';');
		for(var i=0; i<ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1);
			if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
		}
		return "";
	}
	
	
//меняем цвет кнопок у формы при выборе цвета из палитры
//а заодно меняем значение соответствующего тега в поле ввода
	window.setTextColor = function(picker) {
		 var recolor = document.querySelectorAll('.editor-button');
		 for (var i = 0; i < recolor.length; i++) {
			recolor[i].style.color = '#' + picker.toString();
		}
		var match = FReply.value.match(/(\[colour=#[0-9abcdef]{6}\])([\s\S]*?)(\[\/colour\])/);
        if (match && match[3] == '[/colour]') {
			FReply.value = FReply.value.replace(match[1], '[colour=#' +picker.toString()+']');
          }
	}

//втыкаем кнопки 'ОК' и 'Отмена' в селектор палитры с соответствующим функционалом
//увы, jscolor поставляется без них, угу
	var buttonOK = document.createElement('button');
    buttonOK.id = 'button_colorOK'
	buttonOK.innerHTML = 'OK';
	buttonOK.className = 'colorbuttons';
	buttonOK.style.visibility = 'hidden';
	buttonOK.onclick = function() {
		var recolor = document.querySelectorAll('.editor-button');
		for (var i = 0; i < recolor.length; i++) {
			recolor[i].style.color = BColor;
		}
		var match = FReply.value.match(/(\[colour=#)([0-9abcdef]{6})\]([\s\S]*?)(\[\/colour\])/);
        if (match && match[1] == '[colour=#' && match[4] == '[/colour]') {
			FReply.value = FReply.value.replace('[colour=#', '[color=#');
			FReply.value = FReply.value.replace('[/colour]', '[/color]');
          }
		document.querySelector('#i-color').jscolor.hide();
	}
	document.body.appendChild(buttonOK);
	
	var buttonCancel = document.createElement('button');
    buttonCancel.id = 'button_colorCancel'
	buttonCancel.innerHTML = 'Отмена';
	buttonCancel.className = 'colorbuttons';
	buttonCancel.style.visibility = 'hidden';
	buttonCancel.onclick = function() {
		var recolor = document.querySelectorAll('.editor-button');
		for (var i = 0; i < recolor.length; i++) {
			recolor[i].style.color = BColor;
		}
		var match = FReply.value.match(/(\[colour=#[0-9abcdef]{6}\])([\s\S]*?)(\[\/colour\])/);
        if (match && match[3] == '[/colour]') {
			FReply.value = FReply.value.replace(match[1], '');
			FReply.value = FReply.value.replace(match[3], '');
          }
	document.querySelector('#i-color').jscolor.hide();
	}
	document.body.appendChild(buttonCancel);

	LoadStyles()
	LoadButtons()
	
//костыль, делающий текстовое поле изменяемым в размерах в *меньшую* сторону в хроме,
//в котором эта бага уже с начала 2012 года минимум (и до сих пор не исправлена, в феврале 2016)
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
	
//init button functions (text-editor.js)
	$(document).ready(
		function () {
			if ( $('#fastreplyarea').get(0) !== undefined ) {
				editor_handle();
			}
		});
