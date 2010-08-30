/*globals App Class Element Options Events $merge*/

App.ns('App.TextNode');

App.TextNode = new Class({
  
  Implements: [Options],
  options: {
    text: '',
    x: 0,
    y: 0,
    w: 100,
    text_container_styles: {
      position: 'absolute',
      'z-index': 1000
    },
    text_cell_styles: {
      display: 'table-cell',
      'text-align': 'center',
      'vertical-align': 'middle'
    }
  },
  
  initialize: function(options) {
    this.setOptions(options);
    
    // expose methods to text_container object
    ['setStyles'].each(function(method_name) {
      this[method_name] = function(method_name){
        var method = method_name;
        return function() {
          this.text_container[method].apply(this.text_container, arguments);
        };
      }(method_name);
    }.bind(this));
    
    this._initializeElements();
  },

  
  /**
   * setText
   * @param String
   * set's the text property of the text node
   */
  setText: function(text) {
    this.text_node.set('html', text);
  },
  
  /**
   * resize
   * @param Integer x
   * @param Integer y
   * @param Float width
   * sets width of text node
   * needed because updates to both parent and child nodes required
   * also repositions item assuming text to remain centered
   */
  resize: function(x,y,w) {
    this.setOptions({x: x, y: y, w: w});
    this.text_container.setStyles(this._getDefaultContainerSizing());
    this.text_cell.setStyles(this._getDefaultNodeSizing());
  },
  
  /**
   * getTextSize
   * @return Object the actual size of the text node so that parent
   * nodes can accomadate container size
   */
  getTextSize: function() {
    this.test_sizing_span.set('text', this.options.text);
    
    return {
      w: this.test_sizing_span.clientWidth,
      h: this.test_sizing_span.clientHeight
    };
  },
  
  /**
   * getTextEl
   * @return Element the base text element so that other objects can add events
   */
  getTextEl: function() {
    return this.text_node;
  },
  
  /**
   * remove
   * clean up dom and remove
   */
  remove: function() {
    this.text_container.dispose();
  },
  
  
  // private methods
  // ...............
  
  
  /**
   * renders the text node
   */
  _initializeElements: function() {
    var o = this.options;
        
    this.text_container = new Element('div', {
      'class': o.cls,
      styles: $merge(o.text_container_styles, this._getDefaultContainerSizing())
    });
    
    this.text_cell = new Element('div', {
      styles: $merge(o.text_cell_styles, this._getDefaultNodeSizing())
    });
    
    this.text_node = new Element('div', {
      'class': 'text_node',
      text: o.text
    });
    
    this.text_node.inject(this.text_cell);
    this.text_cell.inject(this.text_container);
    this.text_container.inject($(document.body), 'top');
    
    this.test_sizing_span = new Element('span', {
      styles: {
        position: 'absolute', 
        visibility:'hidden'
      }
    });
    this.test_sizing_span.inject(this.text_cell, 'top');
  },
  
  /**
   * returns default sizing for container
   */
  _getDefaultContainerSizing: function() {
    var o = this.options;
    
    return {
      top: o.y - o.w/2,
      left: o.x - o.w/2,
      width: o.w,
      height: o.w
    };
  },
  
  /**
   * returns default sizing for node
   */
  _getDefaultNodeSizing: function() {
    var o = this.options;
    
    return {
      width: o.w,
      height: o.w
    };
  }
  
});