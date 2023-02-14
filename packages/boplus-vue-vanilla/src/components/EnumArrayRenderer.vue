<template>

  <!--
  :TODO add style classes
  -->
  <div class="flex gap-2" v-if="control.visible">
    <div v-for="(o, index) in control.options" :key="o.value">

      <ControlWrapper
          v-bind="input.controlWrapper.value"
          :styles="input.styles"
          :isFocused="!!input.isFocused"
          :appliedOptions="input.appliedOptions"
      >
        <input
            type="checkbox"
            :id="control.id + `-input-${index}`"
            :checked="dataHasEnum(o.value)"
            :disabled="!control.enabled"
            @change="(value) => toggle(o.value, value.target.checked)"
        />
        <!--
            :label="o.label"
            :input-value="dataHasEnum(o.value)"
            :indeterminate="control.data === undefined"
            :path="composePaths(control.path, `${index}`)"
            :error-messages="control.errors"
            v-bind="vuetifyProps(`v-checkbox[${o.value}]`)"
            -->
      </ControlWrapper>
    </div>
  </div>

</template>


<script setup lang="ts">
import type {ControlElement} from '@jsonforms/core';
import {mapDispatchToMultiEnumProps, mapStateToMultiEnumControlProps} from '@jsonforms/core';
import {rendererProps, useControl} from '@jsonforms/vue';
import {ControlWrapper, useVanillaControl} from "@jsonforms/vue-vanilla";

/**
 * @see https://jsonforms-vuetify-renderers.netlify.app/#/example/multi-array
 * @see https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/src/complex/EnumArrayRenderer.vue
 */

const props = defineProps(rendererProps<ControlElement>());

const input = useVanillaControl(useControl(props, mapStateToMultiEnumControlProps, mapDispatchToMultiEnumProps)) as any
const control = input.control;

const dataHasEnum = (value: any) => !!input.control.value.data?.includes(value);
const toggle = (value: any, add: boolean) => {
  if (add) {
    input.addItem(input.control.value.path, value);
  } else {
    input.removeItem?.(input.control.value.path, value);
  }
};

</script>
