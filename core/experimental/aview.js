// Experimental Animated Views

FOAModel({
  name: 'ALabel',

  extendsModel: 'View',

  properties: [
    {
      name: 'data'
    },
    {
      name: 'className',
      defaultValue: 'alabel'
    },
    {
      name: 'left',
      postSet: function(_, l) {
        this.$.querySelector('.f1').style.left = l;
      }
    }
  ],

  methods: {
    toInnerHTML: function() {
      return '<div style="position:absolute;transition: left .3s ease;" class="f1"></div><div style="display:inline;visibility:hidden;" class="f2"></div>';
    },
    initHTML: function() {
      this.data$.addListener(this.onDataChange);
    }
  },

  listeners: [
    {
      name: 'onDataChange',
//      isAnimated: true, // interferes with CSS animation
      code: function() {
        if ( ! this.$ ) return;
        var f1$ = this.$.querySelector('.f1');
        var f2$ = this.$.querySelector('.f2');

        f1$.innerHTML = this.data;
        f2$.innerHTML = this.data;

        f1$.style.top  = f2$.offsetTop;
        f1$.style.left = f2$.offsetLeft;
      }
    }
  ]
});


FOAModel({
  name: 'AImageView',

  extendsModel: 'View',

  properties: [
    {
      name: 'data',
      postSet: function(_,value) { console.log('*** ', value); }
    },
    {
      name: 'displayWidth',
      postSet: function(_, newValue) {
        if ( this.$ ) {
          this.$.style.width = newValue;
        }
      }
    },
    {
      name: 'displayHeight',
      postSet: function(_, newValue) {
        if ( this.$ ) {
          this.$.style.height = newValue;
        }
      }
    }
  ],

  listeners: [
    {
      name: 'onDataChange',
      code: function() {
        console.log('*******************************************');
        debugger;
        if ( ! this.$ ) return;
        var $ = this.$;
        var newImage = this.toHTML();
        $.insertAdjacentHTML('afterend', newImage);
      }
    }
  ],

  methods: {
    initHTML: function() {
      this.SUPER();

      this.displayHeight = this.displayHeight;
      this.displayWidth = this.displayWidth;
 
      debugger;
      this.data$.addListener(this.onDataChange);
    },
    toHTML: function() {
      return '<img ' + this.cssClassAttr() + ' id="' + this.id + '" src="' + this.data + '">' ;
    }
  }
});
