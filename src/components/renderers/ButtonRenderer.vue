<template>
  <ControlWrapper
      v-bind="bind"
      :styles="styles"
      :is-focused="isFocused"
      :applied-options="appliedOptions"
  >
    <button @click="onSubmit">{{ appliedOptions?.label ?? 'Submit' }}</button>

  </ControlWrapper>
</template>

<style scoped>
button {
  @apply
  border border-gray-400 rounded px-6 py-0.5
  bg-gray-100 hover:bg-gray-200
}
</style>

<script setup lang="ts">
import type {ControlElement,} from '@jsonforms/core';
import {rendererProps, useJsonFormsControl} from "@jsonforms/vue";
import {ControlWrapper, useVanillaControl} from "@jsonforms/vue-vanilla";
import {buttonRegistry} from "../../composables/buttonRegistry";
import {computed} from "vue";

const props = defineProps(rendererProps<ControlElement>())

const c = useVanillaControl(useJsonFormsControl(props));
const {control, controlWrapper:bind, styles, isFocused, appliedOptions} = c;

const onSubmit = () => {
  const data = control.value.data;
  const callback = buttonRegistry.value.get(data);

  callback?.();
}




</script>


<script lang="ts">
import {rankWith, uiTypeIs} from "@jsonforms/core";

export const tester = rankWith(1, uiTypeIs('Button'));
</script>
