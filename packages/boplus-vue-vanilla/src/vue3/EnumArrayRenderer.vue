<template>

  <!--
  :TODO add style classes
  -->
  <div :class="styles.enumArray.root" v-if="control.visible">


    <div v-for="(o, index) in control.options" :key="o.value"  :class="styles.enumArray.item">

      <label :for="control.id + `-input-${index}`">
        {{ o.label }}
      </label>

        <input
          type="checkbox"
          :id="control.id + `-input-${index}`"
          :value="o.value"
          :checked="isChecked(o)"
          :disabled="!control.enabled"
          @change="onChangeCheckbox"
        />
    </div>
  </div>

</template>


<script lang="ts">
import {defineComponent, ref} from 'vue';
import {rankWith, and, schemaMatches, uiTypeIs, schemaSubPathMatches, hasType,} from '@jsonforms/core';
import type {ControlElement, JsonFormsRendererRegistryEntry, JsonSchema} from '@jsonforms/core';
import {rendererProps, useJsonFormsControl, useJsonFormsMultiEnumControl} from '@jsonforms/vue';
import type {RendererProps} from '@jsonforms/vue';
import {ControlWrapper, useVanillaControl} from '@jsonforms/vue-vanilla';
import {useBoPlusVanillaControl} from "./utils";

/**
 * @see https://jsonforms-vuetify-renderers.netlify.app/#/example/multi-array
 * @see https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/src/complex/EnumArrayRenderer.vue
 */
const controlRenderer = defineComponent({
  name: 'enum-array-renderer',
  components: {
    ControlWrapper
  },
  props: {
    ...rendererProps<ControlElement>()
  },
  setup(props: RendererProps<ControlElement>) {
    return useBoPlusVanillaControl(useJsonFormsMultiEnumControl(props) as any);
  },

  methods: {
    isChecked(option:any) {
      return this.control.data?.includes(option.value)
    },
    onChangeCheckbox(event: Event | any) {
      const method = event?.target?.checked ? this.addItem : this.removeItem;
      method && method(this.control.path, event?.target?.value);
    }
  }
});

// const hasOneOfItems = (schema: JsonSchema): boolean => (schema?.oneOf ?? [] as JsonSchema[]).every((entry: JsonSchema) => entry.const !== undefined);
// const hasEnumItems = (schema: JsonSchema): boolean => schema.type === 'string' && schema.enum !== undefined;
const hasOneOfItems = (schema: JsonSchema): boolean =>
    schema.oneOf !== undefined &&
    schema.oneOf.length > 0 &&
    (schema.oneOf as JsonSchema[]).every((entry: JsonSchema) => {
        return entry.const !== undefined;
    });

const hasEnumItems = (schema: JsonSchema): boolean =>
    schema.type === 'string' && schema.enum !== undefined;

export default controlRenderer;
export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(5,
    and(
      uiTypeIs('Control'),
      and(
        schemaMatches((schema) => {
          return hasType(schema, 'array') && !Array.isArray(schema.items) && schema.uniqueItems === true
        }),
        schemaSubPathMatches('items', (schema) => {
          return hasOneOfItems(schema) || hasEnumItems(schema)
        }),
      ),
    ))
};

</script>
