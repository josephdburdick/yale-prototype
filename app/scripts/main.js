'use strict';

var $doc = $(document),
	$window = $(window),
	$navDropdown = $('#nav-dropdown'),
	$navDropdownStatus;

function nav(){
	console.log('nav started.');
	$('nav [data-id]').on('click',function(e){
		$navDropdownStatus = $navDropdown.attr('data-active');
		e.preventDefault();
		if ($navDropdownStatus === 'false'){
			$navDropdown.attr('data-active', true);
		} 
		if ($navDropdownStatus === 'true'){
			$navDropdown.attr('data-active', false);
		}
	});

	$('#nav-dropdown [data-id]').on('mouseover',function(){
		$(this).find('.nav').addClass('color').siblings('.nav').removeClass('color'); //.siblings('ul').removeClass('active').addClass('inactive');
		console.log(999)
	});

}



$doc.ready(function(){
	console.log('Doc ready.');

	nav();
	
});




$window.load(function(){
	console.log('Window loaded.');
});