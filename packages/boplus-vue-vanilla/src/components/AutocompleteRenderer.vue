<template>
  <control-wrapper
      v-bind="input.controlWrapper.value"
      :styles="input.styles"
      :isFocused="!!input.isFocused"
      :appliedOptions="input.appliedOptions"
  >
    <input
      type="search"
      :id="control.id + '-select'"
      :list="control.id + '-datalist'"
      :class="input.styles.control.select"
      :value="control.data"
      :disabled="!control.enabled"
      :autofocus="input.appliedOptions.focus"
      @change="input.onChange"
      @focus="input.isFocused = true"
      @blur="input.isFocused = false"
    />
    <datalist
        :id="control.id + '-datalist'"
    >
      <option
          v-for="optionElement in control.options"
          :value="optionElement.value"
          :class="input.styles.control.option"
          :key="optionElement.value"
        >
        {{ optionElement.label }}
      </option>
      <!--
          :label="optionElement.label"
      -->
    </datalist>

  </control-wrapper>
</template>

<script setup lang="ts">
import type {ControlElement} from '@jsonforms/core';
import {rendererProps, useJsonFormsEnumControl, useJsonFormsOneOfEnumControl} from '@jsonforms/vue';
import {ControlWrapper, useVanillaControl} from "@jsonforms/vue-vanilla";


/**
 * https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/src/extended/AutocompleteEnumControlRenderer.vue
 * https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/src/extended/AutocompleteOneOfEnumControlRenderer.vue
 */

const props = defineProps(rendererProps<ControlElement>());

let input = useVanillaControl(useJsonFormsEnumControl(props)) as any;

/** @ts-ignore **/
if (undefined !== input.control?.value?.schema?.oneOf) {
  input = useVanillaControl(useJsonFormsOneOfEnumControl(props)) as any
}

const control = input.control;
</script>
