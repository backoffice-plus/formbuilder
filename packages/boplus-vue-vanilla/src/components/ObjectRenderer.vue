<template>

  <div v-if="control.visible">

    <AdditionalProperties
        v-if="hasAdditionalProperties && showAdditionalProperties"
        :input="input"
    />

    <dispatch-renderer
        v-bind="control"
        :uischema="detailUiSchema"
    />
  </div>

</template>


<script setup lang="ts">
import {computed, watch} from 'vue';
import type {ControlElement, GroupLayout, UISchemaElement} from '@jsonforms/core';
import {findUISchema, Generate,} from '@jsonforms/core';
import {DispatchRenderer, rendererProps, useJsonFormsControlWithDetail} from '@jsonforms/vue';
import {useVanillaControl} from "@jsonforms/vue-vanilla";
import {useNested} from "../utils/composition"
import {cloneDeep, isEmpty, isObject} from "lodash";
import AdditionalProperties from "./AdditionalProperties.vue";

/**
 * @see https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/src/complex/ObjectRenderer.vue
 * @see https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/src/complex/components/AdditionalProperties.vue
 */

const props = defineProps(rendererProps<ControlElement>());

const input = useVanillaControl(useJsonFormsControlWithDetail(props)) as any
const control = input.control;

const nested = useNested('object');

const hasAdditionalProperties = computed((): boolean => {
  return (
      !isEmpty(control.value.schema.patternProperties) ||
      isObject(control.value.schema.additionalProperties)
      // do not support - additionalProperties === true - since then the type should be any and we won't know what kind of renderer we should use for new properties
  );
});

const showAdditionalProperties = computed((): boolean => {
  const showAdditionalProperties = control.value.uischema.options?.showAdditionalProperties;
  return showAdditionalProperties === undefined || showAdditionalProperties === true;
});

const detailUiSchema = computed((): UISchemaElement => {
  const uiSchemaGenerator = () => {
    const uiSchema = Generate.uiSchema(control.value.schema, 'Group');
    if (isEmpty(control.value.path)) {
      uiSchema.type = 'VerticalLayout';
    } else {
      (uiSchema as GroupLayout).label = control.value.label;
    }
    return uiSchema;
  };
  let result = findUISchema(
      control.value.uischemas,
      control.value.schema,
      control.value.uischema.scope,
      control.value.path,
      uiSchemaGenerator,
      control.value.uischema,
      control.value.rootSchema
  );
  if (nested.level > 0) {
    result = cloneDeep(result);
    result.options = {
      ...result.options,
      bare: true,
      alignLeft: nested.level >= 4 || nested.parentElement === 'array',
    };
  }
  return result;
});

</script>
