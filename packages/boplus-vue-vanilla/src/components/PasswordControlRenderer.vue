<template>

  <control-wrapper
      v-bind="input.controlWrapper.value"
      :styles="input.styles"
      :isFocused="!!input.isFocused"
      :appliedOptions="input.appliedOptions"
  >

    <input :type="passwordVisible ? 'text' : 'password'"
           data-type="password"
           v-model="password"
           :id="control.id + '-input'"
           :class="input.styles.control.input"
           :disabled="!control.enabled"
           :autofocus="input.appliedOptions.focus"
           :placeholder="input.appliedOptions.placeholder"
           :required="control.required"
           :maxlength="input.appliedOptions.restrict ?? control.schema.maxLength"
           :size="(input.appliedOptions.trim && control.schema.maxLength !== undefined )?? control.schema.maxLength"
           @change="input.onChange"
    />

    <button @click="passwordVisible=!passwordVisible"></button>

  </control-wrapper>

</template>

<script setup lang="ts">
import type {ControlElement} from '@jsonforms/core';
import {rendererProps, useJsonFormsControl} from '@jsonforms/vue';
import {ControlWrapper, useVanillaControl} from "@jsonforms/vue-vanilla";
import {ref} from "vue";

/**
 * https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/src/controls/PasswordControlRenderer.vue
 */

const props = defineProps(rendererProps<ControlElement>());

let input = useVanillaControl(useJsonFormsControl(props)) as any;
const control = input.control;

const passwordVisible = ref(false);
const password = ref(control.value.data);

</script>
