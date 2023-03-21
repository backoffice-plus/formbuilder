<template>

  <control-wrapper
      v-bind="input.controlWrapper.value"
      :styles="input.styles"
      :isFocused="!!input.isFocused"
      :appliedOptions="input.appliedOptions"

  >

    <input type="range"
           v-model="current"
           :step="control.schema.multipleOf || 1"
           :min="control.schema.minimum"
           :max="control.schema.maximum"
           :id="control.id + '-input'"
           :class="input.styles.control.input"
           :disabled="!control.enabled"
           :autofocus="input.appliedOptions.focus"
           :placeholder="input.appliedOptions.placeholder"
           :required="control.required"
           @change="onChange"
           @focus="input.isFocused = true"
           @blur="input.isFocused = false"
    />

    <span>{{ current }}</span>

  </control-wrapper>

</template>


<style>


</style>

<script setup lang="ts">
import type {ControlElement} from '@jsonforms/core';
import {rendererProps, useJsonFormsControl} from '@jsonforms/vue';
import {ControlWrapper, useVanillaControl} from "@jsonforms/vue-vanilla";
import {ref, watch} from "vue";

/**
 * https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/src/controls/SliderControlRenderer.vue
 */

const props = defineProps(rendererProps<ControlElement>());

let input = useVanillaControl(useJsonFormsControl(props)) as any;
const control = input.control;

const current = ref(control.value.data);

/** @ts-ignore **/
const onChange = (e:Event) => input.onChange({target:{value:Number(e?.target?.value)}});

watch(() => control.value.data, (newData) => {
  current.value = newData;
})
</script>
