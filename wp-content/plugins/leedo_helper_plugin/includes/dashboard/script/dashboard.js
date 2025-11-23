(function ($) {

	$('.vlt-drop-parent').each(function () {
		tippy(this, {
			content: $(this).find('.vlt-drop-content').html(),
			allowHTML: true,
			maxWidth: 220,
			interactive: true,
		});
	});

	var link = $('a[href="admin.php?page=go_elementor_pro"]'),
		link2 = $('a.elementor-plugins-gopro'),
		link3 = $('li.e-overview__go-pro a'),
		link4 = $('.toplevel_page_elementor > ul > li:last-child > a').has('.dashicons-star-filled');

	link.attr('href', 'https://be.elementor.com/visit/?bta=65732&nci=5352').attr('target', '_blank').css('color', '#d54e21');
	link2.attr('href', 'https://be.elementor.com/visit/?bta=65732&nci=5352').attr('target', '_blank').css('color', '#d54e21');
	link3.attr('href', 'https://be.elementor.com/visit/?bta=65732&nci=5352').attr('target', '_blank');
	link4.attr('href', 'https://be.elementor.com/visit/?bta=65732&nci=5352').attr('target', '_blank');

})(jQuery);