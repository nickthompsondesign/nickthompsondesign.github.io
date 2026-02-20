jQuery(document).ready(function(){

	"use strict";

	// here all ready functions

	nt_modal();
	nt_nav_bg();
	nt_trigger_menu();
	nt_progress_init();
	nt_counter_init();
	nt_portfolio();
	nt_cursor();
	nt_imgtosvg();
	nt_popup();
	nt_data_images();
	nt_totop();
	nt_down();

jQuery(window).on('load', function(){
    nt_load();
});

	jQuery(window).on('scroll', function(){
		nt_progress_line();
	});

});

// -----------------------------------------------------
// ---------------   FUNCTIONS    ----------------------
// -----------------------------------------------------

// -----------------------------------------------------
// --------------------   MODALBOX    ------------------
// -----------------------------------------------------

function nt_modal(){

	"use strict";

	jQuery('.nt_wrap').prepend('<div class="nt_modal"><div class="box_inner"><div class="close"><a href="#"><i class="icon-cancel"></i></a></div><div class="description_wrap"></div></div></div>');
}

// -------------------------------------------------
// -------------   TOPBAR BG SCROLL  ---------------
// -------------------------------------------------

function nt_nav_bg(){

	"use strict";

	jQuery(window).on('scroll',function(){
		var menu 			= jQuery('.nt_header');
		var progress 		= jQuery('.progressbar');
		var WinOffset		= jQuery(window).scrollTop();

		if(WinOffset >= 100){
			menu.addClass('animate');
			progress.addClass('animate');
		}else{
			menu.removeClass('animate');
			progress.removeClass('animate');
		}
	});
}

// -----------------------------------------------------
// ---------------   TRIGGER MENU    -------------------
// -----------------------------------------------------

function nt_trigger_menu(){

	"use strict";

	var hamburger 		= jQuery('.trigger .hamburger');
	var mobileMenu		= jQuery('.nt_mobile_menu .dropdown');
	var mobileMenuList	= jQuery('.nt_mobile_menu .dropdown .dropdown_inner ul li a');

	hamburger.on('click',function(){
		var element 	= jQuery(this);

		if(element.hasClass('is-active')){
			element.removeClass('is-active');
			mobileMenu.slideUp();
		}else{
			element.addClass('is-active');
			mobileMenu.slideDown();
		}
		return false;
	});

	mobileMenuList.on('click',function(){
		jQuery('.trigger .hamburger').removeClass('is-active');
		mobileMenu.slideUp();
		return false;
	});
}

// -------------------------------------------------
// -----------------    PORTFOLIO    ---------------
// -------------------------------------------------

function nt_portfolio(){

	"use strict";

	if(jQuery().isotope) {

		// Needed variables
		var filter		 = jQuery('.nt_portfolio .portfolio_filter ul');

		if(filter.length){
			// Isotope Filter
			filter.find('a').on('click', function(){
				var element		= jQuery(this);
				var selector 	= element.attr('data-filter');
				var list		= element.closest('.nt_portfolio').find('.portfolio_list').children('ul');
				list.isotope({
					filter				: selector,
					animationOptions	: {
						duration			: 750,
						easing				: 'linear',
						queue				: false
					}
				});

				filter.find('a').removeClass('current');
				element.addClass('current');
				return false;
			});
		}
	}
}

// -------------------------------------------------
// -------------  PROGRESS BAR  --------------------
// -------------------------------------------------

function tdProgress(container){

	"use strict";

	container.find('.progress_inner').each(function() {
		var progress 		= jQuery(this);
		var pValue 			= parseInt(progress.data('value'), 10);
		var pColor			= progress.data('color');
		var pBarWrap 		= progress.find('.bar');
		var pBar 			= progress.find('.bar_in');
		var number 			= progress.find('.number');
		var label 			= progress.find('.label');
		number.css({right:(100 - pValue)+'%'});
		setTimeout(function(){label.addClass('opened');},500);
		pBar.css({width:pValue+'%', backgroundColor:pColor});
		setTimeout(function(){pBarWrap.addClass('open');});
	});
}

function nt_progress_init(wrapper){

	"use strict";

	var element;
	if(wrapper){
		element = wrapper.find('.dodo_progress');
	}else{
		element = jQuery('.dodo_progress');
	}
	element.each(function() {
		var pWrap = jQuery(this);
		pWrap.find('.number').css({right:'100%'});
		pWrap.waypoint({handler: function(){tdProgress(pWrap);},offset:'90%'});
	});
}

// -----------------------------------------------------
// ---------------   PRELOADER   -----------------------
// -----------------------------------------------------

function nt_preloader(){

	"use strict";

	var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ? true : false;
	var preloader = $('#preloader');

	if (!isMobile) {
		setTimeout(function() {
			preloader.addClass('preloaded');
		}, 800);
		setTimeout(function() {
			preloader.remove();
		}, 2000);

	} else {
		preloader.remove();
	}
}

// -----------------------------------------------------
// -------------------    COUNTER    -------------------
// -----------------------------------------------------

function nt_counter_init(){

	"use strict";

	jQuery('.nt_counter').removeClass('stop');

	jQuery('.nt_counter').each(function() {

	var el		= jQuery(this);
		el.waypoint({
			handler: function(){

				if(!el.hasClass('stop')){
					el.addClass('stop').countTo({
						refreshInterval: 50,
						formatter: function (value, options) {
							return value.toFixed(options.decimals).replace(/\B(?=(?:\d{3})+(?!\d))/g, ',');
						},
					});
				}
			},offset:'95%'
		});
	});
}

// -----------------------------------------------------
// -----------------   MY LOAD    ----------------------
// -----------------------------------------------------

