<template>

  <control-wrapper
      v-bind="controlWrapper"
      :styles="styles"
      :isFocused="isFocused"
      :appliedOptions="appliedOptions"
  >

    <label class="toggle" :for="control.id + '-input'">

      <input type="checkbox"
             :id="control.id + '-input'"
             :class="styles.control.input"
             :disabled="!control.enabled"
             :autofocus="appliedOptions.focus"
             :checked="control.data"
             @focus="isFocused = true"
             @blur="isFocused = false"
             @change="e => handleChange(control.path, !!e.target.checked)"
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
  --bop-booleanToogle-slider: #fff;
  --bop-booleanToogle-background: #9ca3af;
  --bop-booleanToogle-background-active: #0284c7;
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
  background-color: var(--bop-booleanToogle-background);
}

.toggle .slider:before {
  background-color: var(--bop-booleanToogle-slider);
}

.toggle input:checked + .slider {
  background-color: var(--bop-booleanToogle-background-active);
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

<script lang="ts">
import {defineComponent} from 'vue';
import {rankWith, and, isBooleanControl, optionIs,} from '@jsonforms/core';
import type {ControlElement, JsonFormsRendererRegistryEntry,} from '@jsonforms/core';
import {rendererProps, useJsonFormsControl,} from '@jsonforms/vue';
import type {RendererProps,} from '@jsonforms/vue';
import {ControlWrapper} from "@jsonforms/vue-vanilla";
import {useBoPlusVanillaControl} from "./utils";

const controlRenderer = defineComponent({
  name: 'toggle-control-renderer',
  components: {
    ControlWrapper,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const control = useBoPlusVanillaControl(useJsonFormsControl(props), (value) => Number(value.value));

    return {
      ...control,
    }
  },

});
export default controlRenderer;
export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(3, and(isBooleanControl, optionIs('toggle', true))),
};
</script>
