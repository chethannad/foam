/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Temporary collection of models to be updated later.
var models = [];

// Bootstrap Model definition which just creates place-holder prototypes
// which are then patched later.
function MODEL(m) {
  var proto = global[m.name];

  if ( ! proto ) {
    proto = m.extends ? Object.create(global[m.extends]) : {};
    global[m.name] = proto;
  }

  if ( ! proto.model_ ) proto.model_ = m;

  if ( m.axioms ) {
    for ( var i = 0 ; i < m.axioms.length ; i++ ) {
      var a = m.axioms[i];
      a.install && a.install.call(a, proto);
    }
  }

  if ( m.methods ) {
    for ( var i = 0 ; i < m.methods.length ; i++ ) {
      var meth = m.methods[i];
      proto[meth.name] = meth.code;
    }
  }

  if ( global.Property && m.properties ) {
    for ( var i = 0 ; i < m.properties.length ; i++ ) {
      var p = m.properties[i];
      var t = p.type ? global[p.type + 'Property'] : Property;
      var prop = t.create(p);
      prop.install(proto);
    }
  }

  models.push(m);
}


MODEL({
  name: 'FObject',
  extends: null,

  documentation: 'Base model for model hierarchy.',

  properties: [
  ],

  methods: [
    {
      name: 'create',
      code: function(args) {
        var obj = Object.create(this);
        obj.instance_ = {};

        // TODO: lookup if valid method names
        for ( var key in args ) obj[key] = args[key];

        return obj;
      }
    },
    {
      name: 'toString',
      code: function() {
        // Distinguish between prototypes and instances.
        return this.model_.name + (this.instance_ ? 'Obj' : 'Proto')
      }
    }
  ],

  // TODO: insert core/FObject.js functionality

  // TODO: insert EventService and PropertyChangeSupport here

  axioms: [
  ]
});


MODEL({
  name: 'Model',
  extends: 'FObject', // Don't remove, isn't the default yet.

  documentation: 'Class/Prototype description.',

  properties: [
    {
      name: 'name'
    },
    {
      name: 'extends',
      defaultValue: 'FObject'
    },
    {
      type: 'Array',
      name: 'axioms',
      factory: function() { return []; }
    },
    {
      type: 'Array',
      subType: 'Property',
      name: 'properties',
      adaptArrayElement: function(o) {
        var t = this.type ? global[this.type + 'Property'] : Property;
        return t.create(o);
      }
    },
    {
      type: 'Array',
      subType: 'Method',
      name: 'methods',
      adaptArrayElement: function(e) {
        if ( typeof e === 'function' ) {
          console.assert(e.name, 'Method must be named');
          return Method.create({name: e.name, code: e});
        }
        return e;
      }
    },
    {
      name: 'proto',
      factory: function() {
        var proto = this.extends ? Object.create(global[this.extends]) : {};
        var m     = this;

        proto.model_ = this;

        if ( m.axioms ) {
          for ( var j = 0 ; j < m.axioms.length ; j++ ) {
            var a = m.axioms[j];
            a.install && a.install.call(a, proto);
          }
        }

        // TODO: should be covered by .axioms above
        if ( m.methods ) {
          for ( var j = 0 ; j < m.methods.length ; j++ ) {
            var meth = m.methods[j];
            proto[meth.name] = meth.code;
          }
        }

        // TODO: should be covered by .axioms above
        if ( m.properties ) {
          for ( var j = 0 ; j < m.properties.length ; j++ ) {
            var p = m.properties[j];
            var t = p.type ? global[p.type + 'Property'] : Property;
            var prop = t.create(p);
            prop.install(proto);
          }
        }

        return proto;
      }
    }
  ]
});


MODEL({
  name: 'Property',
  extends: 'FObject',

  properties: [
    {
      name: 'type'
    },
    {
      name: 'name'
    },
    {
      name: 'defaultValue'
    },
    {
      name: 'factory'
    },
    {
      name: 'preSet'
    },
    {
      name: 'expression'
      // TODO: implement
    }
  ],

  methods: [
    {
      name: 'install',
      code: function(proto) {
        /*
          Install a property onto a prototype from a Property definition.
          (Property is 'this').
        */
        proto[constantize(this.name)] = this;

        var prop            = this;
        var name            = this.name;
        var adapt           = this.adapt
        var preSet          = this.preSet;
        var postSet         = this.postSet;
        var getter          = this.getter;
        var setter          = this.setter;
        var factory         = this.factory;
        var hasDefaultValue = this.hasOwnProperty('defaultValue');
        var defaultValue    = this.defaultValue;

        /* Future: needs events and slot support first.
           var slotName        = name + '$';
           Object.defineProperty(proto, slotName, {
           get: function propSlotGetter() {
           return this.getSlot(name);
           },
           set: function propSlotSetter(value) {
           value.link.link(this.getSlot(name));
           },
           configurable: true
           });
        */

        Object.defineProperty(proto, name, {
          get: function propGetter() {
            if ( getter ) return getter.call(this);

            if ( ( hasDefaultValue || factory ) &&
                 ! this.instance_.hasOwnProperty(name) )
            {
              if ( hasDefaultValue ) return defaultValue;

              var value = factory.call(this);
              this.instance_[name] = value;
              return value;
            }

            return this.instance_[name];
          },
          set: function propSetter(newValue) {
            if ( setter ) {
              setter.call(this, newValue);
              return;
            }

            // TODO: add logic to not trigger factory
            var oldValue = this[name];

            if ( adapt )  newValue = adapt.call(this, oldValue, newValue, prop);

            if ( preSet ) newValue = preSet.call(this, oldValue, newValue, prop);

            this.instance_[name] = newValue;

            // TODO: fire property change event

            // TODO: call global setter

            if ( postSet ) postSet.call(this, oldValue, newValue, prop);
          },
          configurable: true
        });
      }
    }
  ]
});


