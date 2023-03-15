<template>

  <ControlWrapper
      v-bind="controlWrapper"
      :styles="styles"
      :isFocused="!!isFocused"
      :appliedOptions="appliedOptions"
  >

    <div class="flex">
      <input
          type="checkbox"
          :id="control.id + `-input`"
          :checked="undefined !== control.data"
          :disabled="!control.enabled"
          @change="onChecked"
      />

      <input
          type="text"
          :disabled="undefined === control.data"
          :value="constScalar"
          readonly
      />
    </div>

  </ControlWrapper>

</template>


<script lang="ts">
import {defineComponent} from "vue";
import {rankWith, uiTypeIs, and, schemaMatches} from "@jsonforms/core";
import type {ControlElement } from "@jsonforms/core";
import {rendererProps, useJsonFormsEnumControl} from '@jsonforms/vue';
import type {RendererProps } from "@jsonforms/vue";
import {ControlWrapper} from "@jsonforms/vue-vanilla";
import {useBoPlusVanillaControl} from "./utils";


/**
 * https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/src/controls/EnumControlRenderer.vue
 */
const constRenderer = defineComponent({
  name: 'enum-control-renderer',
  components: {
    ControlWrapper,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    return {...useBoPlusVanillaControl(useJsonFormsEnumControl(props)) as any}
  },
  computed: {
    constValue():any {
      return this.control.schema.const;
    },
    constScalar():any {
      return 'object' === typeof this.constValue ? JSON.stringify(this.constValue) : this.constValue;
    }
  },
  methods: {
    onChecked(e:any) {
      const isChecked = e.target.checked;
      const value = isChecked ? this.constValue : undefined;
      this.onChange({target: {value: value}});
    }
  }
});

export default constRenderer;
export const entry = {
  renderer: constRenderer,
  tester: rankWith(3, and(uiTypeIs('Control'), schemaMatches(schema => schema.hasOwnProperty('const'))))
};
</script>
