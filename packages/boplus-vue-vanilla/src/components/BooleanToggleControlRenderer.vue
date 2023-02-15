<template>

  <control-wrapper
      v-bind="input.controlWrapper.value"
      :styles="input.styles"
      :isFocused="!!input.isFocused"
      :appliedOptions="input.appliedOptions"
  >

    <label class="toggle" :for="control.id + '-input'">


      <input type="checkbox"
             :id="control.id + '-input'"
             :class="input.styles.control.input"
             :disabled="!control.enabled"
             :autofocus="input.appliedOptions.focus"
             :checked="control.data"
             @focus="input.isFocused = true"
             @blur="input.isFocused = false"
             @change="input.onChange"
      />
            <!--


              ref="checkbox"
              :label="computedLabel"
              :hint="control.description"
              :persistent-hint="persistentHint()"
              :error-messages="control.errors"
              :input-value="control.data"
              :true-value="true"
              :false-value="false"
              -->

      <span class="slider"/>
    </label>
  </control-wrapper>

</template>


<style>
:root {
  --slider-margin: 2px;
  --slider-height: 14px;
}
</style>

<style scoped>
.toggle {
  aspect-ratio: 16/9;
  height: var(--slider-height);
  @apply
  relative
  inline-block
}

.toggle input {
  @apply w-0 h-0 invisible
}

.toggle .slider {
  @apply
  absolute inset-0
  cursor-pointer
  rounded-full
}

.toggle .slider:before {
  content: "";
  left: var(--slider-margin);
  top: var(--slider-margin);
  bottom: var(--slider-margin);

  @apply
  absolute
  aspect-square
  rounded-full
}


.toggle:has(input:disabled)  {
  @apply opacity-50
}
.toggle:has(input:disabled) .slider  {
  @apply cursor-default
}

/*
 * Colors
 */
.toggle .slider {
  @apply bg-gray-400
}

.toggle .slider:before {
  @apply bg-white
}

.toggle input:checked + .slider {
  @apply bg-sky-600
}


/*
 * transition
 */
.toggle .slider {
  @apply transition-colors duration-300
}

.toggle .slider:before {
  @apply duration-300
}

.toggle input:checked + .slider:before {
  left: 100%;
  transform: translateX(calc(-100% - var(--slider-margin)));
}

</style>


<script setup lang="ts">
import type {ControlElement} from '@jsonforms/core';
import {rendererProps, useJsonFormsControl} from '@jsonforms/vue';
import {ControlWrapper, useVanillaControl} from "@jsonforms/vue-vanilla";

const props = defineProps(rendererProps<ControlElement>());

const input = useVanillaControl(useJsonFormsControl(props)) as any
const control = input.control;

input.onChange = (event: Event | any) => input.handleChange(input.control.value.path, !!event?.target?.checked);

</script>
