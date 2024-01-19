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

    <AdditionalProperties2
        v-if="hasAdditionalProperties && showAdditionalProperties"
        :input="input"
    ></AdditionalProperties2>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {Generate, findUISchema, isObjectControl, rankWith,} from '@jsonforms/core';
import {DispatchRenderer, rendererProps, useJsonFormsControlWithDetail, type RendererProps} from '@jsonforms/vue';
import {useVanillaControl} from '@jsonforms/vue-vanilla';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';
import isObject from 'lodash/isObject';
import {useNested} from "./composition";
import type {ControlElement, GroupLayout, JsonFormsRendererRegistryEntry, UISchemaElement,} from '@jsonforms/core';
import AdditionalProperties2 from "./AdditionalProperties2.vue";

const controlRenderer = defineComponent({
  name: 'ObjectRenderer',
  components: {
    AdditionalProperties2,
    DispatchRenderer,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const control = useVanillaControl(useJsonFormsControlWithDetail(props));
    const nested = useNested('object');
    return {
      ...control,
      input: control,
      nested,
    };
  },
  computed: {
    hasAdditionalProperties(): boolean {
      return (
          !isEmpty(this.control.schema.patternProperties) ||
          isObject(this.control.schema.additionalProperties)
          // do not support - additionalProperties === true - since then the type should be any and we won't know what kind of renderer we should use for new properties
      );
    },
    showAdditionalProperties(): boolean {
      const showAdditionalProperties =
          this.control.uischema.options?.showAdditionalProperties;
      return (
          showAdditionalProperties === undefined ||
          showAdditionalProperties === true
      );
    },
    detailUiSchema(): UISchemaElement {
      const uiSchemaGenerator = () => {
        const uiSchema = Generate.uiSchema(this.control.schema, 'Group');
        if (isEmpty(this.control.path)) {
          uiSchema.type = 'VerticalLayout';
        } else {
          (uiSchema as GroupLayout).label = this.control.label;
        }
        return uiSchema;
      };

      let result = findUISchema(
          this.control.uischemas,
          this.control.schema,
          this.control.uischema.scope,
          this.control.path,
          uiSchemaGenerator,
          this.control.uischema,
          this.control.rootSchema
      );


      if (this.nested.level > 0) {
        result = cloneDeep(result);
        result.options = {
          ...result.options,
          bare: true,
          alignLeft:
              this.nested.level >= 4 || this.nested.parentElement === 'array',
        };
      }

      return result;
    },
  },
});
export default controlRenderer;
export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(3, isObjectControl),
};
</script>
