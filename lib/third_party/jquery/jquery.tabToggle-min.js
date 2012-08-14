/*
 * jQuery tabToggle plugin

 * Date 6/8/2009
 * razvan.caliman(at)gmail(dot)com | http://github.com/oslego/tabToggle/tree/master
 * @author Razvan Caliman
 * @version 1.0
 */
(function(a){a.fn.tabToggle=function(b,c){return function(h,d,g){var l=function(){h.removeClass(config.selectedClass)};var j=function(){d.hide()};var f=function(m,n){l();j();a(m).addClass(config.selectedClass);a(n).show()};var e=function(){var o=parseInt(config.defaultSelectedIndex,10);var n=h.length-1;var m=(n<o||isNaN(o))?n:o;f(h[m],d[m])};var i=function(){h.each(function(m){$trigger=a(this);$target=a(d[m]);$trigger.bind("click",function(n,o){return function(){f(n,o)}}($trigger,$target))})};var k=function(){e();i()};config=a.extend({},a.fn.tabToggle.defaults,g);if(h&&d&&d.length==h.length&&d.length>0){k()}return h}(a(this),a(b),c)};a.fn.tabToggle.defaults={selectedClass:"selected",defaultSelectedIndex:0}})(jQuery);