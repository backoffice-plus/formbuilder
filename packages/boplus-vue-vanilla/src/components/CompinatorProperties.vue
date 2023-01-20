<template>
  <div v-if="isLayoutWithElements">
    <dispatch-renderer
        :schema="otherProps"
        :path="path"
        :uischema="foundUISchema"
    />
  </div>
</template>


<script setup lang="ts">
/**
 * @see https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/src/complex/components/CombinatorProperties.vue
 */
import {Generate, JsonSchema, Layout} from '@jsonforms/core';
import omit from 'lodash/omit';
import {DispatchRenderer} from '@jsonforms/vue';

interface CombinatorProps {
  schema: JsonSchema;
  combinatorKeyword: 'oneOf' | 'anyOf' | 'allOf';
  path: string;
}
const props = defineProps<CombinatorProps>()

const otherProps = omit(props.schema, props.combinatorKeyword) as JsonSchema;
const foundUISchema = Generate.uiSchema(otherProps, 'VerticalLayout') as Layout;
const isLayoutWithElements = foundUISchema?.elements.length > 0;

</script>
