/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  package: 'foam.apps.builder.wizard',
  name: 'ModelPreviewWizard',
  extendsModel: 'foam.apps.builder.wizard.WizardPage',

  properties: [
    {
      name: 'data',
      adapt: function(old,nu) {
        return nu.deepClone();
      }
    },
    {
      name: 'nextViewFactory',
      defaultValue: null,
    },
  ],

  actions: [
    {
      name: 'next',
      isAvailable: function() { return false; }
    },
    {
      name: 'back',
      label: 'Done with Preview',
    }
  ],

  templates: [
    function titleHTML() {/*
        <p class="md-style-trait-standard md-title">Preview</p>
    */},
    function instructionHTML() {/*
        <p class="md-style-trait-standard">Here is a preview of
        <%= this.data.name %>
        </p>
    */},

    function contentHTML() {/*
        $$data{ model_: 'foam.meta.types.ModelEditView', mode: 'read-only' }
    */},
  ],


});
