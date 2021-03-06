$(document).ready(() => {
   class UnderlineManipulator {
      constructor($underlineStatic, $underline, $defaultElement, $menu) {
         this.$menu = $menu;
         this.$underline = $underline;
         this.underline = $underline[0];

         this.$defaultElement = $defaultElement;
         this.position = {};

         const self = this;

         setTimeout(() => {
            self.revertPosition();
            $underlineStatic.css(self._getTargetPos($defaultElement));
         }, 500);
      }

      _getMenuPos() {
         return this.$menu[0].getBoundingClientRect();
      }
      _getTargetPos($target) {
         const targetRect = $target[0].getBoundingClientRect();
         const menuPos = this._getMenuPos();
         return {
            left: targetRect.left - menuPos.left +'px',
            top: targetRect.bottom - menuPos.top +'px',
            width: targetRect.width+'px',
         };
      }

      async animate(animationKeyframes, duration = 250) {
         const animation = this.underline.animate([animationKeyframes], { duration, easing: 'ease' });

         animation.oncancel = saveState.bind(this);
         animation.onfinish = saveState.bind(this);

         function saveState() {
            this.$underline.css(animationKeyframes);
            this.position = animationKeyframes;
         }

         return animation.finished;
      }
      moveToTarget($target) {
         this.animate(this._getTargetPos($target));
      }
      revertPosition() {
         this.moveToTarget(this.$defaultElement);
      }
   }
   const pref = '.header__menu'; // prefix for current folder

   const $underlineStatic = $(pref+'-underline'),
      $underline = $(pref+'-underline_main');
   const $menu = $(pref);
   const $lis = $(pref+'-li');

   const manipulator = new UnderlineManipulator($underlineStatic, $underline, $lis.first(), $menu);   
   window.menuManipulator = manipulator;

   let hoveredLi;
   let revertTimediffer = new Timediffer(500), resizeTimediffer = new Timediffer(500);

   $lis.on('mouseenter', liHoverIn);
   $lis.on('mouseleave', liHoverOut);

   $(window).on('resize', () => resizeTimediffer.ifReached(() => manipulator.revertPosition()));

   async function liHoverIn(e) {
      hoveredLi = e.target;
      manipulator.moveToTarget($(hoveredLi));
   }

   function liHoverOut(e) {
      hoveredLi = undefined;

      revertTimediffer.ifReached(() => {
         if (!hoveredLi) manipulator.revertPosition();
      });
   }
});