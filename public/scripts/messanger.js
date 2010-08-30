/*globals App Class Events $merge*/

App.ns('App.Messanger');

App.Messanger = new (new Class((function(){
  
  // private
  var _message_dict = {};
  var _message_stack = [];
  var _fire_update_onmove = true;
  var _message_stack_limit = 6;
  
  
  // public
  return {
    Implements: Events,
    
    /**
     * setAuthor
     * @param String
     */
    setAuthor: function(author) {
      this.client_author = author;
    },
    
    /**
     * setMessage
     * updates an existing message or builds a new message
     * @param Object message configuration
     */
    setMessage: function(config) {
      var id = config['id'];
      
      if (id && id in _message_dict) {
        this.updateMessage(id, config);
      }
      else {
        id = this.createMessage(config);
      }
      return id;
    },
    
    /**
     * createNewMessage
     * creates a new message obj
     * @param Object message configuration
     */
    createMessage: function(config) {
      var message;
      
      config['id'] = config['id'] || String(config['author']) + String(Date.now());
      message = new App.Message(config);
      
      message.addEvent('afterEdit', function(msg) {
        this.fireEvent('update', [msg.options]);
      }.bind(this));
      
      message.addEvent('afterMove', function(msg) {
        this.fireEvent('update', [msg.options]);
      }.bind(this));
      
      message.addEvent('move', function(msg) {
        if (_fire_update_onmove) {
          this.fireEvent('update', [msg.options]);
          _fire_update_onmove = false;
        }
        (function(){_fire_update_onmove = true;}).delay(100, this);
      }.bind(this));
      
      if (this.client_author === config.author) {
        message.beginEdit();
      }
      
      _message_dict[config.id] = message;
      
      // ageing
      if (_message_stack.unshift(message) > _message_stack_limit) {
        delete _message_dict[_message_stack.pop().remove().options.id];
      }
      this._updateAgeing();
      
      return config.id;
    },
    
    /**
     * updateMessage
     * update an existing message with id
     * @param String id of message
     * @param Object message configuration properties
     */
    updateMessage: function(id, config) {
      var m = _message_dict[id];
      if (m.options.text != config.text) m.setMessage(config.text);
      m.moveTo(config.x, config.y);
    },
    
    // private methods
    // ...............
    
    _updateAgeing: function() {
      _message_stack.each(function(m, idx) {
        if (idx > 0) {
          m.setAge(1 - idx/_message_stack_limit);
        }
      }, this);
    },
    
    dump: function() {
      return _message_stack;
    }
  };
  
})()))();