MODEL({
  name: 'Method',
  extends: 'FObject',

  properties: [
    {
      name: 'name'
    },
    {
      name: 'code'
    }
  ],

  methods: [
    {
      name: 'install',
      code: function(proto) {
        proto[this.name] = this.code;
      }
    }
  ]
});


MODEL({
  name: 'Constant',
  extends: 'FObject', // This line shouldn't be needed.

  properties: [
    {
      name: 'name'
    },
    {
      name: 'value'
    }
  ],

  methods: [
    {
      name: 'install',
      code: function(proto) {
        proto[constantize(this.name)] = this.value;
      }
    }
  ]
});


MODEL({
  name: 'StringProperty',
  extends: 'Property',

  properties: [
    {
      name: 'defaultValue',
      defaultValue: ''
    },
    {
      name: 'preSet',
      defaultValue: function(_, a) {
        return a ? a.toString() : '';
      }
    }
  ]
});


MODEL({
  name: 'ArrayProperty',
  extends: 'Property',

  properties: [
    {
      name: 'factory',
      defaultValue: function() { return []; }
    },
    {
      name: 'subType'
    },
    {
      name: 'preSet',
      defaultValue: function(_, a, prop) {
        var proto = global[prop.subType];
        // TODO: loop for performance
        return a.map(function(p) { return proto.create(p); });
      }
    },
    {
      name: 'adapt',
      defaultValue: function(_, a, prop) {
        if ( ! a ) return [];
        return a.map(prop.adaptArrayElement.bind(prop));
      }
    },
    {
      name: 'adaptArrayElement',
      defaultValue: function(o) {
        return global[this.subType].create(o);
      }
    }
  ]
});


MODEL({
  name: 'AxiomArrayProperty',
  extends: 'ArrayProperty',

  properties: [
    {
      name: 'postSet',
      defaultValue: function(_, a) { this.axioms.push.apply(this.axioms, a); }
    }
  ]
});


/*
  create: create object then update
  remote create from regular objects or remove from prototypes
  acreate or afromJSON

  TODO:
  - property overriding

*/


// Bootstrap Prototypes

for ( var i = 0 ; i < models.length ; i++ ) {
  var m = models[i];
  var proto = global[m.name];

  if ( m.properties ) {
    for ( var j = 0 ; j < m.properties.length ; j++ ) {
      var p = m.properties[j];
      Property.install.call(p, proto);
    }
  }
}

for ( var i = 0 ; i < models.length ; i++ ) {
  var m = models[i];
  var proto = global[m.name];

  if ( m.properties ) {
    for ( var j = 0 ; j < m.properties.length ; j++ ) {
      var p = m.properties[j];
      if ( p.type ) {
        var propType = global[p.type + 'Property'];
        if ( propType ) {
          console.log('Updating: ', i, m.name, p.name, p.type);
          propType.install.call(p, proto);
        } else {
          console.warn('Unknown Property type: ', p.type);
        }
      }
    }
  }
}

delete models;

MODEL({
  name: 'Model',

  properties: [
    {
      type: 'AxiomArray',
      subType: 'Constant',
      name: 'constants'
    }
  ]
});


MODEL = function(m) {
  var model = Model.create(m);
  var proto = model.proto;
  global[m.name] = proto;
  return proto;
}

var CLASS = MODEL;

// End of Bootstrap


// Test:

CLASS({
  name: 'Person',

  constants: [
    {
      name: 'KEY',
      value: 'value'
    }
  ],

  properties: [
    {
      name: 'name'
    },
    {
      name: 'age'
    }
  ],

  methods: [
    {
      name: 'sayHello',
      code: function() { console.log('Hello World!'); }
    }
  ]
});

var p = Person.create({name: 'Adam', age: 0});
console.log(p.name, p.age, p.KEY);
p.sayHello();