function nt_load(){

	"use strict";

	var speed	= 500;
	setTimeout(function(){nt_preloader();},speed);
}

// -----------------------------------------------------
// ------------------   CURSOR    ----------------------
// -----------------------------------------------------

function nt_cursor(){

    "use strict";

	var myCursor	= jQuery('.mouse-cursor');

	if(myCursor.length){
		if ($(\"body\")) {
        const e = document.querySelector(\".cursor-inner\"),
            t = document.querySelector(\".cursor-outer\");
        let n, i = 0,
            o = !1;
        window.onmousemove = function (s) {
            o || (t.style.transform = \"translate(\" + s.clientX + \"px, \" + s.clientY + \"px)\"), e.style.transform = \"translate(\" + s.clientX + \"px, \" + s.clientY + \"px)\", n = s.clientY, i = s.clientX
        }, $(\"body\").on(\"mouseenter\", \"a, .cursor-pointer\", function () {
            e.classList.add(\"cursor-hover\"), t.classList.add(\"cursor-hover\")
        }), $(\"body\").on(\"mouseleave\", \"a, .cursor-pointer\", function () {
            $(this).is(\"a\") && $(this).closest(\".cursor-pointer\").length || (e.classList.remove(\"cursor-hover\"), t.classList.remove(\"cursor-hover\"))
        }), e.style.visibility = \"visible\", t.style.visibility = \"visible\"
    }
	}
};

// -----------------------------------------------------
// ---------------    IMAGE TO SVG    ------------------
// -----------------------------------------------------

function nt_imgtosvg(){

	"use strict";

	jQuery('img.svg').each(function(){

		var jQueryimg 		= jQuery(this);
		var imgClass		= jQueryimg.attr('class');
		var imgURL			= jQueryimg.attr('src');

		jQuery.get(imgURL, function(data) {
			// Get the SVG tag, ignore the rest
			var jQuerysvg = jQuery(data).find('svg');

			// Add replaced image's classes to the new SVG
			if(typeof imgClass !== 'undefined') {
				jQuerysvg = jQuerysvg.attr('class', imgClass+' replaced-svg');
			}

			// Remove any invalid XML tags as per http://validator.w3.org
			jQuerysvg = jQuerysvg.removeAttr('xmlns:a');

			// Replace image with new SVG
			jQueryimg.replaceWith(jQuerysvg);

		}, 'xml');

	});
}

// -----------------------------------------------------
// --------------------   POPUP    ---------------------
// -----------------------------------------------------

function nt_popup(){

	"use strict";

	jQuery('.gallery_zoom').each(function() { // the containers for all your galleries
		jQuery(this).magnificPopup({
			delegate: 'a.zoom', // the selector for gallery item
			type: 'image',
			gallery: {
			  enabled:true
			},
			removalDelay: 300,
			mainClass: 'mfp-fade'
		});

	});
	jQuery('.popup-youtube, .popup-vimeo').each(function() { // the containers for all your galleries
		jQuery(this).magnificPopup({
			disableOn: 700,
			type: 'iframe',
			mainClass: 'mfp-fade',
			removalDelay: 160,
			preloader: false,
			fixedContentPos: false
		});
	});
}

// -----------------------------------------------------
// ---------------   DATA IMAGES    --------------------
// -----------------------------------------------------

function nt_data_images(){

	"use strict";

	var data			= jQuery('*[data-img-url]');

	data.each(function(){
		var element			= jQuery(this);
		var url				= element.data('img-url');
		element.css({backgroundImage: 'url('+url+')'});
	});
}

// -----------------------------------------------------
// ----------------    PROGRESS LINE    ----------------
// -----------------------------------------------------

function nt_progress_line(){

	"use strict";

	var line			= jQuery('.progressbar .line');
	var documentHeight 	= jQuery(document).height();
	var windowHeight 	= jQuery(window).height();
	var winScroll 		= jQuery(window).scrollTop();
	var value 			= (winScroll/(documentHeight-windowHeight))*100;
	var position 		= value;

	line.css('height',position+"%");
}

// -----------------------------------------------------
// -------------------    TOTOP    ---------------------
// -----------------------------------------------------

function nt_totop(){

	"use strict";

	var text = $('.progressbar .text');
	text.css({bottom: 105 + text.width()});
	$(".progressbar a").on('click', function(e) {
		e.preventDefault();
		$("html, body").animate({ scrollTop: 0 }, 'slow');
		return false;
	});

}

// ------------------------------------------------
// -------------------  ANCHOR --------------------
// ------------------------------------------------

if ($('.anchor_nav').length) {
    $('.anchor_nav').onePageNav();
}

// -----------------------------------------------------
// -----------------    DOWN    ------------------------
// -----------------------------------------------------

function nt_down(){

	"use strict";

	var topbar	= jQuery('.nt_header').outerHeight();

	jQuery('.anchor').on('click',function(){

		if($.attr(this, 'href') !== '#'){
			$('html, body').animate({
				scrollTop: $($.attr(this, 'href')).offset().top-topbar+20
			}, 800);
		}

		return false;
	});
}

// -----------------------------------------------------
// --------------------    WOW JS    -------------------
// -----------------------------------------------------

 new WOW().init();

// -------------------------------------------------
// -----------------    CUSTOM JS   ---------------
// -------------------------------------------------

function stop_all_videos (){
    $("iframe").each(function() { 
            var src= $(this).attr('src');
            $(this).attr('src',src);  
    });
}

Array.from(document.getElementsByClassName("carousel-control-prev")).forEach(el => {
    el.onclick = stop_all_videos;
});
Array.from(document.getElementsByClassName("carousel-control-next")).forEach(el => {
    el.onclick = stop_all_videos;
});
