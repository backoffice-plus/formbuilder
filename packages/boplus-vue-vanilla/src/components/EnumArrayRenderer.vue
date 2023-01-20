<template>

  <div class="border border-black p-4 ">
    :TODO EnumControlRenderer
  </div>

</template>


<script lang="ts">
import {defineComponent} from 'vue';
import type {ControlElement, JsonFormsRendererRegistryEntry, JsonSchema} from '@jsonforms/core';
import {and, hasType, rankWith, schemaMatches, schemaSubPathMatches, uiTypeIs} from '@jsonforms/core';
import type {RendererProps} from '@jsonforms/vue';
import {DispatchRenderer, rendererProps} from '@jsonforms/vue';

const controlRenderer = defineComponent({
  name: 'enum-array-renderer',
  components: {DispatchRenderer},
  props: {
    ...rendererProps<ControlElement>()
  },

  /**
   * @see https://jsonforms-vuetify-renderers.netlify.app/#/example/multi-array
   * @see https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/src/complex/EnumArrayRenderer.vue
   */
  setup(props: RendererProps<ControlElement>) {
    return {}
  }
});

export default controlRenderer;

const hasOneOfItems = (schema: JsonSchema): boolean =>
    schema.oneOf !== undefined &&
    schema.oneOf.length > 0 &&
    (schema.oneOf as JsonSchema[]).every((entry: JsonSchema) => {
      return entry.const !== undefined;
    });
const hasEnumItems = (schema: JsonSchema): boolean =>
    schema.type === 'string' && schema.enum !== undefined;


export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(5,
      and(
          uiTypeIs('Control'),
          and(
              schemaMatches(
                  (schema) =>
                      hasType(schema, 'array') &&
                      !Array.isArray(schema.items) &&
                      schema.uniqueItems === true
              ),
              schemaSubPathMatches('items', (schema) => {
                return hasOneOfItems(schema) || hasEnumItems(schema);
              })
          )
      ))
};
</script>
