<template>

  <div v-if="control.visible">
    <dispatch-renderer
        :visible="control.visible"
        :enabled="control.enabled"
        :schema="control.schema"
        :uischema="detailUiSchema"
        :path="control.path"
        :renderers="control.renderers"
        :cells="control.cells"
    />
    <!--    <additional-properties-->
    <!--        v-if="hasAdditionalProperties && showAdditionalProperties"-->
    <!--        :input="input"-->
    <!--    />-->
  </div>

</template>


<script lang="ts">
import {computed, defineComponent} from 'vue';
import type {ControlElement, GroupLayout, JsonFormsRendererRegistryEntry, UISchemaElement} from '@jsonforms/core';
import {findUISchema, Generate, isObjectControl, rankWith,} from '@jsonforms/core';
import type {RendererProps} from '@jsonforms/vue';
import {DispatchRenderer, rendererProps, useJsonFormsControlWithDetail} from '@jsonforms/vue';
import {useVanillaControl} from "@jsonforms/vue-vanilla";
import {useNested} from "../utils/composition"
import {cloneDeep, isEmpty, isObject} from "lodash";

const controlRenderer = defineComponent({
  name: 'object-renderer',
  components: {DispatchRenderer},
  props: {
    ...rendererProps<ControlElement>()
  },

  /**
   * @see https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/src/complex/ObjectRenderer.vue
   * @see https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/src/complex/components/AdditionalProperties.vue
   */
  setup(props: RendererProps<ControlElement>) {
    const input = useJsonFormsControlWithDetail(props);
    const control = (input.control as any).value as typeof input.control;
    const nested = useNested('object');

    const hasAdditionalProperties = computed((): boolean => {
      return (
          !isEmpty(control.schema.patternProperties) ||
          isObject(control.schema.additionalProperties)
          // do not support - additionalProperties === true - since then the type should be any and we won't know what kind of renderer we should use for new properties
      );
    });

    const showAdditionalProperties = computed((): boolean => {
      const showAdditionalProperties =
          control.uischema.options?.showAdditionalProperties;
      return (
          showAdditionalProperties === undefined ||
          showAdditionalProperties === true
      );
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


    return {
      ...useVanillaControl(input),
      nested,
      hasAdditionalProperties,
      showAdditionalProperties,
      detailUiSchema,
    };
  }
});

export default controlRenderer;
export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(2, isObjectControl)
};
</script>
