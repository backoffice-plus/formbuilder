<template>

  <ControlWrapper
      v-bind="input.controlWrapper.value"
      :styles="input.styles"
      :isFocused="!!input.isFocused"
      :appliedOptions="input.appliedOptions"
  >

    <div class="flex">
      <input
          type="checkbox"
          :id="control.id + `-input`"
          :checked="undefined !== input.control.value.data"
          :disabled="!control.enabled"
          @change="onChange"
      />

      <input
          type="text"
          :disabled="undefined === input.control.value.data"
          :value="constScalar"
          readonly
      />
    </div>

  </ControlWrapper>

</template>


<script lang="ts">
import {rendererProps, useJsonFormsEnumControl} from '@jsonforms/vue';
import {useVanillaControl} from '@jsonforms/vue-vanilla/src/util';
import {rankWith, uiTypeIs} from "@jsonforms/core";
import type {ControlProps} from "@jsonforms/vue/src/jsonFormsCompositions";
import {ControlWrapper} from "@jsonforms/vue-vanilla";
import {and, schemaMatches} from "@jsonforms/core/src/testers/testers";


/**
 * https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/src/controls/EnumControlRenderer.vue
 */

export const constRenderer = {
  components: {ControlWrapper},
  props: rendererProps<ControlProps>(),
  setup(props: ControlProps) {
    const input = useVanillaControl(useJsonFormsEnumControl(props)) as any
    const control = input.control.value;

    const constValue = control.schema.const;
    const constScalar = 'object' === typeof constValue ? JSON.stringify(constValue) : constValue;

    const onChange = (e:any) => {
      const isChecked = e.target.checked;
      const value = isChecked ? constValue : undefined;
      input.onChange({target: {value: value}});
    }

    return {
      input,
      control,
      constScalar,
      onChange
    }
  }
}

export default constRenderer;
export const constEntry = {
  renderer: constRenderer,
  tester: rankWith(3, and(uiTypeIs('Control'), schemaMatches(schema => schema.hasOwnProperty('const'))))
};
</script>
