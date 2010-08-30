/*globals App Class Raphael Element Options $lambda */

App.ns('App.TextCircle');

App.TextCircle = new Class({
  Extends: App.TextNode,
  Implements: Options,
  
  options: {
    cls: 'text-circle',
    fill: '#f00',
    stroke: '#fff',
    'stroke-width': 10,
    opacity: 0.75,
    x: 0,
    y: 0,
    r: 300,
    min_r: 75,
    text: 'Lorem Ipsum',
    textSizeBuffer: 20
  },
  
  initialize: function(options) {
    var o = this.options,
        c_atr;
    
    // set options
    this.setOptions(options);

    // draw canvas and circle
    this._initialize_svg();
    this._drawShape();
    
    // draw text object
    c_atr = this.circle.attrs;
    this.parent({
      cls: o.cls,
      text: o.text,
      x: c_atr.cx,
      y: c_atr.cy,
      w: 30
    });
    
    // does proper positioning
    this.setText(o.text);

    this._initialize_drag_drop();
    this.fireEvent('create');
  },
  
  /**
   * setText
   * sets message text and readjusts underlying text and circle sizes to accomdate
   * @param String
   */
  setText: function(text) {
    var o = this.options,
        longest_word = 0,
        size;
    
    this.parent(text);
    
    this.setOptions({text: text});
    size = this.getTextSize();
    
    text.split(' ').each(function(w) {
      if (w.length > longest_word) {
        longest_word = w.length;
      }
    }, this);
    
    // if line breaks are such that calculating width won't accomodate line width
    if (longest_word > 3 && longest_word > text.length/2) {
      this.grow(((longest_word/text.length)*size.w)/2*Math.sqrt(2) - o.r + o.textSizeBuffer);
    }
    
    // else extrapolate the estimated square size of the text
    else {
      this.grow(Math.sqrt(size.w*size.h)/2*Math.sqrt(2) - o.r + o.textSizeBuffer);
    }
  },
  
  /**
   * grow
   * change the size of the shape and text node
   * @param Integer change in circle radius
   */
  grow: function(dr) {
    var o = this.options,
        new_r = o.r + dr;
        
    if (!this.first) {
      new_r = o.r/2;
      this.first = true;
    }
    
    new_r = (new_r < this.options.min_r) ? this.options.min_r : new_r;
    this.setOptions({r: new_r});
    this.animate();
    
    // resize text node
    this.resize(this.circle.attrs.cx, this.circle.attrs.cy, this._width());
  },
  
  /**
   * moveTo
   * provides non animated translation
   * @param Integer x
   * @param Integer y
   */
  moveTo: function(x, y) {
    var w = this._width();
    this.circle.attr({cx: x, cy: y});
    this.outline.attr({cx: x, cy: y});
    this.setStyles({left: x - w/2, top: y - w/2});
  },
  
  /**
   * fade
   * fades elements
   * @param Float opacity value
   */
  fade: function(opacity) {
    var o = this.options;
    
    this.getTextEl().setStyles({opacity: opacity});
    this.setOptions({opacity: opacity});
    this.animate('<');
  },
  
  /**
   * animate
   * animates in the currently specified configuration options
   * @param String name of Raphael.js easing function
   */
  animate: function(easing) {
    easing = easing || "bounce";
    
    if (!this.circle.in_animation) {
      this.circle.animate({
        r: this.options.r, 
        opacity: this.options.opacity
      }, 500, easing);
    }
    
    if (!this.outline.in_animation) {
      this.outline.animate({
        r: this.options.r + this.options['stroke-width']/2,
        opacity: this.options.opacity
      }, 500, easing);
    }
  },
  
  /**
   * remove
   * removes this element giving enough time for removal animation
   */
  remove: function() {
    this.parent();
    
    (function() {
      console.log('removing svg els');
      this.circle.remove();
      this.outline.remove();
    }).delay(1000, this);
  },
  
  
  // private methods
  // ...............
  
  
  /**
   * _initialize_svg
   * create svg drawing area, requires raphael.js
   */
  _initialize_svg: function(){
    App.TextCircle.paper = App.TextCircle.paper || Raphael(0, 0, '100%', '100%');
  },
  
  /**
   * _drawShape
   * draws the underlying svg shapes
   */
  _drawShape: function() {
    var o = this.options;
    this.circle = App.TextCircle.paper.circle(o.x, o.y, o.r).attr({
      fill: o.fill,
      opacity: o.opacity,
      stroke: 0
    });
    this.outline = App.TextCircle.paper.circle(o.x, o.y, o.r + o['stroke-width']/2).attr({
      stroke: o.stroke,
      'stroke-width': o['stroke-width'],
      opacity: o.opacity
    });
    $(this.outline.node).setStyle('cursor', 'move');
  },
  
  /**
   * _initialize_drag_drop
   * initializes drag and drop
   * passes mousedown events from text to the svg node
   * builds drag and drop for the svg node
   */
  _initialize_drag_drop: function() {
    this.addEvent('mousedown', function(e){
      var fireOnThis = this.circle.node;
      var evObj = document.createEvent('MouseEvents');
      evObj.initMouseEvent('mousedown', true, true, window, 1, e.client.x, e.client.y, e.client.x, e.client.y);
      fireOnThis.dispatchEvent(evObj);
    }.bind(this));
    
    this.outline.drag(this._dd_functions()._moving, this._dd_functions()._startMove, this._dd_functions()._endMove);
  },
  
  /**
   * _dd_functions
   * supporting drag and drop handlers
   * this becomes circle and self becomes instance
   */
  _dd_functions: function(){
    var self = this;
    
    return {
      _startMove: function () {
        this.ox = this.attr("cx");
        this.oy = this.attr("cy");
        this.attr({opacity: self.options.opacity/3});
        self.circle.attr({opacity: self.options.opacity/3});
      },

      _moving: function (dx, dy) {
        var w = self._width();
        this.attr({cx: this.ox + dx, cy: this.oy + dy});
        self.circle.attr({cx: this.ox + dx, cy: this.oy + dy});
        self.setStyles({left: this.ox + dx - w/2, top: this.oy + dy - w/2});
        self.setOptions({x: this.attr("cx"), y: this.attr("cy")});
        self.fireEvent('move', [self]);
      },

      _endMove: function () {
        this.attr({opacity: self.options.opacity});
        self.circle.attr({opacity: self.options.opacity});
        self.setOptions({x: this.attr("cx"), y: this.attr("cy")});
        self.fireEvent('afterMove', [self]);
      }
    };
  },
  
  /**
   * utility function to calculate an inscribed squares width within the circle
   */
  _width: function() {
    return this.options.r*Math.sqrt(2);
  }
  
});