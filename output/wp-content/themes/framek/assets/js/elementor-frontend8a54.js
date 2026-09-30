(function ($) {
    "use strict";
    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.elements.$window.on('elementor/nested-tabs/activate', (event, content)=>{
            const swiperElements = content.querySelectorAll(`.${elementorFrontend.config.swiperClass}`);
            for (const element of swiperElements) {
                if (!element.swiper) {
                    return;
                }
                element.swiper = undefined;
            }
        });
    });

})(jQuery);
