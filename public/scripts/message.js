/*globals App Class Element Options Events $merge MD5*/

App.ns('App.Message');

App.Message = new Class({
  Extends: App.TextCircle,
  Implements: [Options, Events],
  
  options: {
    cls: 'message',
    text: '...',
    author: ''
  },
  
  initialize: function(options) {
    this.setOptions(options);
    this.setOptions({fill: this.messageColor(options.author)});
    this.parent(this.options);
    this.initEvents();
  },
  
  /**
   * initEvents
   * initialize object events
   */
  initEvents: function() {
    this.getTextEl().addEvent('click', function() {
      this.beginEdit();
      this.fireEvent('click');
    }.bind(this));
  },
  
  /**
   * sets message text
   * @param String
   */
  setMessage: function(text) {
    this.setOptions({text: text});
    this.setText(this.options.text);
  },
  
  /**
   * beginEdit
   * starts user editing of message text
   */
  beginEdit: function() {
    this.getTextEl().inlineEdit({
      onComplete: function(el) {
        this.setMessage($(el).get('text'));
        this.fireEvent('afterEdit', [this]);
      }.bind(this),
      onKeyup: function(el, input, event) {
        if (event.key=="enter") {
          input.blur();
        }
      },
      onLoad: function(el, input) {
        input.select();
      }
    });
  },
  
  /**
   * setAge
   * sets the message age as to cause fading of old messages
   * @param Float 0-1 relative representation of age
   */
  setAge: function(ageScale) {
    this.fade(ageScale);
  },
  
  /**
   * remove
   * removes message from teh stage
   */
  remove: function() {
    this.parent();
    
    this.setOptions({r: 0, 'stroke-width': 0});
    this.animate('<');
    
    return this;
  },
  
  /**
   * messageColor
   * @param String text value to hash
   * @return String color value from hashed inpue
   */
  messageColor: function(string) {
    return MD5(string).slice(0,6).hexToRgb(true).rgbToHex();
  }
  
});