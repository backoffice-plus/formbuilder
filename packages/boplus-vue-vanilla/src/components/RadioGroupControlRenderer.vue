<template>

  <control-wrapper
      v-bind="input.controlWrapper.value"
      :styles="input.styles"
      :isFocused="!!input.isFocused"
      :appliedOptions="input.appliedOptions"
  >

    <label :for="control.id + '-input'">{{ input?.computedLabel }}</label>

    <div
        :id="control.id + '-input'"
        :class="input.styles.control.input"
    >
      <div
          v-for="o in control.options"
          :key="o.value"
      >
        <input type="radio"
               :id="control.id +'.'+ o.value"
               :name="control.id"
               :value="o.value"
               :disabled="!control.enabled"
               :required="control.required"
               @change="input.onChange"
        />

        <label :for="control.id +'.'+ o.value">{{ o.label }}</label>

      </div>

    </div>

  </control-wrapper>

</template>


<script setup lang="ts">
import type {ControlElement} from '@jsonforms/core';
import {rendererProps, useJsonFormsEnumControl, useJsonFormsOneOfEnumControl} from '@jsonforms/vue';
import {ControlWrapper, useVanillaControl} from "@jsonforms/vue-vanilla";

/**
 * @see https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/src/controls/RadioGroupControlRenderer.vue
 * @see https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/src/controls/OneOfRadioGroupControlRenderer.vue
 */

const props = defineProps(rendererProps<ControlElement>());

let input = useVanillaControl(useJsonFormsEnumControl(props)) as any;

/** @ts-ignore **/
if (undefined !== input.control?.value?.schema?.oneOf) {
  input = useVanillaControl(useJsonFormsOneOfEnumControl(props)) as any
}

const control = input.control;

</script>
