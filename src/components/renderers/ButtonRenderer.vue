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
  background-color: var(--buttonSubmit-bg);
  border-color: var(--buttonSubmit-border);
  @apply
  border rounded px-6 py-0.5
}
button:hover {
  background-color: var(--buttonSubmit-bg-hover);
}
</style>

<script setup lang="ts">
import {inject} from "vue";
import type {ControlElement,} from '@jsonforms/core';
import {rendererProps, useJsonFormsControl} from "@jsonforms/vue";
import {ControlWrapper, useVanillaControl} from "@jsonforms/vue-vanilla";
import {resolveData, toDataPath} from "@jsonforms/core";

const props = defineProps(rendererProps<ControlElement>())

const jsonforms = inject('jsonforms') as any
const rootData = jsonforms?.core?.data;

const c = useVanillaControl(useJsonFormsControl(props));
const {control, controlWrapper:bind, styles, isFocused, appliedOptions} = c;

const onSubmit = () => {
  const value = control.value.data;
  const uischema = control.value.uischema

  const scopeCallback = uischema?.options?.scopeCallback;
  const path = scopeCallback && toDataPath(scopeCallback);
  const callback = path && resolveData(rootData, path);

  if(!callback) console.warn("could not resolve scopeCallback");

  callback?.(value);
}




</script>


<script lang="ts">
import {rankWith, uiTypeIs} from "@jsonforms/core";

export const tester = rankWith(1, uiTypeIs('Button'));
</script>
