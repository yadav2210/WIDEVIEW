(function ($) {
    $(function () {
        $('.main-navigation .has-mega-menu.has-stretchwidth').on('mouseenter',function (e) {
            let $body = $('body'),
                pleft = $(this).offset().left,
                bodyleft = $body.offset().left;
            $('.mega-stretchwidth', this).css({
                left: -pleft + bodyleft,
                width: $body.width()
            });
        });

        $('.main-navigation .has-mega-menu.has-containerwidth').on('mouseenter',function (e) {
            let $parent = $(this).closest('.container , .elementor-container, .col-full, .header-container, .elementor-element > .e-con-inner'),
				parentwidth = $parent.width() > 1730 ? 1730 : $parent.width(),
				windowwidht = $(window).width(),
                cleft = $(this).offset().left,
				left = ((windowwidht/2) - cleft - (parentwidth/2)) > 0 ? 0 : ((windowwidht/2) - cleft - (parentwidth/2));

            $('.mega-containerwidth', this).css({
                left: left,
                width: parentwidth
            });

        });

		$('.main-navigation .has-mega-menu').has('ul.custom-subwidth').on('mouseenter',function (e) {
			let pleft = parseFloat($(this).children('a').css('padding-left')),
				$oleft = $(this).offset().left + pleft,
			    $itemwidth = parseInt($(this).children('.custom-subwidth').css('width')),
			    $bodywidth = $('body').width();

			let $offset = $oleft + $itemwidth - $bodywidth;

			if ($offset >= 0){
				$('.mega-menu.custom-subwidth', this).css({
					left: -$offset + pleft
				});
			}
			else{
				$('.mega-menu.custom-subwidth', this).css({
					left: pleft
				});
			}
		});
    });
})(jQuery);