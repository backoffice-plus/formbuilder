<template>

  <div v-if="control.visible">
    <dispatch-renderer
        v-bind="control"
        :uischema="detailUiSchema"
    />
    <!--    <additional-properties-->
    <!--        v-if="hasAdditionalProperties && showAdditionalProperties"-->
    <!--        :input="input"-->
    <!--    />-->
  </div>

</template>


<script setup lang="ts">
import {computed} from 'vue';
import type {ControlElement, GroupLayout, UISchemaElement} from '@jsonforms/core';
import {findUISchema, Generate,} from '@jsonforms/core';
import {DispatchRenderer, rendererProps, useJsonFormsControlWithDetail} from '@jsonforms/vue';
import {useVanillaControl} from "@jsonforms/vue-vanilla";
import {useNested} from "../utils/composition"
import {cloneDeep, isEmpty, isObject} from "lodash";

/**
 * @see https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/src/complex/ObjectRenderer.vue
 * @see https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/src/complex/components/AdditionalProperties.vue
 */

const props = defineProps(rendererProps<ControlElement>());

const input = useVanillaControl(useJsonFormsControlWithDetail(props)) as any

const control = input.control.value as any;
const nested = useNested('object');

const hasAdditionalProperties = computed((): boolean => {
  return (
      !isEmpty(control.schema.patternProperties) ||
      isObject(control.schema.additionalProperties)
      // do not support - additionalProperties === true - since then the type should be any and we won't know what kind of renderer we should use for new properties
  );
});

const showAdditionalProperties = computed((): boolean => {
  const showAdditionalProperties = control.uischema.options?.showAdditionalProperties;
  return showAdditionalProperties === undefined || showAdditionalProperties === true;
});

const detailUiSchema = computed((): UISchemaElement => {
  const uiSchemaGenerator = () => {
    const uiSchema = Generate.uiSchema(control.schema, 'Group');
    if (isEmpty(control.path)) {
      uiSchema.type = 'VerticalLayout';
    } else {
      (uiSchema as GroupLayout).label = control.label;
    }
    return uiSchema;
  };
  let result = findUISchema(
      control.uischemas,
      control.schema,
      control.uischema.scope,
      control.path,
      uiSchemaGenerator,
      control.uischema,
      control.rootSchema
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
