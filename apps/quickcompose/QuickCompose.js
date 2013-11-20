/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved.
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

var QuickEMail = FOAM({
  model_: 'Model',
  extendsModel: 'EMail',
  name: 'QuickEMail',
  properties: [
    { name: 'to' },
    { name: 'subject' },
    { name: 'body', displayWidth: 25, view: 'RichTextView' }
  ]
});


var QuickEMailView = Model.create({
  name: 'QuickEMailView',

  extendsModel: 'DetailView',

  properties: [
    {
      name: 'bodyView',
      valueFactory: function() { return this.createView(QuickEMail.BODY); }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.addChild(this.bodyView);
    }
  },

  templates: [
    {
      name: "toHTML",
      template: '<div id="<%= this.getID() %>">' +
        '<%= this.createView(QuickEMail.TO).toHTML() %>' +
        '<%= this.createView(QuickEMail.SUBJECT).toHTML() %>' +
        '<%= this.bodyView.toHTML() %>' +
        '</div>'
    }
  ]
});


var QuickCompose = FOAM({
  model_: 'Model',

  name: 'QuickCompose',

  properties: [
    {
      name: 'window'
    },
    {
      name: 'email',
      valueFactory: function() {
        // TODO: Look for a draft in the EMailDAO
        return QuickEMail.create({id: 'tmp' + Date.now()});
      }
    },
    {
      name: 'view',
      valueFactory: function() {
        return QuickEMailView.create({
          model: QuickEMail
        });
      }
    },
    {
      name: 'sendButton',
      valueFactory: function() { return ActionButton.create({action: this.model_.SEND, value: SimpleValue.create(this)}); }
    },
    {
      name: 'boldButton',
      valueFactory: function() {
        return ActionButton.create({action: RichTextView.BOLD, value: SimpleValue.create(this.view.bodyView) });
      }
    },
    {
      name: 'italicButton',
      valueFactory: function() {
        return ActionButton.create({action: RichTextView.ITALIC, value: SimpleValue.create(this.view.bodyView) });
      }
    },
    {
      name: 'underlineButton',
      valueFactory: function() {
        return ActionButton.create({action: RichTextView.UNDERLINE, value: SimpleValue.create(this.view.bodyView) });
      }
    },
    {
      name: 'linkButton',
      valueFactory: function() {
        // TODO: switch to LINK when available
        return ActionButton.create({action: RichTextView.BOLD, value: SimpleValue.create(this.view.bodyView) });
      }
    },
    {
      name: 'discardButton',
      valueFactory: function() { return ActionButton.create({action: this.model_.DISCARD, value: SimpleValue.create(this)}); }
    },
    {
      name: 'EMailDAO',
      defaultValueFn: function() { return EMailDAO; }
    },
    {
      name: 'ContactDAO',
      defaultValueFn: function() { return ContactDAO; }
    }
  ],

  methods: {
    initHTML: function() {
      this.view.value = this.propertyValue('email');
      this.view.initHTML();
      this.sendButton.initHTML();
      this.boldButton.initHTML();
      this.italicButton.initHTML();
      this.underlineButton.initHTML();
      this.linkButton.initHTML();
      this.discardButton.initHTML();
    }
  },

   actions: [
     {
       model_: 'Action',
       name:  'send',
       help:  'Send the current email.',
       
       // TODO: Don't enable send unless subject, to, and body set
       isEnabled:   function() { debugger; return true; },
       action:      function() {
         this.email.timeStamp = new Date();
         this.EMailDAO.put(this.email);
         this.window.close();
       }
     },
     {
       model_: 'Action',
       name:  'discard',
       help:  'Discard the current email.',
       
       action: function() {
         this.window.close();
       }
     }
   ],

  templates: [
    {
      name: "toHTML",
      description: "",
      template: "<html><head><link rel=\"stylesheet\" type=\"text/css\" href=\"foam.css\" /><link rel=\"stylesheet\" type=\"text/css\" href=\"quickcompose.css\" /><title>New message</title></head><body><%= this.view.toHTML() %><%= this.sendButton.toHTML() %><%= this.boldButton.toHTML() %><%= this.italicButton.toHTML() %><%= this.underlineButton.toHTML() %><%= this.discardButton.toHTML() %></body></html>"
    }
  ]
});